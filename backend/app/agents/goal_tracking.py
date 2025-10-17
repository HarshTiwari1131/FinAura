from __future__ import annotations

from typing import Any, Dict
from .base import BaseAgent, AgentResponse


class GoalTrackingAgent(BaseAgent):
    name = "goal-tracking"

    async def run(self, payload: Dict[str, Any], user_id: str | None = None) -> AgentResponse:
        # Placeholder: compute progress by reading goals
        try:
            db = self.db
            cursor = db["goals"].find({"userId": user_id})
            total = 0
            done = 0
            async for g in cursor:
                total += 1
                if (g or {}).get("progress", 0) >= 100:
                    done += 1
            pct = int((done / total) * 100) if total else 0
        except Exception:
            pct = 0
        return AgentResponse.ok(progress=pct, actions="Auto-transfer ₹2000/month to goal wallet.")
