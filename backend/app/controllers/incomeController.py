from fastapi import HTTPException
from ..utils.dbConnect import get_db
from ..models.incomeModel import IncomeCreate
from ..utils.ids import to_obj_id
from ..utils.serialization import serialize_doc


COL = "income"


async def create_income(user_id: str, payload: IncomeCreate):
    db = await get_db()
    doc = {**payload.dict(), "userId": user_id}
    res = await db[COL].insert_one(doc)
    created = await db[COL].find_one({"_id": res.inserted_id})
    return serialize_doc(created)


async def list_income(user_id: str):
    db = await get_db()
    cursor = db[COL].find({"userId": user_id})
    return [serialize_doc(doc) async for doc in cursor]


async def update_income(user_id: str, income_id: str, payload: dict):
    db = await get_db()
    oid = to_obj_id(income_id)
    r = await db[COL].update_one({"_id": oid, "userId": user_id}, {"$set": payload})
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail="Income not found")
    return serialize_doc(await db[COL].find_one({"_id": oid}))


async def delete_income(user_id: str, income_id: str):
    db = await get_db()
    oid = to_obj_id(income_id)
    r = await db[COL].delete_one({"_id": oid, "userId": user_id})
    if r.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Income not found")
    return {"deleted": True}
