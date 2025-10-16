from typing import Optional
from pydantic import BaseModel
from .common import DBModel


class GoalCreate(BaseModel):
    name: str
    targetAmount: float
    targetDate: str  # YYYY-MM


class GoalUpdate(BaseModel):
    name: Optional[str] = None
    targetAmount: Optional[float] = None
    targetDate: Optional[str] = None


class GoalOut(DBModel):
    userId: str
    name: str
    targetAmount: float
    targetDate: str
    createdAt: Optional[str] = None