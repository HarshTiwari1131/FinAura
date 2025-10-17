from __future__ import annotations

from typing import Any, Dict
from .base import BaseAgent, AgentResponse


class NotificationAgent(BaseAgent):
    name = "notification"

    async def run(self, payload: Dict[str, Any], user_id: str | None = None) -> AgentResponse:
        message = "Reminder: Your goal 'New Phone' is 20% complete. Add ₹1500 this week to stay on track."
        return AgentResponse.ok(reminder=message)
