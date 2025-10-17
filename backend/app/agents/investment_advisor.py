from __future__ import annotations

from typing import Any, Dict
from .base import BaseAgent, AgentResponse


class InvestmentAdvisorAgent(BaseAgent):
    name = "investment-advisor"

    async def run(self, payload: Dict[str, Any], user_id: str | None = None) -> AgentResponse:
        risk = (payload or {}).get("risk", "Moderate")
        plan = [
            {"type": "SIP", "instrument": "Nifty 50 Index Fund", "amount": 5000},
            {"type": "Debt", "instrument": "Liquid Fund", "amount": 2000},
        ]
        advice = f"Based on {risk} risk, allocate more to index funds and keep 3 months emergency fund."
        return AgentResponse.ok(plan=plan, advice=advice)
