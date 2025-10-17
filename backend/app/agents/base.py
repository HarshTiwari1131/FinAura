from __future__ import annotations

from typing import Any, Dict, Optional


class AgentResponse(dict):
    """Simple dict-based response with convenience helpers."""

    @classmethod
    def ok(cls, **data: Any) -> "AgentResponse":
        o = cls()
        o.update({"ok": True, **data})
        return o

    @classmethod
    def fail(cls, message: str, **data: Any) -> "AgentResponse":
        o = cls()
        o.update({"ok": False, "message": message, **data})
        return o


class BaseAgent:
    """Base class for all agents."""

    name: str = "base"

    def __init__(self, db=None, llm=None, memory=None):
        self.db = db
        self.llm = llm
        self.memory = memory

    async def run(self, payload: Dict[str, Any], user_id: Optional[str] = None) -> AgentResponse:
        raise NotImplementedError
