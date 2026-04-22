from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.handlers import setup_exception_handlers
from app.api.etf_endpoints import router as etf_router, get_etf_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    get_etf_service() # Preload historical price data into memory on startup
    yield

app = FastAPI(title="BMO ETF Analytics API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

setup_exception_handlers(app)
app.include_router(etf_router)

@app.get("/health", tags=["Health Check"])
async def health_check():
    return {
        "status": "online",
        "message": "BMO ETF Analytics Backend is running fine.",
        "version": "1.0.0"
    }
