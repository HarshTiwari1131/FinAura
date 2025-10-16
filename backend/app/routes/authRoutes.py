from fastapi import APIRouter, Depends
from ..controllers import authController as ctl
from ..models.userModel import UserCreate, UserLogin, UserUpdate
from ..utils.jwtHandler import get_current_user_id, verify_token

router = APIRouter()


@router.post("/signup")
async def signup(payload: UserCreate):
    return await ctl.signup(payload)


@router.post("/login")
async def login(payload: UserLogin):
    return await ctl.login(payload)


@router.get("/profile")
async def profile(user_id: str = Depends(get_current_user_id)):
    return await ctl.get_profile(user_id)


@router.put("/profile")
async def update_profile(payload: UserUpdate, user_id: str = Depends(get_current_user_id)):
    return await ctl.update_profile(user_id, payload)


@router.post("/refresh")
async def refresh(token: str):
    payload = verify_token(token, refresh=True)
    return await ctl.refresh(payload.get("sub"))
