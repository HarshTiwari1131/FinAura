from __future__ import annotations

import os
import httpx
from typing import Any, Dict, Optional


class LLMClient:
    """LLM connector for Longcat (primary placeholder) and Gemini (secondary real API).

    - Longcat: currently a placeholder unless LONGCAT_API_KEY and endpoint are wired.
    - Gemini: calls Google's Generative Language API (v1beta) using httpx.
    """

    def __init__(self, *, longcat_key: Optional[str] = None, gemini_key: Optional[str] = None):
        self.longcat_key = longcat_key or os.getenv("LONGCAT_API_KEY")
        self.gemini_key = gemini_key or os.getenv("GEMINI_API_KEY")
        self._client = httpx.AsyncClient(timeout=30)
        # Longcat defaults to vendor OpenAI-compatible endpoint if not provided
        self.longcat_base = os.getenv("LONGCAT_BASE_URL") or "https://api.longcat.chat/openai/v1"
        # Use vendor model name by default; override via LONGCAT_MODEL
        self.longcat_model = os.getenv("LONGCAT_MODEL", "LongCat-Flash-Chat")
        # Gemini model can be overridden via env; default to latest flash
        self.gemini_model = os.getenv("GEMINI_MODEL", "gemini-1.5-flash-latest")

    async def longcat_chat(self, system: str, user: str, **kwargs) -> Dict[str, Any]:
        """If LONGCAT_BASE_URL is provided, call it as an OpenAI-compatible /chat/completions API.
        Otherwise, return a placeholder echo.
        """
        if self.longcat_base and self.longcat_key:
            url = self.longcat_base.rstrip('/') + "/chat/completions"
            model = kwargs.get("model", self.longcat_model)
            payload = {
                "model": model,
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": user},
                ],
                "temperature": kwargs.get("temperature", 0.4),
                "max_tokens": kwargs.get("max_tokens", 512),
            }
            headers = {"Authorization": f"Bearer {self.longcat_key}"}
            try:
                res = await self._client.post(url, json=payload, headers=headers)
                res.raise_for_status()
                data = res.json()
                text = (
                    data.get("choices", [{}])[0]
                    .get("message", {})
                    .get("content", "")
                )
                return {"ok": bool(text), "model": model, "output": text or "" , "raw": data}
            except httpx.HTTPStatusError as e:
                return {"ok": False, "message": f"Longcat HTTP error: {e.response.status_code}", "details": e.response.text}
            except Exception as e:
                return {"ok": False, "message": str(e)}
        # Fallback placeholder if not configured
        if not self.longcat_key:
            return {"ok": False, "message": "Missing LONGCAT_API_KEY"}
        return {"ok": True, "model": "longcat", "output": f"[Longcat] {user}"}

    async def gemini_chat(self, system: str, user: str, **kwargs) -> Dict[str, Any]:
        """Call Gemini via REST API with automatic model/version fallback.

        - Prefers GEMINI_MODEL if set, else gemini-1.5-flash-latest.
        - Tries v1beta first, then v1 if 404.
        - On persistent 404, tries fallbacks: gemini-2.0-flash, gemini-1.5-flash-latest, gemini-1.5-flash.
        """
        if not self.gemini_key:
            return {"ok": False, "message": "Missing GEMINI_API_KEY"}

        primary_model = kwargs.get("model", self.gemini_model)
        model_candidates = [m for m in {
            primary_model,
            "gemini-2.0-flash",
            "gemini-1.5-flash-latest",
            "gemini-1.5-flash",
        } if m]
        versions = ["v1beta", "v1"]

        headers = {"X-goog-api-key": self.gemini_key}
        last_error: Dict[str, Any] | None = None

        for mdl in model_candidates:
            for ver in versions:
                url = f"https://generativelanguage.googleapis.com/{ver}/models/{mdl}:generateContent"
                payload = {
                    "contents": [
                        {"role": "user", "parts": [{"text": user}]}
                    ],
                    "generationConfig": {
                        "temperature": kwargs.get("temperature", 0.4),
                        "topP": kwargs.get("top_p", 0.9),
                        "topK": kwargs.get("top_k", 40),
                        "maxOutputTokens": kwargs.get("max_tokens", 512),
                    },
                }
                if system:
                    payload["systemInstruction"] = {"parts": [{"text": system}]}
                try:
                    res = await self._client.post(url, json=payload, headers=headers)
                    if res.status_code == 404:
                        last_error = {"message": "Gemini HTTP error: 404", "url": url, "details": res.text, "model": mdl, "version": ver}
                        continue
                    res.raise_for_status()
                    data = res.json()
                    # Try to read text from candidate parts
                    text = (
                        data.get("candidates", [{}])[0]
                        .get("content", {})
                        .get("parts", [{}])[0]
                        .get("text", "")
                    )
                    if not text:
                        return {"ok": False, "model": mdl, "version": ver, "message": "Empty response from Gemini", "raw": data}
                    return {"ok": True, "model": mdl, "version": ver, "output": text, "raw": data}
                except httpx.HTTPStatusError as e:
                    last_error = {"message": f"Gemini HTTP error: {e.response.status_code}", "url": url, "details": e.response.text, "model": mdl, "version": ver}
                except Exception as e:
                    last_error = {"message": str(e), "url": url, "model": mdl, "version": ver}

        return {"ok": False, **(last_error or {"message": "Gemini request failed"})}

    async def close(self):
        await self._client.aclose()
