from fastapi import APIRouter, Depends, HTTPException, Request
from ..utils.dbConnect import get_db
from ..utils.ids import to_obj_id
import stripe
from ..utils.jwtHandler import get_current_user_id
from ..utils.payment import create_checkout_session, verify_webhook
from ..utils.notifier import notify

router = APIRouter()


@router.post("/initiate")
async def initiate(amount: int, user_id: str = Depends(get_current_user_id)):
    session = await create_checkout_session(amount_inr_paise=amount, customer_ref=user_id)
    return session


@router.post("/webhook")
async def webhook(request: Request):
    payload = await request.body()
    sig = request.headers.get('stripe-signature', '')
    event = verify_webhook(sig, payload)
    # Handle a subset of events
    if event['type'] == 'checkout.session.completed':
        # Credit user's wallet
        db = await get_db()
        users = db.get_collection("users")
        session = event['data']['object']
        user_id = session.get('metadata', {}).get('userId')
        amount_total = int(session.get('amount_total') or 0)  # paise
        if user_id and amount_total > 0:
            rupees = amount_total // 100
            oid = to_obj_id(user_id)
            if oid:
                await users.update_one({"_id": oid}, {"$inc": {"walletBalance": rupees}})
                try:
                    await notify(db, user_id, type="wallet", title=f"Wallet credited ₹{rupees}", text="Stripe payment successful")
                except Exception:
                    pass
    return {"received": True}


@router.get("/confirm")
async def confirm(session_id: str, user_id: str = Depends(get_current_user_id)):
    """Client calls this on success redirect with session_id to finalize and reflect wallet balance immediately."""
    # Retrieve session from Stripe and credit if not already processed
    db = await get_db()
    users = db.get_collection("users")
    try:
        s = stripe.checkout.Session.retrieve(session_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid session")
    if (s.get('payment_status') == 'paid'):
        meta_uid = s.get('metadata', {}).get('userId')
        if meta_uid == user_id:
            amount_total = int(s.get('amount_total') or 0)
            rupees = amount_total // 100
            oid = to_obj_id(user_id)
            if oid and rupees > 0:
                # Idempotent credit using a marker on user doc
                marker = f"stripe_session_{s.get('id')}"
                res = await users.update_one(
                    {"_id": oid, marker: {"$ne": True}},
                    {"$inc": {"walletBalance": rupees}, "$set": {marker: True}}
                )
                if res.modified_count > 0:
                    try:
                        db = await get_db()
                        await notify(db, user_id, type="wallet", title=f"Wallet credited ₹{rupees}", text="Stripe payment successful")
                    except Exception:
                        pass
                # Even if already credited, return current balance
    user = await users.find_one({"_id": to_obj_id(user_id)}, {"passwordHash": 0})
    return {"walletBalance": int(user.get("walletBalance", 0)) if user else 0}
