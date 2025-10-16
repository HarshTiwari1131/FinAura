from fastapi import APIRouter, Depends
from ..controllers import expenseController as ctl
from ..models.expenseModel import ExpenseCreate
from ..utils.jwtHandler import get_current_user_id

router = APIRouter()


@router.post("")
async def create(payload: ExpenseCreate, user_id: str = Depends(get_current_user_id)):
    return await ctl.create_expense(user_id, payload)


@router.get("")
async def list(category: str | None = None, user_id: str = Depends(get_current_user_id)):
    return await ctl.list_expenses(user_id, category)


@router.put("/{expense_id}")
async def update(expense_id: str, payload: dict, user_id: str = Depends(get_current_user_id)):
    return await ctl.update_expense(user_id, expense_id, payload)


@router.delete("/{expense_id}")
async def delete(expense_id: str, user_id: str = Depends(get_current_user_id)):
    return await ctl.delete_expense(user_id, expense_id)
from fastapi import APIRouter, Depends
from ..controllers import expenseController as ctl
from ..models.expenseModel import ExpenseCreate
from ..utils.jwtHandler import get_current_user_id

router = APIRouter()


@router.post("")
async def create(payload: ExpenseCreate, user_id: str = Depends(get_current_user_id)):
    return await ctl.create_expense(user_id, payload)


@router.get("")
async def list(category: str | None = None, user_id: str = Depends(get_current_user_id)):
    return await ctl.list_expenses(user_id, category)


@router.put("/{expense_id}")
async def update(expense_id: str, payload: dict, user_id: str = Depends(get_current_user_id)):
    return await ctl.update_expense(user_id, expense_id, payload)


@router.delete("/{expense_id}")
async def delete(expense_id: str, user_id: str = Depends(get_current_user_id)):
    return await ctl.delete_expense(user_id, expense_id)
