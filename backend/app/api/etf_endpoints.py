from fastapi import APIRouter, Depends, UploadFile, File
from app.services.etf_analytics_service import ETFAnalyticsService
from app.repositories.price_repository import PriceRepository
from app.core.exceptions import InvalidFileError
from app.schemas.etf_schema import ETFAnalysisResponse, ErrorResponse

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

@router.post(
    "/analyze_etf",
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
    if not file.filename.endswith('.csv'):
        raise InvalidFileError("Only CSV files are supported.")

    content = await file.read()
    csv_content = content.decode("utf-8")
    analyzed_etf = etf_service.analyze_etf(csv_content)
    
    return ETFAnalysisResponse(
        status="success",
        data=analyzed_etf
    )