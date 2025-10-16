from fastapi import APIRouter, Depends
from ..controllers import investmentController as ctl
from ..models.investmentModel import InvestmentCreate
from ..utils.jwtHandler import get_current_user_id

router = APIRouter()


@router.post("")
async def create(payload: InvestmentCreate, user_id: str = Depends(get_current_user_id)):
    return await ctl.create_investment(user_id, payload)


@router.get("")
async def list(user_id: str = Depends(get_current_user_id)):
    return await ctl.list_investments(user_id)


@router.put("/{inv_id}")
async def update(inv_id: str, payload: dict, user_id: str = Depends(get_current_user_id)):
    return await ctl.update_investment(user_id, inv_id, payload)


@router.delete("/{inv_id}")
async def delete(inv_id: str, user_id: str = Depends(get_current_user_id)):
    return await ctl.delete_investment(user_id, inv_id)
