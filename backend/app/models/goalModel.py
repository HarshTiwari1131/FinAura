from typing import Optional
from pydantic import BaseModel
from .common import DBModel


class GoalCreate(BaseModel):
    name: str
    targetAmount: float
    targetDate: str  # YYYY-MM
    active: Optional[bool] = None


class GoalUpdate(BaseModel):
    name: Optional[str] = None
    targetAmount: Optional[float] = None
    targetDate: Optional[str] = None
    active: Optional[bool] = None


class GoalOut(DBModel):
    userId: str
    name: str
    targetAmount: float
    targetDate: str
    createdAt: Optional[str] = None
    active: Optional[bool] = None