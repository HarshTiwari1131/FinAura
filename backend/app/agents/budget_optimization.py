from __future__ import annotations

from typing import Any, Dict
from .base import BaseAgent, AgentResponse
from ..utils.ids import to_obj_id


class BudgetOptimizationAgent(BaseAgent):
    name = "budget-optimization"

    async def run(self, payload: Dict[str, Any], user_id: str | None = None) -> AgentResponse:
        """Compute a personalized budget based on the user's recent income and expenses.

        Strategy:
        - Pull last ~90 expense docs grouped by category to estimate actual spending mix.
        - Pull last ~90 income docs to estimate total monthly income.
        - Target savings share = 20% default, adjusted by risk profile if available on user doc.
        - Rebalance categories proportionally to fit within (1 - savings_share) of income.
        """
        db = self.db
        uid = user_id or "?"
        try:
            # Income and expense aggregates
            incomes = [float(i.get("amount", 0)) async for i in db["income"].find({"userId": uid}).limit(90)]
            total_income = sum(incomes) if incomes else 0.0

            cat_map: dict[str, float] = {}
            async for e in db["expenses"].find({"userId": uid}).limit(200):
                cat = (e.get("category") or "other").lower()
                cat_map[cat] = cat_map.get(cat, 0.0) + float(e.get("amount", 0))

            # Default mix if no data
            if not cat_map:
                cat_map = {"housing": 0.3, "food": 0.15, "transport": 0.1, "utilities": 0.1, "entertainment": 0.1}

            # Normalize category shares
            cat_total = sum(cat_map.values()) or 1.0
            cat_shares = {k: max(v / cat_total, 0.0) for k, v in cat_map.items()}

            # Risk-aware savings share (load user profile)
            user = await db["users"].find_one({"_id": to_obj_id(uid)})
        except Exception:
            user = None

        risk = (user or {}).get("riskProfile", "moderate").lower()
        if risk == "low":
            savings_share = 0.25
        elif risk == "high":
            savings_share = 0.15
        else:
            savings_share = 0.2

        spend_share = max(0.0, 1.0 - savings_share)
        categories = {k: round(spend_share * s, 4) for k, s in cat_shares.items()}
        categories["savings"] = round(savings_share, 4)

        tips = "Rebalanced budget based on your recent spending; aim to save ~{}%".format(int(savings_share * 100))

        # If income known, suggest absolute rupee amounts as well
        amounts = None
        if total_income > 0:
            amounts = {k: round(v * total_income, 2) for k, v in categories.items()}

        return AgentResponse.ok(categories=categories, amounts=amounts, tips=tips)
