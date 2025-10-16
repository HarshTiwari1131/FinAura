from fastapi import HTTPException
from ..utils.dbConnect import get_db
from ..models.investmentModel import InvestmentCreate
from ..utils.ids import to_obj_id
from ..utils.serialization import serialize_doc


COL = "investments"


async def create_investment(user_id: str, payload: InvestmentCreate):
    db = await get_db()
    doc = {**payload.dict(), "userId": user_id}
    res = await db[COL].insert_one(doc)
    return serialize_doc(await db[COL].find_one({"_id": res.inserted_id}))


async def list_investments(user_id: str):
    db = await get_db()
    cursor = db[COL].find({"userId": user_id})
    return [serialize_doc(doc) async for doc in cursor]


async def update_investment(user_id: str, inv_id: str, payload: dict):
    db = await get_db()
    oid = to_obj_id(inv_id)
    r = await db[COL].update_one({"_id": oid, "userId": user_id}, {"$set": payload})
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail="Investment not found")
    return serialize_doc(await db[COL].find_one({"_id": oid}))


async def delete_investment(user_id: str, inv_id: str):
    db = await get_db()
    oid = to_obj_id(inv_id)
    r = await db[COL].delete_one({"_id": oid, "userId": user_id})
    if r.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Investment not found")
    return {"deleted": True}
