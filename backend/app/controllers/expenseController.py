from fastapi import HTTPException
from ..utils.dbConnect import get_db
from ..models.expenseModel import ExpenseCreate
from ..utils.ids import to_obj_id
from ..utils.serialization import serialize_doc
from ..utils.notifier import notify


COL = "expenses"


async def create_expense(user_id: str, payload: ExpenseCreate):
    db = await get_db()
    doc = {**payload.dict(), "userId": user_id}
    res = await db[COL].insert_one(doc)
    created = await db[COL].find_one({"_id": res.inserted_id})
    # If paid from wallet, deduct wallet balance
    try:
        if (payload.paymentMethod or '').lower() == 'wallet':
            amt = int(float(payload.amount or 0))
            users = db["users"]
            await users.update_one({"_id": to_obj_id(user_id)}, {"$inc": {"walletBalance": -amt}})
            try:
                await notify(db, user_id, type="wallet", title=f"Wallet debited ₹{amt}", text=f"Expense paid from wallet • {payload.category}")
            except Exception:
                pass
    except Exception:
        pass
    # Notify
    try:
        amt = float(payload.amount or 0)
        cat = payload.category or "Expense"
        await notify(db, user_id, type="expense", title=f"Spent ₹{amt:.0f}", text=f"{cat} • {payload.date}")
    except Exception:
        pass
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
    # Wallet adjustments if paymentMethod/amount changed
    existing = await db[COL].find_one({"_id": oid, "userId": user_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Expense not found")
    old_pm = (existing.get("paymentMethod") or '').lower()
    old_amt = int(float(existing.get("amount") or 0))
    new_pm = (payload.get("paymentMethod", existing.get("paymentMethod")) or '').lower()
    new_amt = int(float(payload.get("amount", existing.get("amount", 0)) or 0))

    r = await db[COL].update_one({"_id": oid, "userId": user_id}, {"$set": payload})
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail="Expense not found")
    # Compute wallet delta
    try:
        delta = 0
        if old_pm == 'wallet' and new_pm == 'wallet':
            delta += (old_amt - new_amt)  # refund if decreased, debit more if increased
        elif old_pm == 'wallet' and new_pm != 'wallet':
            delta += old_amt  # refund entire old amount
        elif old_pm != 'wallet' and new_pm == 'wallet':
            delta -= new_amt  # debit new amount
        if delta != 0:
            await db["users"].update_one({"_id": to_obj_id(user_id)}, {"$inc": {"walletBalance": delta}})
            try:
                verb = "credited" if delta > 0 else "debited"
                await notify(db, user_id, type="wallet", title=f"Wallet {verb} ₹{abs(delta)}", text="Expense update adjustment applied")
            except Exception:
                pass
    except Exception:
        pass
    try:
        await notify(db, user_id, type="expense", title="Expense updated", text=f"{expense_id} has been updated")
    except Exception:
        pass
    return serialize_doc(await db[COL].find_one({"_id": oid}))


async def delete_expense(user_id: str, expense_id: str):
    db = await get_db()
    oid = to_obj_id(expense_id)
    # Refund wallet if this was paid from wallet
    existing = await db[COL].find_one({"_id": oid, "userId": user_id})
    r = await db[COL].delete_one({"_id": oid, "userId": user_id})
    if r.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Expense not found")
    try:
        if existing and (existing.get("paymentMethod") or '').lower() == 'wallet':
            amt = int(float(existing.get("amount") or 0))
            await db["users"].update_one({"_id": to_obj_id(user_id)}, {"$inc": {"walletBalance": amt}})
            try:
                await notify(db, user_id, type="wallet", title=f"Wallet credited ₹{amt}", text="Expense deleted (wallet refund)")
            except Exception:
                pass
    except Exception:
        pass
    try:
        await notify(db, user_id, type="expense", title="Expense deleted", text=f"{expense_id} has been removed")
    except Exception:
        pass
    return {"deleted": True}
