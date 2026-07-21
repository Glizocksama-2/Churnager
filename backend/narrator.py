import os
import json
from ollama import Client

PROMPT_TEMPLATE_PATH = os.path.join(os.path.dirname(__file__), "config", "narration_prompt.yaml")

class Narrator:
    def __init__(self):
        self.template = ""
        self.load_template()

    def load_template(self):
        try:
            import yaml
            with open(PROMPT_TEMPLATE_PATH, "r", encoding="utf-8") as f:
                config = yaml.safe_load(f)
                self.template = config.get("prompt_template", "")
        except Exception as e:
            print(f"Error loading prompt template: {e}")
            self.template = (
                "Risk Alert\n"
                "Customer: {name}\n"
                "Status: {tier} risk score: {score}\n"
                "Key Drivers: {drivers}\n"
                "Recommended Action: outreach immediately"
            )

    def template_narration(self, name: str, score: float, tier: str, signals: list[dict]) -> str:
        drivers = ", ".join([f"{sig['name']} ({sig['raw_value']})" for sig in signals]) or "No active risk signals detected."
        return self.template.format(
            name=name,
            score=round(score),
            tier=tier.upper(),
            signals=json.dumps(signals),
            drivers=drivers
        )

    def narrate(self, customer_name: str, score: float, tier: str, signals: list[dict]) -> str:
        drivers = ", ".join([f"{sig['name']} ({sig['raw_value']})" for sig in signals]) or "No active risk signals detected."
        
        try:
            client = Client(host="http://localhost:11434")
            prompt = self.template.format(
                name=customer_name,
                score=round(score),
                tier=tier.upper(),
                signals=json.dumps(signals),
                drivers=drivers
            )
            
            # Non-interactive timeout block
            response = client.generate(
                model="phi3:mini",
                prompt=prompt,
                options={"temperature": 0.2}
            )
            
            narration_text = response.get("response", "").strip()
            if narration_text:
                return narration_text
                
        except Exception as e:
            print(f"Ollama generation failed or timed out: {e}. Falling back to template-based narration.")
            
        return self.template_narration(customer_name, score, tier, signals)
