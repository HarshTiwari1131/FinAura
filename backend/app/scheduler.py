from __future__ import annotations

import asyncio
from .utils.llm_connector import LLMClient
from .services.memory_db import MemoryDB
from .utils.dbConnect import get_db
from .agents.goal_tracking import GoalTrackingAgent
from .agents.notification_agent import NotificationAgent


async def run_scheduled_jobs():
    db = await get_db()
    llm = LLMClient()
    mem = MemoryDB()
    goal = GoalTrackingAgent(db=db, llm=llm, memory=mem)
    notif = NotificationAgent(db=db, llm=llm, memory=mem)
    # This is a no-op stub; plug a real scheduler like APScheduler or Celery
    await goal.run({}, user_id=None)
    await notif.run({}, user_id=None)
