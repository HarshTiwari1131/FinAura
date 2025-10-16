from typing import Optional
from pydantic import BaseModel
from .common import DBModel


class ExpenseCreate(BaseModel):
    category: str
    amount: float
    date: str
    note: Optional[str] = None
    paymentMethod: Optional[str] = None


class ExpenseOut(DBModel):
    userId: str
    category: str
    amount: float
    date: str
    note: Optional[str] = None
    paymentMethod: Optional[str] = None
