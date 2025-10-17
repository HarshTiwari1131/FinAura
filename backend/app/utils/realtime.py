import asyncio
from typing import Dict, Set


_subscribers: Dict[str, Set[asyncio.Queue]] = {}


def subscribe(user_id: str) -> asyncio.Queue:
    q: asyncio.Queue = asyncio.Queue()
    _subscribers.setdefault(user_id, set()).add(q)
    return q


def unsubscribe(user_id: str, q: asyncio.Queue):
    try:
        subs = _subscribers.get(user_id)
        if subs and q in subs:
            subs.remove(q)
            if not subs:
                _subscribers.pop(user_id, None)
    except Exception:
        pass


async def publish(user_id: str, event: dict):
    subs = _subscribers.get(user_id)
    if not subs:
        return
    for q in list(subs):
        try:
            await q.put(event)
        except Exception:
            # drop broken queue
            unsubscribe(user_id, q)
