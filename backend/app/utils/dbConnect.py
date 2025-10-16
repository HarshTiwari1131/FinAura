import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()  # loads backend/.env or current working dir

_MONGO_CLIENT = None


async def get_db():
    """Return an AsyncIOMotorDatabase.

    Supports two env styles:
    - MONGO_URI including db name (e.g., mongodb://localhost:27017/finaura)
    - MONGO_URI without db name plus MONGO_DB_NAME (e.g., finaura)
    Fallback DB name: 'finaura'
    """
    global _MONGO_CLIENT
    if _MONGO_CLIENT is None:
        uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/finaura")
        _MONGO_CLIENT = AsyncIOMotorClient(uri)

    # Try get_default_database when URI includes a db name
    try:
        db = _MONGO_CLIENT.get_default_database()
        if db is not None:
            return db
    except Exception:
        pass

    # Otherwise, use MONGO_DB_NAME or default
    db_name = os.getenv("MONGO_DB_NAME", "finaura")
    return _MONGO_CLIENT[db_name]


async def ping_db() -> dict:
    """Ping the database to verify connectivity."""
    db = await get_db()
    try:
        res = await db.command({"ping": 1})
        return {"ok": bool(res.get("ok")), "db": db.name}
    except Exception as e:
        return {"ok": False, "error": str(e), "db": db.name}
