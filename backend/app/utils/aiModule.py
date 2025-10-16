from typing import List, Dict, Any
import numpy as np

try:
    from sklearn.linear_model import LinearRegression
except Exception:  # sklearn may not be installed yet in editor
    LinearRegression = None


async def predict_expenses(user_transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
    # Expect transactions sorted by date with 'amount'
    if not user_transactions:
        return {"next_month_prediction": 0.0, "confidence": 0.0}

    # Simple monthly sum feature
    # Group by month index (0..n-1)
    monthly = {}
    for t in user_transactions:
        m = t.get("month_index", 0)
        monthly[m] = monthly.get(m, 0) + float(t.get("amount", 0))

    xs = np.array(list(monthly.keys()), dtype=float).reshape(-1, 1)
    ys = np.array(list(monthly.values()), dtype=float)

    if len(xs) < 2 or LinearRegression is None:
        pred = float(np.mean(ys)) if len(ys) else 0.0
        return {"next_month_prediction": round(pred, 2), "confidence": 0.5}

    model = LinearRegression()
    model.fit(xs, ys)
    next_x = np.array([[max(monthly.keys()) + 1]], dtype=float)
    pred = float(model.predict(next_x)[0])
    return {"next_month_prediction": round(max(pred, 0.0), 2), "confidence": 0.75}


async def recommend_investments(risk_profile: str, budget: float) -> Dict[str, Any]:
    risk_profile = (risk_profile or "moderate").lower()
    if budget <= 0:
        return {"recommendations": []}

    options = {
        "conservative": [
            {"type": "Fixed Deposit", "expected_roi": 0.06, "allocation": 0.7},
            {"type": "Debt Mutual Fund", "expected_roi": 0.08, "allocation": 0.3},
        ],
        "moderate": [
            {"type": "Index Fund", "expected_roi": 0.11, "allocation": 0.6},
            {"type": "Hybrid Fund", "expected_roi": 0.09, "allocation": 0.4},
        ],
        "aggressive": [
            {"type": "Equity Mutual Fund", "expected_roi": 0.14, "allocation": 0.6},
            {"type": "Direct Equity (Blue-chip)", "expected_roi": 0.16, "allocation": 0.4},
        ],
    }

    recs = options.get(risk_profile, options["moderate"])
    for r in recs:
        r["suggested_amount"] = round(r["allocation"] * budget, 2)
    return {"risk_profile": risk_profile, "budget": budget, "recommendations": recs}
