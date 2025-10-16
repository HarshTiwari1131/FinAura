from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from .common import DBModel


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(DBModel):
    name: str
    email: EmailStr
    bankLinked: bool = False
    kycStatus: str = "unverified"
    riskProfile: str = "moderate"


class UserUpdate(BaseModel):
    name: Optional[str] = None
    bankLinked: Optional[bool] = None
    kycStatus: Optional[str] = None
    riskProfile: Optional[str] = None
