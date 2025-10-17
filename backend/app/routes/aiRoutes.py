from fastapi import APIRouter, Depends
from ..utils.jwtHandler import get_current_user_id
from ..utils.dbConnect import get_db
from ..utils.ids import to_obj_id
from ..utils.serialization import serialize_doc
from ..utils.llm_connector import LLMClient
from ..services.memory_db import MemoryDB
from ..agents import (
    OrchestratorAgent,
    BudgetOptimizationAgent,
    ExpenseAnalysisAgent,
    GoalTrackingAgent,
)
from ..utils.notifier import notify
from ..utils.dbConnect import get_db

router = APIRouter()


@router.get("/expense-predict")
async def expense_predict(user_id: str = Depends(get_current_user_id)):
    db = await get_db()
    llm = LLMClient()
    mem = MemoryDB()
    agent = ExpenseAnalysisAgent(db=db, llm=llm, memory=mem)
    return await agent.run({}, user_id)


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
    # Use agents path (stubbed): return a simple rule-based plan for now
    from ..agents.investment_advisor import InvestmentAdvisorAgent
    llm = LLMClient()
    mem = MemoryDB()
    agent = InvestmentAdvisorAgent(db=db, llm=llm, memory=mem)
    res = await agent.run({"risk": risk, "budget": budget}, user_id=user_id)
    return res


# New multi-agent endpoints (orchestrated)
@router.get("/query")
async def ai_query(q: str, user_id: str = Depends(get_current_user_id)):
    db = await get_db()
    llm = LLMClient()
    mem = MemoryDB()
    orch = OrchestratorAgent(db=db, llm=llm, memory=mem)
    return await orch.run({"q": q}, user_id)


@router.get("/chat")
async def ai_chat(q: str, model: str = "gemini", user_id: str = Depends(get_current_user_id)):
    """Direct chat with a chosen model (gemini|longcat), constrained to FinAura data only.

    - If the user asks about other apps/software or topics outside FinAura data, we decline.
    - Provides a minimal per-user financial context to the model.
    """
    db = await get_db()
    # Quick per-user context
    incomes = [i.get("amount", 0) async for i in db["income"].find({"userId": user_id}).limit(180)]
    expenses = [e.get("amount", 0) async for e in db["expenses"].find({"userId": user_id}).limit(180)]
    investments = [inv.get("amount", 0) async for inv in db["investment"].find({"userId": user_id}).limit(180)]
    user_doc = await db["users"].find_one({"_id": to_obj_id(user_id)})
    risk = (user_doc or {}).get("riskProfile", "moderate")
    wallet = int((user_doc or {}).get("walletBalance", 0))
    goal = await db["goals"].find_one({"userId": user_id, "active": True}) or await db["goals"].find_one({"userId": user_id})

    # Special-case: identity/about developer/self questions or request for more detail
    identity_terms = [
        "who are you", "your name", "about yourself", "about your self", "who developed you",
        "who created you", "developer", "made you", "who build you", "who built you", "who devlop you", "who develop you"
    ]
    ql = (q or "").lower()
    about_finaura = (
        "FinAura is an AI-assisted personal finance platform that lets you track income, expenses, and investments; "
        "manage multiple financial goals (with one Active goal); receive Smart Suggestions with auto-actions; "
        "and top up your in-app Wallet via Stripe. You get real-time notifications (SSE) and a focused assistant that uses "
        "your data plus core finance knowledge to help you plan and improve. Key features:\n"
        "- Multiple Goals with Active selection and progress tracking\n"
        "- Smart Suggestions (overspend alerts, weekly caps, goal savings target) with apply endpoints\n"
        "- Wallet with auto-transfers and Stripe top-ups; wallet-paid expense adjustments\n"
        "- Live Notifications drawer; mark-as-read, clear-all\n"
        "- Assistant chat (Gemini/Longcat) constrained to finance topics and your data\n"
        "- Clean React + FastAPI architecture with JWT authentication\n\n"
        "Why FinAura: Unlike typical trackers, FinAura combines agentic suggestions with one-click apply actions, real-time notifications, and a finance-aware assistant—all in one place. "
        "For more, see the maintainer GitHub: https://github.com/Harshtiwari1131"
    )
    if any(t in ql for t in identity_terms) or "more detail" in ql or "more details" in ql:
        return {"ok": True, "model": (model or "").lower(), "reply": about_finaura}

    # Guard: decline out-of-scope/software/app requests explicitly
    out_of_scope_terms = ["chatgpt", "openai", "whatsapp", "instagram", "facebook", "tiktok", "youtube", "android app", "ios app", "software", "install", "download"]
    if any(t in ql for t in out_of_scope_terms):
        return {
            "ok": True,
            "model": (model or "").lower(),
            "reply": "I can only answer based on your financial data in FinAura (income, expenses, investments, goals, wallet). I can’t advise about other apps or software.",
        }

    # Compose strict system prompt
    ctx = {
        "total_income": sum(incomes),
        "total_expenses": sum(expenses),
        "net": sum(incomes) - sum(expenses),
        "invested": sum(investments),
        "wallet": wallet,
        "riskProfile": risk,
        "hasGoal": bool(goal),
        "goal": {"title": (goal or {}).get("title"), "target": (goal or {}).get("target"), "targetDate": (goal or {}).get("targetDate") } if goal else None,
    }
    # Finance knowledge base (compact, safe, and non-prescriptive)
    finance_kb = (
        "Core finance concepts: Budgeting (track income vs expenses; aim positive net), Emergency Fund (3–6 months of expenses), "
        "Diversification (spread risk across assets), Asset Allocation (mix of equity, debt, cash per risk profile), Rupee‑Cost Averaging/SIPs, "
        "Compounding (returns on returns), Expense Ratios (lower is better, especially for index funds), Risk vs Return (higher return potential usually means higher volatility).\n"
        "Stocks: Ownership in companies; volatile; suitable for long-term goals.\n"
        "Mutual Funds/ETFs: Pooled investments offering diversification; categories include equity, debt, hybrid, index; SIPs help average cost.\n"
        "Bonds/Debt: Lower volatility; provide income; useful for stability.\n"
        "Crypto: Highly volatile/speculative; allocate cautiously, if at all, as a small satellite portion of a diversified portfolio.\n"
        "General guidance: Define goals, horizon, and risk tolerance; rebalance periodically; avoid timing markets; this is educational, not financial advice."
    )
    system = (
        "You are FinAura, a finance-focused assistant for a single user. "
        "Use the user's financial data below AND the provided core finance knowledge to answer questions about personal finance, budgeting, investing, stocks, mutual funds/ETFs, debt/bonds, risk management, and crypto risk. "
        "Do NOT recommend specific tickers or products; stay general and educational. Do NOT reference or recommend external apps or software. "
        "If the user asks about topics outside finance or beyond FinAura's scope, reply exactly: 'I can only answer based on your FinAura data and general finance knowledge.' "
        "If user data is missing, say what’s missing and how to add it in FinAura. Always include a brief disclaimer: 'This is educational, not financial advice.'\n\n"
        f"User Data Summary (approx): {ctx}\n\n"
        f"Knowledge Base: {finance_kb}"
    )

    llm = LLMClient()
    m = (model or "").lower()
    if m == "longcat":
        res = await llm.longcat_chat(system, f"User: {q}")
    else:
        res = await llm.gemini_chat(system, f"User: {q}")
    ok = bool(res.get("ok"))
    out = res.get("output") if ok else (res.get("message") or "No response")
    # Final guard if model ignores instruction
    if not ok:
        return {"ok": False, "model": m, "reply": out}
    if any(t in ql for t in out_of_scope_terms):
        return {"ok": True, "model": m, "reply": "I can only answer based on your FinAura data and general finance knowledge."}
    return {"ok": True, "model": m, "reply": out}


@router.get("/suggestions")
async def ai_suggestions(model: str = "gemini", notify_user: bool = False, user_id: str = Depends(get_current_user_id)):
    """Compute actionable spending/income/investment suggestions.

    Returns a small list of suggestions, each with title, detail, and action. If `notify_user=true`, also push 1-2 concise notifications.
    """
    db = await get_db()
    # Load user data
    incomes = [i async for i in db["income"].find({"userId": user_id})]
    expenses = [e async for e in db["expenses"].find({"userId": user_id})]
    investments = [inv async for inv in db["investment"].find({"userId": user_id})]
    user_doc = await db["users"].find_one({"_id": to_obj_id(user_id)})
    goal = await db["goals"].find_one({"userId": user_id, "active": True}) or await db["goals"].find_one({"userId": user_id})

    tot_inc = sum(float(x.get("amount") or 0) for x in incomes)
    tot_exp = sum(float(x.get("amount") or 0) for x in expenses)
    net = tot_inc - tot_exp

    # Category breakdown
    cat = {}
    for e in expenses:
        k = (e.get("category") or "Other").title()
        cat[k] = cat.get(k, 0.0) + float(e.get("amount") or 0)
    top_cat = None
    if cat:
        top_cat = max(cat.items(), key=lambda kv: kv[1])  # (name, total)

    suggestions = []
    # Suggestion 1: Overspending
    if net < 0:
        suggestions.append({
            "title": "You’re overspending",
            "detail": f"Overspent by ₹{abs(int(net)):,}. Reduce discretionary spend to balance.",
            "action": "Trim variable categories by 10–20% this month",
            "actionType": "trim_categories",
            "type": "critical",
        })

    # Suggestion 2: Top category reduction
    if top_cat and tot_inc > 0 and top_cat[1] > 0.35 * tot_inc:
        name, val = top_cat
        cut = int(val * 0.15)
        monthly_target = max(0, int(val - cut))
        weekly_cap = max(0, int(round(monthly_target / 4)))
        suggestions.append({
            "title": f"High spend on {name}",
            "detail": f"{name} is ₹{int(val):,} (~{round((val/tot_inc)*100)}% of income). Target a ₹{cut:,} reduction.",
            "action": f"Set a weekly cap for {name}",
            "actionType": "set_weekly_cap",
            "actionPayload": {"category": name, "weeklyLimit": weekly_cap},
            "type": "expense",
        })

    # Suggestion 3: Savings target toward goal
    if goal:
        from ..controllers.goalController import compute_goal_progress
        stats = await compute_goal_progress(user_id)
        if stats:
            monthly = stats.get("suggestedMonthly", 0)
            suggestions.append({
                "title": "Monthly savings target",
                "detail": f"Save about ₹{int(monthly):,}/month to reach your goal on time.",
                "action": "Move this amount to Wallet at month start",
                "actionType": "move_wallet",
                "actionPayload": {"amount": int(monthly)},
                "type": "goal",
            })

    # Suggestion 4: Idle cash to invest
    wallet = int((user_doc or {}).get("walletBalance", 0))
    if wallet > 0 and net > 0:
        suggestions.append({
            "title": "Put idle wallet cash to work",
            "detail": f"Wallet holds ₹{wallet:,}. Consider allocating a portion into your preferred instruments.",
            "action": "Create an auto-transfer rule",
            "type": "investment",
        })

    # LLM summary (optional) — compact and constrained
    if suggestions:
        try:
            system = (
                "You are FinAura. Summarize the actionable suggestions below in 1–2 concise sentences. "
                "Do not mention external apps. Keep it focused and helpful."
            )
            bullets = "\n".join([f"- {s['title']}: {s['detail']}" for s in suggestions])
            llm = LLMClient()
            res = await (llm.longcat_chat(system, bullets) if (model or '').lower()=="longcat" else llm.gemini_chat(system, bullets))
            if res.get("ok"):
                suggestions.insert(0, {"title": "Summary", "detail": res.get("output", ""), "type": "summary"})
        except Exception:
            pass

    # Optional: notify user (push top 1–2 items)
    if notify_user and suggestions:
        try:
            for s in suggestions[:2]:
                if s.get("type") == "summary":
                    continue
                await notify(db, user_id, type=s.get("type","general"), title=s.get("title","Suggestion"), text=s.get("detail",""))
        except Exception:
            pass

    return {"ok": True, "suggestions": suggestions}


@router.post("/apply/monthly-savings-to-wallet")
async def apply_monthly_savings_to_wallet(user_id: str = Depends(get_current_user_id)):
    """Compute monthly savings target and move that amount from net balance (income - expenses to date) into wallet.

    This is a simplified action: it does NOT move bank money; it records a wallet top-up equal to the target, capped by net positive balance.
    """
    db = await get_db()
    # Aggregate totals
    tot_inc = 0
    async for i in db["income"].find({"userId": user_id}):
        tot_inc += float(i.get("amount") or 0)
    tot_exp = 0
    async for e in db["expenses"].find({"userId": user_id}):
        tot_exp += float(e.get("amount") or 0)
    net = tot_inc - tot_exp
    from ..controllers.goalController import compute_goal_progress
    try:
        stats = await compute_goal_progress(user_id)
        monthly = float(stats.get("suggestedMonthly") or 0)
    except Exception:
        monthly = 0.0
    amount = max(0.0, min(net, monthly))
    if amount <= 0:
        return {"ok": False, "message": "No net balance available for transfer."}
    # Credit wallet and reflect net movement (store a running net shadow to avoid confusion)
    users = (await get_db())["users"]
    from ..utils.ids import to_obj_id
    oid = to_obj_id(user_id)
    await users.update_one({"_id": oid}, {"$inc": {"walletBalance": int(amount), "netShadow": -int(amount)}})
    # Notify
    try:
        await notify(db, user_id, type="wallet", title=f"Wallet auto-transfer ₹{int(amount)}", text="Monthly savings target moved to wallet")
    except Exception:
        pass
    return {"ok": True, "moved": int(amount)}


@router.post("/apply/set-weekly-cap")
async def apply_set_weekly_cap(payload: dict, user_id: str = Depends(get_current_user_id)):
    """Create/Update a simple per-category weekly cap stored under budgets collection as month cap approximation.

    payload: { category: str, weeklyLimit: int }
    """
    db = await get_db()
    category = (payload or {}).get("category")
    weekly = int((payload or {}).get("weeklyLimit") or 0)
    if not category or weekly <= 0:
        return {"ok": False, "message": "Invalid payload"}
    # Save as a monthly budget approximation (weekly * 4)
    month_limit = weekly * 4
    from datetime import datetime
    ym = f"{datetime.utcnow().year}-{datetime.utcnow().month:02d}"
    # upsert a budget doc keyed by user+month+category
    doc_key = {"userId": user_id, "month": ym, "category": category}
    await db["budgets"].update_one(doc_key, {"$set": {"limit": float(month_limit)}}, upsert=True)
    try:
        await notify(db, user_id, type="budget", title=f"Weekly cap set for {category}", text=f"Approx monthly limit ₹{month_limit}")
    except Exception:
        pass
    return {"ok": True, "weeklyLimit": weekly, "monthLimit": month_limit}


@router.post("/apply/trim-categories")
async def apply_trim_categories(user_id: str = Depends(get_current_user_id)):
    db = await get_db()
    try:
        await notify(db, user_id, type="expense", title="Trim planned", text="Reducing variable categories by ~15% this month")
    except Exception:
        pass
    return {"ok": True}


@router.post("/plan-budget")
async def plan_budget(user_id: str = Depends(get_current_user_id)):
    db = await get_db()
    llm = LLMClient()
    mem = MemoryDB()
    agent = BudgetOptimizationAgent(db=db, llm=llm, memory=mem)
    return await agent.run({}, user_id)


@router.get("/insights")
async def ai_insights(user_id: str = Depends(get_current_user_id)):
    db = await get_db()
    llm = LLMClient()
    mem = MemoryDB()
    agent = ExpenseAnalysisAgent(db=db, llm=llm, memory=mem)
    return await agent.run({}, user_id)


@router.get("/goal-progress")
async def goal_progress(user_id: str = Depends(get_current_user_id)):
    db = await get_db()
    llm = LLMClient()
    mem = MemoryDB()
    agent = GoalTrackingAgent(db=db, llm=llm, memory=mem)
    return await agent.run({}, user_id)
