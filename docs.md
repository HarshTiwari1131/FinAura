# FinAura Documentation

This document gives a complete overview of the FinAura project: what it does, how it's built, how to run it, and why it's unique.

## 1. What is FinAura?

FinAura is an AI‑assisted personal finance platform that helps users:
- Track expenses and income
- Plan budgets and financial goals
- Simulate investments based on risk profile
- Link bank accounts (UX flow) and capture KYC details
- Get a cohesive, theme‑aware UI with responsive design

It is a full‑stack monorepo with a React + Vite frontend and a FastAPI backend on MongoDB.

## 2. Demo

Public demo: https://finaura-demo.example.com

Note: Replace this link with your actual deployment URL.

## 3. Key Features

- Smart Goal Planner
  - Create target goals, project progress using monthly savings, visualize ahead/behind state
  - Progress endpoint computes remaining months vs. ideal pace
- Investment Simulator
  - Run SIP simulations with adjustable parameters
  - Align scenarios to Low/Medium/High risk profiles
- Expense & Income Tracking
  - CRUD operations for expenses and income categories
  - Charts and insights for understanding cashflow
- Profile & Security
  - JWT auth, protected routes
  - KYC details capture (PAN, DOB, address) and status toggling
  - Bank linking UX (modal for connect/update/disconnect)
- Polished UX
  - Dark/Light theme powered by CSS variables
  - Consistent components (card-base, input, btn, btn-secondary)
  - Framer Motion animations and Recharts visualizations

## 4. Why FinAura is Unique

- End-to-end theme system: UI is built on CSS variables, so light/dark mode applies everywhere
- Holistic finance flow: income/expenses, goals, investments, and KYC live together cohesively
- Modular backend: FastAPI with clear controllers, models, and routes
- MongoDB with async Motor: scalable and responsive data layer
- Smooth UX details: loading skeletons, error boundaries, animated modals

## 5. Architecture Overview

Monorepo structure:

```
FinAura/
├─ frontend/   # React + Vite + Tailwind + Framer Motion + Recharts
└─ backend/    # FastAPI + Motor (MongoDB) + JWT + Razorpay
```

### Frontend
- React (Vite) with Tailwind
- ThemeContext sets `html[data-theme]` to `dark|light` and `styles.css` provides variables
- Axios instance with interceptor for JWT from localStorage
- Pages: Home, Dashboard, Profile, Expenses, Income, Investments, Goal Planner, etc.
- Components: Sidebar, Navbar (theme toggle), ErrorBoundary, GoalPlannerModal/Core, GoalProgressCard

### Backend
- FastAPI app with modular routers
- Mongo via Motor, ObjectId-safe serialization
- JWT auth and guarded routes
- Models
  - User (includes optional `kycStatus` and `kyc` details)
  - Goal models and controller for CRUD + progress
  - Expense/Income/Investment CRUD
- Startup ensures indices (e.g., unique on users.email, goals.userId)

## 6. API Summary

Base URL (local): http://localhost:8000

- Auth
  - POST `/api/auth/signup`
  - POST `/api/auth/login`
  - GET `/api/auth/profile`
  - PUT `/api/auth/profile` (update name, riskProfile, bankLinked, kycStatus, kyc)
  - POST `/api/auth/refresh`
- Goals
  - GET `/api/goals`
  - POST `/api/goals`
  - PUT `/api/goals/:id`
  - DELETE `/api/goals/:id`
  - GET `/api/goals/progress`
- Expenses `/api/expenses` (CRUD)
- Income `/api/income` (CRUD)
- Investments `/api/investment` (CRUD)
- Payments `/api/payment` (initiate/verify)
- AI `/api/ai/...` (expense predictions, investment recommendations)

Note: Endpoint details may evolve; check backend source for the latest schemas.

## 7. Local Development

### Backend

- Requirements: Python 3.10+
- Create and activate a virtual environment
- Install requirements and run FastAPI

Windows PowerShell example:

```
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r backend/app/requirements.txt
uvicorn backend/app/main:app --reload --port 8000
```

Environment variables (backend):
- `MONGO_URI` (e.g., `mongodb://localhost:27017/finaura`)
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `RAZORPAY_KEY`, `RAZORPAY_SECRET` (if payments used)

### Frontend

- Requirements: Node.js 18+
- Create `.env` in `frontend` with:

```
VITE_API_BASE_URL=http://localhost:8000
```

- Install and run:

```
cd frontend
npm install
npm run dev
```

App runs at http://localhost:5173

## 8. Deployment Overview

- Backend
  - Containerize FastAPI (Uvicorn/Gunicorn) and configure env vars
  - Managed MongoDB (Atlas) recommended
  - Use HTTPS behind a reverse proxy (nginx) and rotate JWT secrets
- Frontend
  - Build with `npm run build` and deploy static assets (Netlify/Vercel/S3+CloudFront)
  - Set `VITE_API_BASE_URL` to backend URL

## 9. Testing

- Backend: `pytest` + `pytest-asyncio`

```
pip install pytest pytest-asyncio httpx
pytest
```

- Frontend: add unit tests with Vitest/RTL (optional)

## 10. Roadmap

- Prefill KYC modal from saved profile
- Persist bank details (bank name, masked account number, IFSC) with validation
- Add more AI endpoints and insights on dashboard
- Add automated frontend tests and e2e smoke tests

## 11. Contributors

- Harsh Tiwari (@HarshTiwari1131)
- Your Name Here (add yourself via PR)

## 12. License

For hackathon/demo purposes. Consider using MIT or Apache‑2.0 for wider adoption.
