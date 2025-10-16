import os
from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

ACCESS_SECRET = os.getenv("JWT_ACCESS_SECRET", "dev_access_secret")
REFRESH_SECRET = os.getenv("JWT_REFRESH_SECRET", "dev_refresh_secret")

security = HTTPBearer()

def create_token(data: dict, minutes: int, secret: str) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, secret, algorithm="HS256")

def create_access_token(user_id: str) -> str:
    return create_token({"sub": user_id, "type": "access"}, minutes=30, secret=ACCESS_SECRET)

def create_refresh_token(user_id: str) -> str:
    return create_token({"sub": user_id, "type": "refresh"}, minutes=60*24*7, secret=REFRESH_SECRET)

def verify_token(token: str, refresh: bool = False) -> dict:
    try:
        secret = REFRESH_SECRET if refresh else ACCESS_SECRET
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_user_id(creds: HTTPAuthorizationCredentials = Depends(security)) -> str:
    token = creds.credentials
    payload = verify_token(token)
    sub = payload.get("sub")
    if not sub:
        raise HTTPException(status_code=401, detail="Invalid token subject")
    return str(sub)
