# FinAura Backend (FastAPI)

FastAPI backend for FinAura: JWT auth, MongoDB (Motor), AI insights, and Stripe payments.

Demo: https://finaura-demo.example.com  
Docs: see `../docs.md`

## Setup

1. Python 3.10+
2. Create a virtual env and install requirements

### Environment

Copy `.env.example` to `.env` and fill values.

```
MONGO_URI=mongodb://localhost:27017/finaura
JWT_ACCESS_SECRET=change-me
JWT_REFRESH_SECRET=change-me-too
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

### Install

```
python -m venv .venv
.venv\\Scripts\\activate
pip install -r app/requirements.txt
```

### Run

```
uvicorn app.main:app --reload --port 8000
```

API base: http://localhost:8000

## Routes

- Auth: POST /api/auth/signup, /login, GET/PUT /profile, POST /refresh
- Expenses: CRUD /api/expenses
- Income: CRUD /api/income
- Budget: CRUD /api/budget
- Investment: CRUD /api/investment
- Payment: POST /api/payment/initiate, POST /api/payment/webhook
- AI: GET /api/ai/expense-predict, /investment-recommend, /chat, /suggestions
- Goals (multiple):
	- GET /api/goals (list)
	- POST /api/goals (create; active optional)
	- GET /api/goals/active
	- POST /api/goals/{goal_id}/active
	- PUT /api/goals/{goal_id}
	- DELETE /api/goals/{goal_id}
	- GET /api/goals/progress, POST /api/goals/notify-progress

### Wallet-Paid Expenses
- When creating an expense with `paymentMethod: 'Wallet'`, the user's wallet is debited by the amount.
- On updating an expense, wallet is adjusted for changes in amount or payment method.
- On deleting a wallet-paid expense, the amount is refunded to the wallet.

## Tests

```
pip install pytest httpx pytest-asyncio
pytest
```

## Contributors

- Harsh Tiwari (@HarshTiwari1131)
- Your Name Here (add yourself via PR)
