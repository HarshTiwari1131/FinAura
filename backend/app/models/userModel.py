from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from .common import DBModel

class KycDetails(BaseModel):
    pan: str
    dob: str  # YYYY-MM-DD
    address: str


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
    kyc: Optional[KycDetails] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    bankLinked: Optional[bool] = None
    kycStatus: Optional[str] = None
    riskProfile: Optional[str] = None
    kyc: Optional[KycDetails] = None
