from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes.authRoutes import router as auth_router
from .routes.expenseRoutes import router as expense_router
from .routes.incomeRoutes import router as income_router
from .routes.budgetRoutes import router as budget_router
from .routes.investmentRoutes import router as investment_router
from .routes.aiRoutes import router as ai_router
from .routes.paymentRoutes import router as payment_router

app = FastAPI(title="FinAura API", version="0.1.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health
@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/health/db")
async def health_db():
    from .utils.dbConnect import ping_db
    return await ping_db()

@app.on_event("startup")
async def on_startup():
    # Create unique index on users.email for safety
    from .utils.dbConnect import get_db
    db = await get_db()
    await db["users"].create_index("email", unique=True)

# Routers
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(expense_router, prefix="/api/expenses", tags=["expenses"])
app.include_router(income_router, prefix="/api/income", tags=["income"])
app.include_router(budget_router, prefix="/api/budget", tags=["budget"])
app.include_router(investment_router, prefix="/api/investment", tags=["investment"])
app.include_router(payment_router, prefix="/api/payment", tags=["payment"])
app.include_router(ai_router, prefix="/api/ai", tags=["ai"])
