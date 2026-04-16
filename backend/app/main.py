from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.handlers import setup_exception_handlers
from app.repositories.price_repository import PriceRepository
from app.services.etf_analytics_service import ETFAnalyticsService

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

setup_exception_handlers(app)
price_repo = PriceRepository()
etf_service = ETFAnalyticsService(price_repository=price_repo)

@app.get("/")
def read_root():
    return {"message": "backend running fine."}

@app.post("/analyze_etf")
async def analyze_etf(file: UploadFile = File(...)):
    content = await file.read()
    csv_content = content.decode("utf-8")
    analyzed_etf = etf_service.analyze_etf(csv_content)
    
    return {
        "status": "success",
        "data": analyzed_etf
    }