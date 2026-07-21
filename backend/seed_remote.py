import httpx
from datetime import datetime, timedelta
import time

BASE_URL = "https://churnager-production.up.railway.app"

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

def safe_post(url, payload):
    for i in range(3):
        try:
            res = httpx.post(url, json=payload, timeout=30.0)
            if res.status_code == 200:
                return res
            print(f"Error {res.status_code} posting to {url}: {res.text}")
        except Exception as e:
            print(f"Attempt {i+1} failed posting to {url}: {e}")
            time.sleep(2)
    return None

for c in customers_def:
    # Send customer creation + login event
    login_time = datetime.utcnow() - timedelta(days=c["days_since_login"])
    payload = {
        "customer": {
            "name": c["name"],
            "plan": c["plan"],
            "mrr_kes": c["mrr_kes"]
        },
        "event": {
            "customer_id": c["id"],
            "type": "login",
            "timestamp": login_time.isoformat() + "Z",
            "props": {}
        }
    }
    
    safe_post(f"{BASE_URL}/ingest", payload)

    # Failed payments
    for _ in range(c["failed_payments_30d"]):
        payload = {
            "event": {
                "customer_id": c["id"],
                "type": "payment_failed",
                "timestamp": (datetime.utcnow() - timedelta(days=5)).isoformat() + "Z",
                "props": {}
            }
        }
        safe_post(f"{BASE_URL}/ingest", payload)

    # Usage drop
    if c["usage_drop_pct"] > 0:
        payload = {
            "event": {
                "customer_id": c["id"],
                "type": "usage_drop",
                "timestamp": (datetime.utcnow() - timedelta(days=1)).isoformat() + "Z",
                "props": {"usage": c["usage_drop_pct"]}
            }
        }
        safe_post(f"{BASE_URL}/ingest", payload)

    # Downgrade
    if c["downgraded_recently"]:
        payload = {
            "event": {
                "customer_id": c["id"],
                "type": "downgrade_requested",
                "timestamp": (datetime.utcnow() - timedelta(days=2)).isoformat() + "Z",
                "props": {}
            }
        }
        safe_post(f"{BASE_URL}/ingest", payload)

    # Tickets
    for _ in range(c["tickets_7d"]):
        payload = {
            "event": {
                "customer_id": c["id"],
                "type": "support_ticket",
                "timestamp": (datetime.utcnow() - timedelta(days=3)).isoformat() + "Z",
                "props": {}
            }
        }
        safe_post(f"{BASE_URL}/ingest", payload)

print("Remote seeding completed.")
