from fastapi import APIRouter, Depends
from ..controllers import incomeController as ctl
from ..models.incomeModel import IncomeCreate
from ..utils.jwtHandler import get_current_user_id

router = APIRouter()


@router.post("")
async def create(payload: IncomeCreate, user_id: str = Depends(get_current_user_id)):
    return await ctl.create_income(user_id, payload)


@router.get("")
async def list(user_id: str = Depends(get_current_user_id)):
    return await ctl.list_income(user_id)


@router.put("/{income_id}")
async def update(income_id: str, payload: dict, user_id: str = Depends(get_current_user_id)):
    return await ctl.update_income(user_id, income_id, payload)


@router.delete("/{income_id}")
async def delete(income_id: str, user_id: str = Depends(get_current_user_id)):
    return await ctl.delete_income(user_id, income_id)
