from fastapi import APIRouter, Depends
from ..utils.jwtHandler import get_current_user_id
from ..utils.aiModule import predict_expenses, recommend_investments
from ..utils.dbConnect import get_db
from ..utils.ids import to_obj_id
from ..utils.serialization import serialize_doc

router = APIRouter()


@router.get("/expense-predict")
async def expense_predict(user_id: str = Depends(get_current_user_id)):
    db = await get_db()
    # Load last 6 months expenses grouped
    cursor = db["expenses"].find({"userId": user_id}).sort("date", -1).limit(200)
    txns = []
    i = 0
    async for t in cursor:
        txns.append({"amount": t.get("amount", 0), "month_index": i // 30})
        i += 1
    return await predict_expenses(list(reversed(txns)))


@router.get("/investment-recommend")
async def investment_recommend(user_id: str = Depends(get_current_user_id)):
    db = await get_db()
    oid = to_obj_id(user_id)
    user = await db["users"].find_one({"_id": oid})
    # Estimate budget from average income minus expense
    incomes = [i.get("amount", 0) async for i in db["income"].find({"userId": user_id}).limit(50)]
    expenses = [e.get("amount", 0) async for e in db["expenses"].find({"userId": user_id}).limit(50)]
    budget = max(sum(incomes) - sum(expenses), 0)
    risk = (user or {}).get("riskProfile", "moderate")
    return await recommend_investments(risk, budget)
