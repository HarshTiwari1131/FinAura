from fastapi import HTTPException
from ..utils.dbConnect import get_db
from ..models.goalModel import GoalCreate, GoalUpdate
from ..utils.ids import to_obj_id
from ..utils.serialization import serialize_doc
from datetime import datetime

COL = "goals"


async def upsert_goal(user_id: str, payload: GoalCreate):
    db = await get_db()
    doc = {**payload.dict(), "userId": user_id}
    # keep a single active goal per user: replace existing document
    existing = await db[COL].find_one({"userId": user_id})
    if existing:
        await db[COL].update_one({"_id": existing["_id"]}, {"$set": doc})
        return serialize_doc(await db[COL].find_one({"_id": existing["_id"]}))
    # create new with createdAt
    res = await db[COL].insert_one({**doc, "createdAt": datetime.utcnow().isoformat()})
    return serialize_doc(await db[COL].find_one({"_id": res.inserted_id}))


async def get_goal(user_id: str):
    db = await get_db()
    doc = await db[COL].find_one({"userId": user_id})
    if not doc:
        return None
    return serialize_doc(doc)


async def update_goal(user_id: str, goal_id: str, payload: GoalUpdate):
    db = await get_db()
    oid = to_obj_id(goal_id)
    updates = {k: v for k, v in payload.dict().items() if v is not None}
    r = await db[COL].update_one({"_id": oid, "userId": user_id}, {"$set": updates})
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail="Goal not found")
    return serialize_doc(await db[COL].find_one({"_id": oid}))


async def delete_goal(user_id: str, goal_id: str):
    db = await get_db()
    oid = to_obj_id(goal_id)
    r = await db[COL].delete_one({"_id": oid, "userId": user_id})
    if r.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Goal not found")
    return {"deleted": True}


def _ym(date_str: str) -> str:
    try:
        d = datetime.fromisoformat(date_str.replace('Z',''))
    except Exception:
        try:
            d = datetime.strptime(date_str, "%Y-%m-%d")
        except Exception:
            return "Unknown"
    return f"{d.year}-{d.month:02d}"


def _month_diff(a: datetime, b: datetime) -> int:
    return (b.year - a.year) * 12 + (b.month - a.month)


async def compute_goal_progress(user_id: str):
    db = await get_db()
    goal = await db[COL].find_one({"userId": user_id})
    if not goal:
        raise HTTPException(status_code=404, detail="No goal configured")

    target_amount = float(goal.get("targetAmount") or 0)
    target_date_str = str(goal.get("targetDate") or "")
    if not target_amount or not target_date_str:
        raise HTTPException(status_code=400, detail="Invalid goal data")

    # Aggregate monthly income and expenses
    income_map = {}
    async for inc in db["income"].find({"userId": user_id}):
        k = _ym(inc.get("date", ""))
        income_map[k] = income_map.get(k, 0) + float(inc.get("amount") or 0)
    expense_map = {}
    async for exp in db["expenses"].find({"userId": user_id}):
        k = _ym(exp.get("date", ""))
        expense_map[k] = expense_map.get(k, 0) + float(exp.get("amount") or 0)

    # Build sorted months and cumulative actual savings
    months = sorted(set(list(income_map.keys()) + list(expense_map.keys())))
    actual_cum = 0.0
    for m in months:
        actual_cum += (income_map.get(m, 0.0) - expense_map.get(m, 0.0))
    current_saved = max(0.0, actual_cum)

    # Time math
    now = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    try:
        tgt = datetime.strptime(target_date_str + "-01", "%Y-%m-%d")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid targetDate format")

    created_at_str = goal.get("createdAt")
    try:
        start = datetime.fromisoformat(created_at_str.replace('Z','')).replace(day=1) if created_at_str else (months and datetime.strptime(months[0] + "-01", "%Y-%m-%d") or now)
    except Exception:
        start = months and datetime.strptime(months[0] + "-01", "%Y-%m-%d") or now

    total_months = max(1, _month_diff(start, tgt))
    elapsed_months = max(0, min(total_months, _month_diff(start, now)))
    months_remaining = max(0, _month_diff(now, tgt))

    ideal_now = target_amount * (elapsed_months / total_months)
    progress_percent = 0 if target_amount == 0 else max(0, min(100, round((current_saved / target_amount) * 100)))
    remaining_amount = max(0.0, target_amount - current_saved)
    suggested_monthly = remaining_amount if months_remaining == 0 else (remaining_amount / months_remaining)
    ahead_behind = current_saved - ideal_now

    return {
        "goal": serialize_doc(goal),
        "currentSaved": round(current_saved, 2),
        "progressPercent": progress_percent,
        "monthsRemaining": months_remaining,
        "suggestedMonthly": round(suggested_monthly, 2),
        "ahead": ahead_behind >= 0,
        "aheadBy": round(abs(ahead_behind), 2),
    }