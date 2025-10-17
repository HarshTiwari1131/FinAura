from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
import asyncio
from datetime import datetime
from typing import Optional
from ..utils.dbConnect import get_db
from ..utils.jwtHandler import get_current_user_id, verify_token
from ..utils.ids import to_obj_id
from ..utils.serialization import serialize_doc
from ..utils.realtime import subscribe, unsubscribe, publish

router = APIRouter()


@router.get("")
async def list_notifications(user_id: str = Depends(get_current_user_id)):
    db = await get_db()
    items = [serialize_doc(n) async for n in db["notifications"].find({"userId": user_id}).sort("ts", -1).limit(200)]
    return items


@router.post("")
async def create_notification(payload: dict, user_id: str = Depends(get_current_user_id)):
    db = await get_db()
    doc = {
        "userId": user_id,
        "type": payload.get("type", "general"),
        "title": payload.get("title", ""),
        "text": payload.get("text", ""),
        "read": False,
        "ts": payload.get("ts") or datetime.utcnow().isoformat(),
    }
    res = await db["notifications"].insert_one(doc)
    saved = await db["notifications"].find_one({"_id": res.inserted_id})
    # realtime push
    try:
        await publish(user_id, serialize_doc(saved))
    except Exception:
        pass
    return serialize_doc(saved)


@router.post("/{notif_id}/read")
async def mark_read(notif_id: str, user_id: str = Depends(get_current_user_id)):
    db = await get_db()
    oid = to_obj_id(notif_id)
    r = await db["notifications"].update_one({"_id": oid, "userId": user_id}, {"$set": {"read": True}})
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    doc = await db["notifications"].find_one({"_id": oid})
    return serialize_doc(doc)


@router.delete("")
async def clear_all(user_id: str = Depends(get_current_user_id)):
    db = await get_db()
    await db["notifications"].delete_many({"userId": user_id})
    return {"deleted": True}


@router.get("/sse")
async def notification_stream(token: str):
    # EventSource cannot set headers; accept token as query param and verify
    try:
        payload = verify_token(token)
        user_id = str(payload.get("sub"))
    except Exception:
        raise HTTPException(status_code=403, detail="Forbidden")
    q = subscribe(user_id)
    async def event_gen():
        try:
            while True:
                item = await q.get()
                import json
                yield f"data: {json.dumps(serialize_doc(item))}\n\n"
        finally:
            unsubscribe(user_id, q)
    return StreamingResponse(event_gen(), media_type="text/event-stream")
