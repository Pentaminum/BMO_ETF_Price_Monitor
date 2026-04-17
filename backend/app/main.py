from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.handlers import setup_exception_handlers
from app.api.etf_endpoints import router as etf_router

app = FastAPI(title="BMO ETF Analytics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

setup_exception_handlers(app)
app.include_router(etf_router)
