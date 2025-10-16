from typing import Optional
from pydantic import BaseModel
from .common import DBModel


class InvestmentCreate(BaseModel):
    type: str
    amount: float
    roi: float
    riskLevel: str
    date: str


class InvestmentOut(DBModel):
    userId: str
    type: str
    amount: float
    roi: float
    riskLevel: str
    date: str
