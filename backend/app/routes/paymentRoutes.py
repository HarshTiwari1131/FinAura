from fastapi import APIRouter, Depends, HTTPException
from ..utils.jwtHandler import get_current_user_id
from ..utils.payment import create_order, verify_signature

router = APIRouter()


@router.post("/initiate")
async def initiate(amount: int, user_id: str = Depends(get_current_user_id)):
    order = await create_order(amount_inr_paise=amount, receipt=user_id)
    return order


@router.post("/verify")
async def verify(order_id: str, payment_id: str, signature: str, user_id: str = Depends(get_current_user_id)):
    ok = verify_signature(order_id, payment_id, signature)
    if not ok:
        raise HTTPException(status_code=400, detail="Invalid signature")
    return {"verified": True}
