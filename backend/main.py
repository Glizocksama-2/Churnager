from datetime import datetime
from typing import Any

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import desc, func
from sqlalchemy.orm import Session, joinedload

from database import Base, engine, get_db
from models import Alert, Customer, Event
from rules_engine import RulesEngine
from narrator import Narrator
from scheduler import start_scheduler

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Churnager", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rules_engine = RulesEngine()
narrator = Narrator()


class IngestEvent(BaseModel):
    customer_id: int
    type: str = Field(min_length=1)
    timestamp: datetime | None = None
    props: dict[str, Any] = Field(default_factory=dict)


class IngestRequest(BaseModel):
    customer: dict[str, Any] | None = None
    event: IngestEvent


class AlertOut(BaseModel):
    id: int
    customer_id: int
    customer_name: str
    plan: str
    mrr_kes: float
    score: float
    tier: str
    signals: list[dict[str, Any]]
    narration: str
    created_at: datetime
    handled_at: datetime | None


def alert_to_dict(alert: Alert) -> AlertOut:
    customer = alert.customer
    return AlertOut(
        id=alert.id,
        customer_id=alert.customer_id,
        customer_name=customer.name,
        plan=customer.plan,
        mrr_kes=customer.mrr_kes,
        score=alert.score,
        tier=alert.tier,
        signals=alert.signals,
        narration=alert.narration,
        created_at=alert.created_at,
        handled_at=alert.handled_at,
    )


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/ingest", response_model=AlertOut)
def ingest(payload: IngestRequest, db: Session = Depends(get_db)) -> AlertOut:
    customer = db.get(Customer, payload.event.customer_id)
    if customer is None:
        if not payload.customer:
            raise HTTPException(status_code=404, detail="Customer not found; include customer data to create one.")
        customer = Customer(
            id=payload.event.customer_id,
            name=payload.customer.get("name", f"Customer {payload.event.customer_id}"),
            plan=payload.customer.get("plan", "Starter"),
            mrr_kes=float(payload.customer.get("mrr_kes", 0)),
        )
        db.add(customer)
        db.flush()

    event = Event(
        customer_id=customer.id,
        type=payload.event.type,
        timestamp=payload.event.timestamp or datetime.utcnow(),
        props=payload.event.props,
    )
    db.add(event)
    db.flush()

    # Query 30-day stats to compute risk
    recent_events = (
        db.query(Event)
        .filter(Event.customer_id == customer.id)
        .all()
    )
    
    # Simple aggregation for the rules engine
    failed_payments = sum(1 for e in recent_events if e.type == "payment_failed")
    tickets = sum(1 for e in recent_events if e.type == "support_ticket")
    downgraded = any(e.type == "downgrade_requested" for e in recent_events)
    
    # Calculate login recency
    logins = []
    for e in recent_events:
        if e.type == "login":
            ts = e.timestamp
            if ts.tzinfo is not None:
                ts = ts.replace(tzinfo=None)
            logins.append(ts)
    if logins:
        days_since_login = (datetime.utcnow() - max(logins)).days
    else:
        days_since_login = 30 # default if no logins

    # Usage drop calculation
    usage_events = [e.props.get("usage", 100) for e in recent_events if e.type == "usage_drop"]
    usage_drop_pct = usage_events[0] if usage_events else 0

    customer_data = {
        "days_since_login": days_since_login,
        "failed_payments_30d": failed_payments,
        "usage_drop_pct": usage_drop_pct,
        "downgraded_recently": downgraded,
        "tickets_7d": tickets
    }

    score, tier, signals = rules_engine.compute_score(customer_data)
    narration = narrator.narrate(customer.name, score, tier, signals)

    alert = Alert(
        customer_id=customer.id,
        score=score,
        tier=tier,
        signals=signals,
        narration=narration,
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert_to_dict(alert)


@app.get("/risk/{id}", response_model=AlertOut)
def get_risk(id: int, db: Session = Depends(get_db)) -> AlertOut:
    alert = (
        db.query(Alert)
        .options(joinedload(Alert.customer))
        .filter(Alert.customer_id == id)
        .order_by(desc(Alert.created_at))
        .first()
    )
    if alert is None:
        customer = db.get(Customer, id)
        if customer is None:
            raise HTTPException(status_code=404, detail="Customer not found")
        # Compute dynamic risk
        score, tier, signals = rules_engine.compute_score({"days_since_login": 5})
        alert = Alert(
            customer_id=id,
            score=score,
            tier=tier,
            signals=signals,
            narration=narrator.narrate(customer.name, score, tier, signals),
        )
        db.add(alert)
        db.commit()
        db.refresh(alert)
    return alert_to_dict(alert)


@app.get("/alerts", response_model=list[AlertOut])
def get_alerts(db: Session = Depends(get_db), include_handled: bool = False) -> list[AlertOut]:
    latest_ids = (
        db.query(func.max(Alert.id))
        .group_by(Alert.customer_id)
        .subquery()
    )
    query = db.query(Alert).options(joinedload(Alert.customer)).filter(Alert.id.in_(latest_ids)).order_by(desc(Alert.created_at))
    if not include_handled:
        query = query.filter(Alert.handled_at.is_(None))
    return [alert_to_dict(alert) for alert in query.all()]


@app.post("/alerts/{alert_id}/handled", response_model=AlertOut)
def mark_handled(alert_id: int, db: Session = Depends(get_db)) -> AlertOut:
    alert = db.get(Alert, alert_id)
    if alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.handled_at = datetime.utcnow()
    db.commit()
    db.refresh(alert)
    return alert_to_dict(alert)


@app.post("/seed")
def seed_endpoint() -> dict[str, str]:
    from seed import seed_data
    seed_data()
    return {"status": "seeded"}


class STKPushRequest(BaseModel):
    phone: str
    amount: int = 1
    reference: str = "ChurnagerSub"


@app.post("/mpesa/stkpush")
def trigger_mpesa_stk(payload: STKPushRequest) -> dict:
    from mpesa import DarajaSTKPush
    client = DarajaSTKPush()
    return client.trigger_stk_push(
        phone=payload.phone,
        amount=payload.amount,
        reference=payload.reference,
    )


@app.post("/mpesa/callback")
def mpesa_callback(body: dict[str, Any]) -> dict[str, str]:
    print(f"M-Pesa Daraja Callback Received: {body}")
    return {"ResultCode": "0", "ResultDesc": "Accepted"}


@app.on_event("startup")
def startup() -> None:
    # Load rules and narrator configs
    rules_engine.load_config()
    narrator.load_template()
    # Auto-seed database if empty
    from database import SessionLocal
    db = SessionLocal()
    try:
        if db.query(Customer).count() == 0:
            print("Auto-seeding demo database on startup...")
            from seed import seed_data
            seed_data()
    except Exception as e:
        print(f"Auto-seed warning: {e}")
    finally:
        db.close()
    # Start background scheduler
    start_scheduler()
