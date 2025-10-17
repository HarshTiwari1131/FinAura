from __future__ import annotations

from typing import List, Tuple


class MemoryDB:
    """Tiny in-memory vector-like store placeholder.
    Replace with FAISS or Pinecone for production.
    """

    def __init__(self):
        self._items: List[Tuple[str, str]] = []  # (user_id, text)

    async def add(self, user_id: str, text: str):
        self._items.append((user_id, text))

    async def query(self, user_id: str, q: str, top_k: int = 3) -> List[str]:
        # naive contains-based retrieval
        texts = [t for (u, t) in self._items if u == user_id]
        hits = [t for t in texts if any(w.lower() in t.lower() for w in q.split())]
        return hits[:top_k]
