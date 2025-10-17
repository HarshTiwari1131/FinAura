from __future__ import annotations

from typing import Any, Dict
from .base import BaseAgent, AgentResponse


class MemoryAgent(BaseAgent):
    name = "memory"

    async def run(self, payload: Dict[str, Any], user_id: str | None = None) -> AgentResponse:
        text = (payload or {}).get("text", "")
        if text and self.memory:
            await self.memory.add(user_id or "?", text)
        return AgentResponse.ok(status="stored")
