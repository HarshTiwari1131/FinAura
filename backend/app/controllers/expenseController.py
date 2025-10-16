from fastapi import HTTPException
from ..utils.dbConnect import get_db
from ..models.expenseModel import ExpenseCreate
from ..utils.ids import to_obj_id
from ..utils.serialization import serialize_doc


COL = "expenses"


async def create_expense(user_id: str, payload: ExpenseCreate):
    db = await get_db()
    doc = {**payload.dict(), "userId": user_id}
    res = await db[COL].insert_one(doc)
    created = await db[COL].find_one({"_id": res.inserted_id})
    return serialize_doc(created)


async def list_expenses(user_id: str, category: str | None = None):
    db = await get_db()
    query = {"userId": user_id}
    if category:
        query["category"] = category
    cursor = db[COL].find(query)
    return [serialize_doc(doc) async for doc in cursor]


async def update_expense(user_id: str, expense_id: str, payload: dict):
    db = await get_db()
    oid = to_obj_id(expense_id)
    r = await db[COL].update_one({"_id": oid, "userId": user_id}, {"$set": payload})
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail="Expense not found")
    return serialize_doc(await db[COL].find_one({"_id": oid}))


async def delete_expense(user_id: str, expense_id: str):
    db = await get_db()
    oid = to_obj_id(expense_id)
    r = await db[COL].delete_one({"_id": oid, "userId": user_id})
    if r.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"deleted": True}
