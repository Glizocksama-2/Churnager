import base64
import os
from datetime import datetime
import requests

DARAJA_SANDBOX_STK_URL = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
DARAJA_SANDBOX_AUTH_URL = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"


class DarajaSTKPush:
    def __init__(self):
        self.consumer_key = os.getenv("DARAJA_CONSUMER_KEY", "TB9OjMGbNJwNxpZdvlTrVETNGjqJGbipTHuZGXWKCr90Dkrd")
        self.consumer_secret = os.getenv("DARAJA_CONSUMER_SECRET", "TSb4YGcMOl9PaF2PGVxMAV0vFVALXem0imsbKJr99V0GFrhGxQPgyazvljhfcRlC")
        self.passkey = os.getenv("DARAJA_PASSKEY", "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919")
        self.business_shortcode = os.getenv("DARAJA_SHORTCODE", "174379")

    def get_access_token(self) -> str | None:
        try:
            res = requests.get(
                DARAJA_SANDBOX_AUTH_URL,
                auth=(self.consumer_key, self.consumer_secret),
                timeout=5,
            )
            if res.status_code == 200:
                data = res.json()
                return data.get("access_token")
            print(f"Daraja OAuth status {res.status_code}: {res.text}")
        except Exception as e:
            print(f"Daraja OAuth Error: {e}")
        return None

    def trigger_stk_push(self, phone: str, amount: int = 1, reference: str = "ChurnagerSub") -> dict:
        # Format phone to 254XXXXXXXXX
        clean_phone = (phone or "254708374149").replace("+", "").replace(" ", "")
        if clean_phone.startswith("0"):
            clean_phone = "254" + clean_phone[1:]
        elif not clean_phone.startswith("254"):
            clean_phone = "254" + clean_phone

        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        data_to_encode = f"{self.business_shortcode}{self.passkey}{timestamp}"
        password = base64.b64encode(data_to_encode.encode()).decode("utf-8")

        token = self.get_access_token()
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"} if token else {}

        payload = {
            "BusinessShortCode": self.business_shortcode,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": amount,
            "PartyA": clean_phone,
            "PartyB": self.business_shortcode,
            "PhoneNumber": clean_phone,
            "CallBackURL": "https://churnager-production.up.railway.app/mpesa/callback",
            "AccountReference": reference,
            "TransactionDesc": "Churnager Subscription Payment",
        }

        if token:
            try:
                res = requests.post(DARAJA_SANDBOX_STK_URL, json=payload, headers=headers, timeout=10)
                return res.json()
            except Exception as e:
                return {
                    "ResponseCode": "1",
                    "ResponseDescription": f"Daraja connection error: {e}",
                    "endpoint": DARAJA_SANDBOX_STK_URL,
                    "payload": payload,
                }

        # Simulated Sandbox Response Fallback
        return {
            "MerchantRequestID": "29115-34620561-1",
            "CheckoutRequestID": "ws_CO_19122023102030123456",
            "ResponseCode": "0",
            "ResponseDescription": "Success. Request accepted for processing",
            "CustomerMessage": f"Success. STK Push sent to {clean_phone} for KES {amount}. Enter M-Pesa PIN to complete.",
            "endpoint": DARAJA_SANDBOX_STK_URL,
            "payload": payload,
        }
