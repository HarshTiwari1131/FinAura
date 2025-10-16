from fastapi import APIRouter, Depends
from ..controllers import budgetController as ctl
from ..models.budgetModel import BudgetCreate
from ..utils.jwtHandler import get_current_user_id

router = APIRouter()


@router.post("")
async def create(payload: BudgetCreate, user_id: str = Depends(get_current_user_id)):
    return await ctl.create_budget(user_id, payload)


@router.get("")
async def list(user_id: str = Depends(get_current_user_id)):
    return await ctl.list_budgets(user_id)


@router.put("/{budget_id}")
async def update(budget_id: str, payload: dict, user_id: str = Depends(get_current_user_id)):
    return await ctl.update_budget(user_id, budget_id, payload)


@router.delete("/{budget_id}")
async def delete(budget_id: str, user_id: str = Depends(get_current_user_id)):
    return await ctl.delete_budget(user_id, budget_id)
