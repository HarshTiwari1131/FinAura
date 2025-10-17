# FinAura — Technical Documentation

This document provides a professional, developer-focused overview of the FinAura project, including architecture, tech stack, folder structure, features, APIs, local setup, deployment, security practices, and maintenance guidelines.

## 1. Project Overview

FinAura is an AI‑assisted personal finance platform that helps users track income/expenses/investments, manage multiple financial goals, receive smart suggestions, and top up a wallet via Stripe. The app provides real-time notifications (SSE) and an in‑app assistant constrained to first‑party data.

Key objectives:
## 2. Tech Stack

- Frontend: Vite, React, Tailwind CSS, Framer Motion, Recharts, Axios
- Backend: FastAPI (Python), MongoDB (Motor), Pydantic v2, JWT Auth, Stripe SDK
- AI Integrations: Google Gemini (REST), Longcat (OpenAI‑compatible)
- Realtime: Server‑Sent Events (SSE) with in‑memory pub/sub
- Auth: Bearer JWT (Authorization header); SSE token via query parameter
- Build/Tooling: Node.js (frontend), Python virtualenv (backend)

## 3. Repository Structure

```
FinAura/
├─ frontend/                     # Vite + React app
│  ├─ src/
│  │  ├─ components/            # Assistant, Notifications, Forms, Charts, etc.
│  │  ├─ context/               # Auth, Theme, Notifications
│  │  ├─ pages/                 # Dashboard, Expenses, Income, Investments, Goal Planner, Chat
│  │  ├─ utils/                 # Axios setup and helpers
│  │  └─ styles.css             # Global styles
│  ├─ index.html
│  ├─ package.json
│  └─ vite.config.js
│
├─ backend/                      # FastAPI app
│  ├─ app/
│  │  ├─ routes/                # API routes: auth, payments, ai, notifications, goals, etc.
│  │  ├─ controllers/           # Business logic per resource
│  │  ├─ models/                # Pydantic models
│  │  ├─ utils/                 # dbConnect, jwt, notifier, realtime (SSE), ids, serialization, llm connector
│  │  ├─ services/              # Agents/memory abstractions
│  │  ├─ tests/                 # Sample tests
│  │  ├─ main.py                # FastAPI app entry
│  │  └─ requirements.txt
│  ├─ README.md
│  └─ .env.example
│
├─ README.md                     # Project overview
└─ docs.md                       # Technical documentation (this file)
```

## 4. Core Features

- Auth & Profile: JWT auth, protected routes, profile update.
- Expenses/Income/Investments: Full CRUD, filters/sort, edit modals, deletes.
- Wallet & Payments:
	- Stripe Checkout for wallet top‑ups; webhook/confirm credits wallet + notifies.
	- Wallet‑paid expenses adjust wallet on create/update/delete.
- Goals (Multiple): maintain many goals; one Active; progress uses Active.
- Smart Suggestions: heuristics + optional AI summary; apply endpoints wired.
- Notifications: CRUD + real‑time SSE; mark‑as‑read, clear‑all.
- In‑app Assistant: Gemini/Longcat chat constrained to FinAura data.

## 5. API Highlights

Base URL (default): `http://localhost:8000`

- Auth: `/api/auth/signup`, `/login`, `/profile`, `/refresh`
- Expenses: `/api/expenses` (GET/POST), `/api/expenses/{id}` (PUT/DELETE)
- Income: `/api/income` (GET/POST), `/api/income/{id}` (PUT/DELETE)
- Investment: `/api/investment` (GET/POST), `/api/investment/{id}` (PUT/DELETE)
- Budgets: `/api/budget` (CRUD)
- Notifications: `/api/notifications` (GET/POST/DELETE), `/api/notifications/{id}/read` (POST), `/api/notifications/sse?token=JWT`
- Payments: `/api/payment/initiate` (POST), `/api/payment/webhook` (POST)
- AI Chat: `/api/ai/chat?q=...&model=gemini|longcat` (GET)
- AI Suggestions: `/api/ai/suggestions?model=&notify_user=` (GET)
- AI Apply:
	- `/api/ai/apply/monthly-savings-to-wallet` (POST)
	- `/api/ai/apply/set-weekly-cap` (POST) — payload `{ category, weeklyLimit }`
	- `/api/ai/apply/trim-categories` (POST)
- Goals (Multiple):
	- `/api/goals` (GET list, POST create)
	- `/api/goals/active` (GET active)
	- `/api/goals/{goal_id}/active` (POST set active)
	- `/api/goals/{goal_id}` (PUT update, DELETE delete)
	- `/api/goals/progress` (GET), `/api/goals/notify-progress` (POST)

	## 6. Data Models (abridged)

	- User (selected): `{ _id, email, passwordHash, walletBalance, netShadow?, riskProfile? }`
	- Expense: `{ _id, userId, category, amount, date, note?, paymentMethod? }`
	- Income: `{ _id, userId, source, amount, date }`
	- Investment: `{ _id, userId, type, amount, roi, riskLevel?, date }`
	- Notification: `{ _id, userId, type, title, text, read, ts }`
	- Budget: `{ _id, userId, month:'YYYY-MM', category?, limit }`
	- Goal: `{ _id, userId, name, targetAmount, targetDate:'YYYY-MM', active, createdAt }`

	## 7. Local Development

	Prereqs:
	- Node.js 18+
	- Python 3.10+
	- MongoDB running locally (or a connection string)

	Environment:
	- Backend `.env` (copy from `backend/app/.env.example`):
		- `MONGO_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
	- Frontend `.env`:
		- `VITE_API_BASE_URL=http://localhost:8000`

	Backend (Windows PowerShell):
	```powershell
	python -m venv .venv
	.venv\Scripts\activate
	pip install -r backend/app/requirements.txt
	uvicorn backend/app/main:app --reload --port 8000
	```

	Frontend (Windows PowerShell):
	```powershell
	cd frontend
	npm install
	npm run dev
	```

	## 8. Deployment Notes

	- Backend: containerize or deploy on a Python app host; ensure environment secrets are set; configure Stripe webhook endpoint.
	- Frontend: static hosting for the Vite build output; configure `VITE_API_BASE_URL` to point to your backend.
	- CORS: allow the frontend origin on the backend.
	- SSE: ensure reverse proxy supports streaming responses.

	## 9. Security & Compliance

	- JWT storage: client keeps access token; interceptor clears on 401 and redirects to login.
	- SSE auth: pass JWT as query parameter; validate on server.
	- Webhooks: verify Stripe signatures; never trust unauthenticated webhooks.
	- PII: avoid logging sensitive data; redact tokens/keys.
	- Rate limiting: consider reverse proxy or API gateway limits for public endpoints.

	## 10. Testing & QA

	- Unit tests: `backend/app/tests/` (pytest). Add more for controllers and routes.
	- Manual flows:
		- Auth signup/login, profile update
		- Expense/Income/Investment CRUD
		- Wallet top‑up via Stripe (test mode) + webhook
		- Wallet‑paid expenses create/update/delete adjustments
		- Goals create/list/set active/update/delete; progress endpoint
		- SSE notifications; mark‑as‑read/clear‑all
		- Smart Suggestions + apply endpoints

	## 11. Known Limitations / Roadmap

	- SSE fan‑out is in‑memory (single instance). For scale, replace with Redis pub/sub.
	- Budgets enforcement is basic; extend to server‑side checks and proactive alerts when crossing limits.
	- AI: Add cached embeddings or richer context windows for better personalization.
	- Analytics: add cohort metrics and trends over time.

	## 12. Maintainers

	- Owner: @HarshTiwari1131
	- Contributions: PRs welcome (lint, tests, docs with examples)

	---
	If you need a shorter one‑pager for submissions, use the root `README.md`. This `docs.md` is the canonical developer reference.

	## 13. Assistant Scope & Knowledge (Updated)

	The in‑app assistant has been expanded to cover general, educational finance knowledge in addition to the user’s FinAura data.

	- Allowed topics: budgeting, goal planning, savings strategies, risk profiles, diversification, compounding, SIPs/rupee‑cost averaging, high‑level stocks/equity, mutual funds/ETFs, bonds/debt, and crypto risk framing.
	- Guardrails: no recommendations of specific tickers/products; no external apps/software advice; respond with a clear constraints message when asked out‑of‑scope.
	- Safety: include a brief disclaimer: “This is educational, not financial advice.”

	Behavioral details:
	- About FinAura / identity questions (or when a user says “more detail”): the assistant returns a compact overview of features and why FinAura is different, plus a link to the maintainer GitHub profile: https://github.com/Harshtiwari1131
	- Context included in prompts: summary of income, expenses, net, wallet, invested, riskProfile, and the active goal if present.

	Sample prompts users can try:
	- “How much should I save monthly to hit my goal?”
	- “What’s a simple diversified allocation for a moderate risk profile?”
	- “Explain SIPs and why they help with market volatility.”
	- “I overspent this month—what can I trim and how to set a weekly cap?”
	- “What is the difference between equity mutual funds and bonds?”

	Assistant responses will combine user context (when available) with general finance knowledge and keep answers concise, practical, and educational.
