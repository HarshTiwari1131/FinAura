from __future__ import annotations

from typing import Any, Dict
from .base import BaseAgent, AgentResponse


class ExpenseAnalysisAgent(BaseAgent):
    name = "expense-analysis"

    async def run(self, payload: Dict[str, Any], user_id: str | None = None) -> AgentResponse:
        return AgentResponse.ok(insight="Spending increased in food category", recommendation="Cut delivery by 15%")
