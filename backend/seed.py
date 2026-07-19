from datetime import datetime, timedelta
import random
from database import SessionLocal, engine, Base
from models import Customer, Event, Alert
from rules_engine import RulesEngine
from narrator import Narrator

Base.metadata.create_all(bind=engine)

def seed_data():
    db = SessionLocal()
    try:
        # Clear existing data
        db.query(Alert).delete()
        db.query(Event).delete()
        db.query(Customer).delete()
        db.commit()

        # 10 Customers with realistic Kenyan names
        customers_def = [
            # 2 Critical
            {"id": 1, "name": "Safaricom Agent Portal", "plan": "Scale", "mrr_kes": 480000, "days_since_login": 20, "failed_payments_30d": 3, "usage_drop_pct": 75, "downgraded_recently": True, "tickets_7d": 4},
            {"id": 2, "name": "Kilimall Logistics Hub", "plan": "Growth", "mrr_kes": 180000, "days_since_login": 16, "failed_payments_30d": 2, "usage_drop_pct": 60, "downgraded_recently": False, "tickets_7d": 3},
            # 2 High
            {"id": 3, "name": "Twiga Distributors Ltd", "plan": "Growth", "mrr_kes": 150000, "days_since_login": 15, "failed_payments_30d": 0, "usage_drop_pct": 55, "downgraded_recently": False, "tickets_7d": 4},
            {"id": 4, "name": "Boma Capital Managers", "plan": "Pro", "mrr_kes": 220000, "days_since_login": 8, "failed_payments_30d": 2, "usage_drop_pct": 10, "downgraded_recently": True, "tickets_7d": 1},
            # 3 Medium
            {"id": 5, "name": "Soko Retailers Kenya", "plan": "Starter", "mrr_kes": 45000, "days_since_login": 3, "failed_payments_30d": 1, "usage_drop_pct": 40, "downgraded_recently": False, "tickets_7d": 1},
            {"id": 6, "name": "Savannah Agritech", "plan": "Starter", "mrr_kes": 55000, "days_since_login": 12, "failed_payments_30d": 0, "usage_drop_pct": 20, "downgraded_recently": False, "tickets_7d": 2},
            {"id": 7, "name": "Nairobi Coffee Exporters", "plan": "Growth", "mrr_kes": 130000, "days_since_login": 5, "failed_payments_30d": 1, "usage_drop_pct": 15, "downgraded_recently": False, "tickets_7d": 0},
            # 3 Low/Stable
            {"id": 8, "name": "Mara Analytics Solutions", "plan": "Scale", "mrr_kes": 320000, "days_since_login": 1, "failed_payments_30d": 0, "usage_drop_pct": 5, "downgraded_recently": False, "tickets_7d": 0},
            {"id": 9, "name": "Kazi Workspace Nairobi", "plan": "Pro", "mrr_kes": 95000, "days_since_login": 2, "failed_payments_30d": 0, "usage_drop_pct": 8, "downgraded_recently": False, "tickets_7d": 1},
            {"id": 10, "name": "Zuri Beauty Africa", "plan": "Starter", "mrr_kes": 38000, "days_since_login": 2, "failed_payments_30d": 0, "usage_drop_pct": 0, "downgraded_recently": False, "tickets_7d": 0},
        ]

        rules_engine = RulesEngine()
        narrator = Narrator()

        for c_data in customers_def:
            customer = Customer(
                id=c_data["id"],
                name=c_data["name"],
                plan=c_data["plan"],
                mrr_kes=c_data["mrr_kes"]
            )
            db.add(customer)
            db.flush()

            # Seed 30 days of events per customer
            base_time = datetime.utcnow() - timedelta(days=30)
            
            # Simple simulation of events based on customer status
            for day in range(30):
                event_time = base_time + timedelta(days=day, hours=random.randint(1, 23))
                
                # Active customers generate frequent logins & payments
                if c_data["id"] in [8, 9, 10]:
                    if day % 2 == 0:
                        db.add(Event(customer_id=customer.id, type="login", timestamp=event_time, props={"ip": "192.168.1.1"}))
                    if day in [10, 20]:
                        db.add(Event(customer_id=customer.id, type="invoice_paid", timestamp=event_time, props={"amount": c_data["mrr_kes"]}))
                
                # Risky customers generate logins, support tickets, downgrades or failed payments
                else:
                    if day < 15 and day % 3 == 0:
                        db.add(Event(customer_id=customer.id, type="login", timestamp=event_time))
                    if day in [5, 12, 19] and c_data["failed_payments_30d"] > 0:
                        db.add(Event(customer_id=customer.id, type="payment_failed", timestamp=event_time, props={"reason": "insufficient_funds"}))
                    if day in [10, 24] and c_data["tickets_7d"] > 0:
                        db.add(Event(customer_id=customer.id, type="support_ticket", timestamp=event_time, props={"category": "billing"}))
                    if day == 28 and c_data["downgraded_recently"]:
                        db.add(Event(customer_id=customer.id, type="downgrade_requested", timestamp=event_time))

            db.commit()

            # Run initial scoring + alert creation
            score, tier, signals = rules_engine.compute_score(c_data)
            narration = narrator.narrate(customer.name, score, tier, signals)
            
            alert = Alert(
                customer_id=customer.id,
                score=score,
                tier=tier,
                signals=signals,
                narration=narration
            )
            db.add(alert)

        db.commit()
        print("Successfully seeded 10 customers, events, and initial risk alerts.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
