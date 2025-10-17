# FinAura Frontend (Vite + React + Tailwind)

Demo: https://finaura-demo.example.com  
Docs: see `../docs.md`

## Setup

1. Create `.env` and set API base:

```
VITE_API_BASE_URL=http://localhost:8000
```

2. Install and run

```
npm install
npm run dev
```

App runs at http://localhost:5173

## Highlights

- Multiple Goals UI: Dashboard shows active goal progress and chip switcher; Goal Planner lists all goals with Add/Set Active/Edit/Delete.
- Smart Suggestions: Apply actions inline; items hide optimistically and refresh.
- Wallet Paid Expenses: When you log an expense with Payment Method = Wallet, dashboard wallet updates instantly.
