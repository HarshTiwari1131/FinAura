# FinAura — Your AI‑Powered Path to Smarter Money

FinAura is a full‑stack, AI‑driven personal finance platform. Track expenses, plan budgets, simulate investments, create multiple goals (with an Active goal), and make secure payments — with a polished UI and dark/light themes.

• Demo: https://finaura-demo.example.com  
• Docs: see `docs.md`

## Monorepo Layout

```
FinAura/
├─ frontend/   # Vite + React + Tailwind + Framer Motion + Recharts
└─ backend/    # FastAPI + MongoDB (Motor) + JWT + Stripe
```

## Key Features

- Multiple Goals with Active selection + progress projections
- Investment simulator aligned to risk profile
- Expense and income tracking with insights; wallet‑paid expense handling (auto‑deduct/refund)
- Budget caps per category via Smart Suggestions apply endpoints
- Real‑time Notifications (SSE) with drawer UI
- In‑app AI assistant (Gemini/Longcat) constrained to FinAura data
- Stripe Checkout for wallet top‑ups
- JWT auth, protected API routes, profile management
- Polished dark/light theme toggle across the app

## Quick Start

1) Backend
- Follow `backend/README.md` to create a virtualenv, install requirements, and run uvicorn.

2) Frontend
- Follow `frontend/README.md` to set `VITE_API_BASE_URL`, install deps, and run dev server.

## Environment Variables (overview)

- Frontend: `VITE_API_BASE_URL`
- Backend: `MONGO_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`

## Contributors

- Harsh Tiwari (@HarshTiwari1131)
- Your Name Here (add yourself via PR)

## License

For hackathon/demo purposes. Replace with an OSI license (MIT/Apache-2.0) for broader use.
