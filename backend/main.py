from datetime import datetime
from typing import Any

from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import Alert, Customer, Event

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Angaza Churn Alert", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

scheduler = BackgroundScheduler()


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


def tier_for_score(score: float) -> str:
    if score >= 75:
        return "critical"
    if score >= 50:
        return "watch"
    return "stable"


def score_customer(db: Session, customer_id: int) -> tuple[float, list[dict[str, Any]]]:
    recent_events = (
        db.query(Event)
        .filter(Event.customer_id == customer_id)
        .order_by(desc(Event.timestamp))
        .limit(25)
        .all()
    )
    weights = {
        "payment_failed": 35,
        "support_ticket": 18,
        "usage_drop": 24,
        "downgrade_requested": 40,
        "login": -4,
        "invoice_paid": -12,
    }
    raw_score = 20
    signals: list[dict[str, Any]] = []
    for event in recent_events:
        weight = weights.get(event.type, 5)
        raw_score += weight
        if weight > 0:
            signals.append({"type": event.type, "weight": weight, "detail": event.props})

    score = max(0, min(100, raw_score))
    return score, signals[:5]


def build_narration(customer: Customer, score: float, signals: list[dict[str, Any]]) -> str:
    if not signals:
        return f"{customer.name} is currently low risk. No strong churn signals have been detected."
    top = signals[0]["type"].replace("_", " ")
    return (
        f"{customer.name} is at {tier_for_score(score)} churn risk with a score of {round(score)}. "
        f"The strongest current signal is {top}; review outreach history before the next billing cycle."
    )


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

    score, signals = score_customer(db, customer.id)
    alert = Alert(
        customer_id=customer.id,
        score=score,
        tier=tier_for_score(score),
        signals=signals,
        narration=build_narration(customer, score, signals),
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert_to_dict(alert)


@app.get("/risk/{id}", response_model=AlertOut)
def get_risk(id: int, db: Session = Depends(get_db)) -> AlertOut:
    alert = (
        db.query(Alert)
        .filter(Alert.customer_id == id)
        .order_by(desc(Alert.created_at))
        .first()
    )
    if alert is None:
        customer = db.get(Customer, id)
        if customer is None:
            raise HTTPException(status_code=404, detail="Customer not found")
        score, signals = score_customer(db, id)
        alert = Alert(
            customer_id=id,
            score=score,
            tier=tier_for_score(score),
            signals=signals,
            narration=build_narration(customer, score, signals),
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
    query = db.query(Alert).filter(Alert.id.in_(latest_ids)).order_by(desc(Alert.created_at))
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


def seed_demo_data() -> None:
    db = next(get_db())
    try:
        if db.query(Customer).count():
            return
        customers = [
            Customer(id=1, name="Mavuno Logistics", plan="Growth", mrr_kes=128000),
            Customer(id=2, name="SokoPay Retail", plan="Scale", mrr_kes=242000),
            Customer(id=3, name="Twiga Clinics", plan="Starter", mrr_kes=58000),
        ]
        db.add_all(customers)
        db.commit()
        for event_type, customer_id in [
            ("payment_failed", 1),
            ("support_ticket", 1),
            ("usage_drop", 2),
            ("invoice_paid", 3),
        ]:
            db.add(Event(customer_id=customer_id, type=event_type, props={"source": "seed"}))
        db.commit()
        for customer in customers:
            score, signals = score_customer(db, customer.id)
            db.add(
                Alert(
                    customer_id=customer.id,
                    score=score,
                    tier=tier_for_score(score),
                    signals=signals,
                    narration=build_narration(customer, score, signals),
                )
            )
        db.commit()
    finally:
        db.close()


@app.on_event("startup")
def startup() -> None:
    seed_demo_data()
    if not scheduler.running:
        scheduler.start()
