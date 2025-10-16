# FinAura Backend (FastAPI)

FastAPI backend for FinAura: JWT auth, MongoDB (Motor), AI insights, and Razorpay payments.

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
RAZORPAY_KEY=
RAZORPAY_SECRET=
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
- Payment: POST /api/payment/initiate, /verify
- AI: GET /api/ai/expense-predict, /investment-recommend

## Tests

```
pip install pytest httpx pytest-asyncio
pytest
```

## Contributors

- Harsh Tiwari (@HarshTiwari1131)
- Your Name Here (add yourself via PR)
