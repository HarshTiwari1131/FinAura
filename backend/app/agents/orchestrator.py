from __future__ import annotations

from typing import Any, Dict

from .base import BaseAgent, AgentResponse


MASTER_PROMPT = (
    "You are FinAura Master AI — an orchestrator supervising multiple finance agents."
    " Use Longcat for reasoning; Gemini for analytical summarization."
    " Return a concise helpful answer and JSON of agent calls."
)


class OrchestratorAgent(BaseAgent):
    name = "orchestrator"

    async def run(self, payload: Dict[str, Any], user_id: str | None = None) -> AgentResponse:
        query = (payload or {}).get("q") or (payload or {}).get("query") or ""
        if not query:
            return AgentResponse.fail("Missing query")

        # Intent detection via LLMs (prefer Gemini for real content)
        lc = await self.llm.longcat_chat(MASTER_PROMPT, f"User: {query}")
        gm = await self.llm.gemini_chat(MASTER_PROMPT, f"User: {query}")
        primary_text = (gm.get("output") if gm.get("ok") else lc.get("output")) or ""

        intent = "insight" if "spend" in query.lower() else "chat"
        agent_calls: list[dict] = []

        # Very naive routing with an affordability check
        ql = query.lower()
        if "can i afford" in ql or "afford" in ql:
            # Compute affordability using recent income and expenses
            try:
                db = self.db
                uid = user_id or "?"
                incomes = [i.get("amount", 0) async for i in db["income"].find({"userId": uid}).limit(90)]
                expenses = [e.get("amount", 0) async for e in db["expenses"].find({"userId": uid}).limit(90)]
                monthly_surplus = sum(incomes) - sum(expenses)
            except Exception:
                monthly_surplus = 0

            # extract a number from query as target price
            import re
            nums = [float(x.replace(",", "")) for x in re.findall(r"\d[\d,]*", query)]
            target = nums[0] if nums else 0.0
            affordable = monthly_surplus >= target > 0
            answer = (
                f"Yes — you can likely afford it. Est. monthly surplus ₹{monthly_surplus:,.0f} vs price ₹{target:,.0f}."
                if affordable
                else f"Not yet — est. surplus ₹{monthly_surplus:,.0f} is below price ₹{target:,.0f}. Consider saving for 1-2 months."
            )
            agent_calls.append({
                "agent": "ExpenseAnalysisAgent",
                "input": {"question": query, "target": target},
                "output": {"monthly_surplus": round(monthly_surplus, 2), "affordable": affordable},
            })
            final = answer
        elif "budget" in ql:
            budget = await self.memory.query(user_id or "?", "budget income expenses")
            agent_calls.append({"agent": "BudgetOptimizationAgent", "input": query, "output": {"tips": "Reduce eating out by 10%"}})
            final = "Suggested a budget optimization."
        elif "invest" in ql or "stocks" in ql:
            agent_calls.append({"agent": "InvestmentAdvisorAgent", "input": query, "output": {"plan": ["SIP 5k in index fund"]}})
            final = "Proposed an investment plan."
        elif "goal" in ql:
            agent_calls.append({"agent": "GoalTrackingAgent", "input": query, "output": {"progress": 42}})
            final = "Reported goal progress."
        else:
            agent_calls.append({"agent": "ChatAgent", "input": query, "output": primary_text})
            final = primary_text

        # Store memory of Q&A
        try:
            if self.memory and user_id:
                await self.memory.add(user_id, f"Q: {query}\nA: {final}")
        except Exception:
            pass

        return AgentResponse.ok(
            intent=intent,
            final_answer=str(final),
            agent_calls=agent_calls,
        )
