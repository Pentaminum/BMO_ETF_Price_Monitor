from fastapi import APIRouter, Depends, UploadFile, File
from functools import lru_cache
from app.services.etf_analytics_service import ETFAnalyticsService
from app.repositories.price_repository import PriceRepository
from app.core.exceptions import InvalidFileError
from app.schemas.etf_schema import ETFAnalysisResponse, ErrorResponse

router = APIRouter(prefix="/api/v1")

@lru_cache
def get_etf_service():
    repo = PriceRepository()
    return ETFAnalyticsService(repo)

@router.post(
    "/analyze_etf",
    tags=["ETF Analysis"],
    response_model=ETFAnalysisResponse,
    responses={
        400: {
            "model": ErrorResponse,
            "description": "Invalid File Format",
            "content": {
                "application/json": {
                    "example": {
                        "status": "error",
                        "message": "Only CSV files are supported.",
                        "error_type": "INVALID_FILE_ERROR"
                    }
                }
            }
        },
        422: {
            "model": ErrorResponse,
            "description": "Validation Error (Weights/Constituents)",
            "content": {
                "application/json": {
                    "example": {
                        "status": "error",
                        "message": "Invalid weight sum: 1.0500. Must be ~1.0",
                        "error_type": "VALIDATION_ERROR"
                    }
                }
            }
        },
        500: {
            "model": ErrorResponse,
            "description": "Internal Server Error",
            "content": {
                "application/json": {
                    "example": {
                        "status": "error",
                        "message": "Internal price database is missing or empty.",
                        "error_type": "INTERNAL_SERVER_ERROR"
                    }
                }
            }
        }
    }
)
async def analyze_etf(
    file: UploadFile = File(...),
    etf_service: ETFAnalyticsService = Depends(get_etf_service)
):
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise InvalidFileError("Only CSV files are supported.")

    analyzed_etf = etf_service.analyze_etf(file.file)
    
    return ETFAnalysisResponse(
        status="success",
        data=analyzed_etf
    )