from fastapi import APIRouter, Depends, UploadFile, File
from app.services.etf_analytics_service import ETFAnalyticsService
from app.repositories.price_repository import PriceRepository

router = APIRouter(prefix="/api/v1/etf", tags=["ETF"])

def get_etf_service():
    repo = PriceRepository()
    return ETFAnalyticsService(repo)

@router.post("/analyze_etf")
async def analyze_etf(
    file: UploadFile = File(...),
    etf_service: ETFAnalyticsService = Depends(get_etf_service)
):
    content = await file.read()
    csv_content = content.decode("utf-8")
    analyzed_etf = etf_service.analyze_etf(csv_content)
    
    return {
        "status": "success",
        "data": analyzed_etf
    }