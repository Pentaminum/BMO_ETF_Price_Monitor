from fastapi import FastAPI, UploadFile, File
from app.core.config import settings
from app.core.handlers import setup_exception_handlers
from app.repositories.price_repository import PriceRepository
from app.services.etf_analytics_service import ETFAnalyticsService

app = FastAPI()

setup_exception_handlers(app)
price_repo = PriceRepository()
etf_service = ETFAnalyticsService(price_repository=price_repo)

@app.get("/")
def read_root():
    return {"message": "backend running fine."}

@app.get("/price_data")
async def price_data():
    status = etf_service.get_price_data()
    
    return {
        "status": "success",
        "message": "Price data is loaded correctly.",
        "data": status
    }