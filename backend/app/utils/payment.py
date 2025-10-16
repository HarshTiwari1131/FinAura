import os
import hmac
import hashlib
from typing import Dict, Any

RAZORPAY_KEY = os.getenv("RAZORPAY_KEY", "rzp_test_key")
RAZORPAY_SECRET = os.getenv("RAZORPAY_SECRET", "rzp_test_secret")


async def create_order(amount_inr_paise: int, receipt: str) -> Dict[str, Any]:
    # In production, call Razorpay Orders API via SDK or HTTP.
    # Here we return a mockable structure shaped like Razorpay order.
    return {
        "id": f"order_{receipt}",
        "amount": amount_inr_paise,
        "currency": "INR",
        "receipt": receipt,
        "status": "created",
        "key": RAZORPAY_KEY,
    }


def verify_signature(order_id: str, payment_id: str, signature: str) -> bool:
    body = f"{order_id}|{payment_id}".encode()
    digest = hmac.new(RAZORPAY_SECRET.encode(), body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(digest, signature)
