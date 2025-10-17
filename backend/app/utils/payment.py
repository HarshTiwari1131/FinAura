import os
from typing import Dict, Any

import stripe

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
STRIPE_SUCCESS_URL = os.getenv("STRIPE_SUCCESS_URL", "http://localhost:5173/pay?status=success")
STRIPE_CANCEL_URL = os.getenv("STRIPE_CANCEL_URL", "http://localhost:5173/pay?status=cancel")

if STRIPE_SECRET_KEY:
    stripe.api_key = STRIPE_SECRET_KEY


async def create_checkout_session(amount_inr_paise: int, customer_ref: str) -> Dict[str, Any]:
    if not STRIPE_SECRET_KEY:
        raise RuntimeError("Missing STRIPE_SECRET_KEY")
    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        mode="payment",
        line_items=[{
            "price_data": {
                "currency": "inr",
                "product_data": {"name": "FinAura Credit"},
                "unit_amount": amount_inr_paise,
            },
            "quantity": 1,
        }],
        metadata={"userId": customer_ref},
        success_url=STRIPE_SUCCESS_URL + "&session_id={CHECKOUT_SESSION_ID}",
        cancel_url=STRIPE_CANCEL_URL,
    )
    return {"id": session.id, "url": session.url}


def verify_webhook(signature_header: str, payload: bytes) -> Dict[str, Any]:
    if not STRIPE_WEBHOOK_SECRET:
        raise RuntimeError("Missing STRIPE_WEBHOOK_SECRET")
    event = stripe.Webhook.construct_event(
        payload=payload,
        sig_header=signature_header,
        secret=STRIPE_WEBHOOK_SECRET,
    )
    return event
