import logging
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.core.exceptions import ETFApplicationError

logger = logging.getLogger(__name__)


async def business_exception_handler(request: Request, exc: ETFApplicationError):
    """Custom business error handler"""
    logger.warning(f"{exc.error_code}: {exc.message} at {request.url}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "message": exc.message,
            "error_type": exc.error_code
        }
    )

async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """FastAPI HTTP error handler (e.g. 404 Not Found)"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error", 
            "message": exc.detail,
            "error_type": "HTTP_EXCEPTION"
        }
    )

async def general_exception_handler(request: Request, exc: Exception):
    """Unexpected server error handler"""
    logger.error(f"UNEXPECTED_ERROR: {str(exc)}", exc_info=True)

    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "message": "An unexpected server error occurred.",
            "error_type": "INTERNAL_SERVER_ERROR"
        }
    )

# setup all handlers
def setup_exception_handlers(app):
    app.add_exception_handler(ETFApplicationError, business_exception_handler)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(Exception, general_exception_handler)