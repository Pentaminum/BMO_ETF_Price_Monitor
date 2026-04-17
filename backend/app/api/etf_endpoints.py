from fastapi import APIRouter, Depends, UploadFile, File
from app.services.etf_analytics_service import ETFAnalyticsService
from app.repositories.price_repository import PriceRepository
from app.core.exceptions import InvalidFileError

router = APIRouter(prefix="/api/v1")

def get_etf_service():
    repo = PriceRepository()
    return ETFAnalyticsService(repo)

@router.get("/", tags=["Health Check"])
async def health_check():
    """
    Service health check endpoint to verify the server is running.
    """
    return {
        "status": "online",
        "message": "BMO ETF Analytics Backend is running fine.",
        "version": "1.0.0"
    }

@router.post("/analyze_etf")
async def analyze_etf(
    file: UploadFile = File(...),
    etf_service: ETFAnalyticsService = Depends(get_etf_service)
):
    if not file.filename.endswith('.csv'):
        raise InvalidFileError("Only CSV files are supported.")

    content = await file.read()
    csv_content = content.decode("utf-8")
    analyzed_etf = etf_service.analyze_etf(csv_content)
    
    return {
        "status": "success",
        "data": analyzed_etf
    }