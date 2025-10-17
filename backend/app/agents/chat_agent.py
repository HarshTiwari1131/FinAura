from __future__ import annotations

from typing import Any, Dict
from .base import BaseAgent, AgentResponse


class ChatAgent(BaseAgent):
    name = "chat"

    async def run(self, payload: Dict[str, Any], user_id: str | None = None) -> AgentResponse:
        user = (payload or {}).get("q") or (payload or {}).get("text") or ""
        if not user:
            return AgentResponse.fail("Missing message")
        # Use LLM for a friendly reply
        ans = await self.llm.longcat_chat("You are a friendly finance assistant.", user)
        if not ans.get("ok"):
            ans = await self.llm.gemini_chat("You are a friendly finance assistant.", user)
        return AgentResponse.ok(reply=ans.get("output"))
