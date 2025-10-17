from typing import Optional
from pydantic import BaseModel
from .common import DBModel


class BudgetCreate(BaseModel):
    month: str  # e.g., "2025-10"
    limit: float
    category: Optional[str] = None


class BudgetOut(DBModel):
    userId: str
    month: str
    limit: float
    spent: float = 0.0
    category: Optional[str] = None
