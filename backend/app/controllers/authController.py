from fastapi import HTTPException, Depends
import bcrypt
from ..utils.dbConnect import get_db
from ..utils.ids import to_obj_id
from ..utils.serialization import serialize_doc
from ..utils.jwtHandler import create_access_token, create_refresh_token, get_current_user_id
from ..models.userModel import UserCreate, UserLogin, UserOut, UserUpdate


async def signup(payload: UserCreate):
    db = await get_db()
    users = db.get_collection("users")
    exist = await users.find_one({"email": payload.email})
    if exist:
        raise HTTPException(status_code=409, detail="Email already registered")
    # Use bcrypt library directly to avoid passlib backend issues
    hashed = bcrypt.hashpw(payload.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    doc = {
        "name": payload.name,
        "email": payload.email,
        "passwordHash": hashed,
        "bankLinked": False,
        "kycStatus": "unverified",
        "riskProfile": "moderate",
        "walletBalance": 0,
    }
    res = await users.insert_one(doc)
    user = await users.find_one({"_id": res.inserted_id}, {"passwordHash": 0})
    from ..utils.serialization import serialize_doc
    return serialize_doc(user)


async def login(payload: UserLogin):
    db = await get_db()
    users = db.get_collection("users")
    user = await users.find_one({"email": payload.email})
    if not user or not bcrypt.checkpw(payload.password.encode('utf-8'), str(user.get("passwordHash", "")).encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    uid = str(user["_id"]) 
    return {
        "access_token": create_access_token(uid),
        "refresh_token": create_refresh_token(uid),
        "token_type": "bearer",
    }


async def refresh(user_id: str):
    return {"access_token": create_access_token(user_id), "token_type": "bearer"}


async def get_profile(user_id: str):
    db = await get_db()
    users = db.get_collection("users")
    oid = to_obj_id(user_id)
    user = await users.find_one({"_id": oid}) if oid else None
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.pop("passwordHash", None)
    return serialize_doc(user)


async def update_profile(user_id: str, payload: UserUpdate):
    db = await get_db()
    users = db.get_collection("users")
    updates = {k: v for k, v in payload.dict(exclude_unset=True).items()}
    oid = to_obj_id(user_id)
    await users.update_one({"_id": oid}, {"$set": updates})
    user = await users.find_one({"_id": oid}, {"passwordHash": 0})
    return serialize_doc(user)
