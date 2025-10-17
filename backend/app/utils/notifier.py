from datetime import datetime


async def notify(db, user_id: str, *, type: str = "general", title: str = "", text: str = "", ts: str | None = None):
    if not user_id:
        return None
    doc = {
        "userId": user_id,
        "type": type,
        "title": title,
        "text": text,
        "read": False,
        "ts": ts or datetime.utcnow().isoformat(),
    }
    res = await db["notifications"].insert_one(doc)
    return res.inserted_id
