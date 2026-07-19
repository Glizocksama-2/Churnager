import random
import httpx
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler

def run_ingestion_job():
    try:
        # Choose a random customer between 1 and 10
        customer_id = random.randint(1, 10)
        
        # Random event types
        event_types = ["payment_failed", "support_ticket", "usage_drop", "login", "invoice_paid"]
        chosen_event = random.choice(event_types)
        
        payload = {
            "event": {
                "customer_id": customer_id,
                "type": chosen_event,
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "props": {"trigger": "scheduler"}
            }
        }
        
        # Post to internal ingest endpoint
        with httpx.Client() as client:
            response = client.post("http://localhost:8000/ingest", json=payload, timeout=5.0)
            if response.status_code == 200:
                print(f"Scheduler successfully ingested {chosen_event} event for customer {customer_id}")
            else:
                print(f"Scheduler failed to ingest: {response.text}")
    except Exception as e:
        print(f"Error in scheduler job execution: {e}")

def start_scheduler():
    scheduler = BackgroundScheduler()
    # Execute every 5 minutes
    scheduler.add_job(run_ingestion_job, 'interval', minutes=5)
    scheduler.start()
    print("APScheduler Background Scheduler started.")
    return scheduler
