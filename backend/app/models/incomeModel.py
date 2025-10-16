from typing import Optional
from pydantic import BaseModel
from .common import DBModel


class IncomeCreate(BaseModel):
    source: str
    amount: float
    date: str


class IncomeOut(DBModel):
    userId: str
    source: str
    amount: float
    date: str
