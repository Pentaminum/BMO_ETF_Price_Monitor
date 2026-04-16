from fastapi import APIRouter, Depends
from app.services.etf_analytics_service import ETFAnalyticsService
from app.repositories.price_repository import PriceRepository

router = APIRouter(prefix="/api/v1/etf", tags=["ETF"])

def get_etf_service():
    repo = PriceRepository()
    return ETFAnalyticsService(repo)

@router.get("/price_data")
async def price_data(
    etf_service: ETFAnalyticsService = Depends(get_etf_service)
):
    data = etf_service.get_price_data()
    
    return {
        "status": "success",
        "message": "Price data is loaded correctly.",
        "data": data
    }