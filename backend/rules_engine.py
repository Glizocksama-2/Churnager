import os
import yaml

CONFIG_PATH = os.path.join(os.path.dirname(__file__), "config", "risk_rules_v1.yaml")

class RulesEngine:
    def __init__(self):
        self.rules = {}
        self.tiers = {}
        self.load_config()

    def load_config(self):
        try:
            with open(CONFIG_PATH, "r") as f:
                config = yaml.safe_load(f)
                self.rules = config.get("rules", {})
                self.tiers = config.get("tiers", {})
        except Exception as e:
            print(f"Error loading risk rules config: {e}")
            # Fallback config
            self.rules = {
                "login_recency": {"weight": 30, "threshold_days": 14},
                "payment_failures": {"weight": 25, "threshold_failed": 2},
                "usage_drop": {"weight": 20, "threshold_pct": 50},
                "plan_downgrade": {"weight": 15, "boolean": True},
                "support_spike": {"weight": 10, "threshold_tickets": 3}
            }
            self.tiers = {
                "critical": 70,
                "high": 50,
                "medium": 30,
                "low": 0
            }

    def compute_score(self, customer_data: dict) -> tuple[float, str, list[dict]]:
        score = 0.0
        signals = []

        # 1. Login Recency
        login_rule = self.rules.get("login_recency", {})
        days_since_login = customer_data.get("days_since_login", 0)
        login_points = 0
        if days_since_login > login_rule.get("threshold_days", 14):
            login_points = login_rule.get("weight", 30)
            score += login_points
            signals.append({
                "name": "login_recency",
                "weight": login_rule.get("weight", 30),
                "raw_value": days_since_login,
                "points": login_points,
                "threshold_met": True
            })

        # 2. Payment Failures
        payment_rule = self.rules.get("payment_failures", {})
        failed_payments = customer_data.get("failed_payments_30d", 0)
        payment_points = 0
        if failed_payments >= payment_rule.get("threshold_failed", 2):
            payment_points = payment_rule.get("weight", 25)
            score += payment_points
            signals.append({
                "name": "payment_failures",
                "weight": payment_rule.get("weight", 25),
                "raw_value": failed_payments,
                "points": payment_points,
                "threshold_met": True
            })

        # 3. Usage Drop
        usage_rule = self.rules.get("usage_drop", {})
        usage_drop_pct = customer_data.get("usage_drop_pct", 0)
        usage_points = 0
        if usage_drop_pct >= usage_rule.get("threshold_pct", 50):
            usage_points = usage_rule.get("weight", 20)
            score += usage_points
            signals.append({
                "name": "usage_drop",
                "weight": usage_rule.get("weight", 20),
                "raw_value": usage_drop_pct,
                "points": usage_points,
                "threshold_met": True
            })

        # 4. Plan Downgrade
        downgrade_rule = self.rules.get("plan_downgrade", {})
        downgraded = customer_data.get("downgraded_recently", False)
        downgrade_points = 0
        if downgraded:
            downgrade_points = downgrade_rule.get("weight", 15)
            score += downgrade_points
            signals.append({
                "name": "plan_downgrade",
                "weight": downgrade_rule.get("weight", 15),
                "raw_value": int(downgraded),
                "points": downgrade_points,
                "threshold_met": True
            })

        # 5. Support Spike
        support_rule = self.rules.get("support_spike", {})
        tickets = customer_data.get("tickets_7d", 0)
        support_points = 0
        if tickets >= support_rule.get("threshold_tickets", 3):
            support_points = support_rule.get("weight", 10)
            score += support_points
            signals.append({
                "name": "support_spike",
                "weight": support_rule.get("weight", 10),
                "raw_value": tickets,
                "points": support_points,
                "threshold_met": True
            })

        tier = self.get_tier(score)
        return min(100.0, score), tier, signals

    def get_tier(self, score: float) -> str:
        if score >= self.tiers.get("critical", 70):
            return "critical"
        if score >= self.tiers.get("high", 50):
            return "high"
        if score >= self.tiers.get("medium", 30):
            return "medium"
        return "low"
