from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.core.exceptions import ETFApplicationError

# custom errors
async def business_exception_handler(request: Request, exc: ETFApplicationError):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "message": exc.message,
            "error_type": exc.__class__.__name__ # class name as error type
        }
    )

# FastAPI/Starlette HTTP errors (404 Not Found etc.)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error", 
            "message": exc.detail,
            "error_type": "HTTP_EXCEPTION"
        }
    )

# any unexpected server/python errors (500 Internal Server Error)
async def general_exception_handler(request: Request, exc: Exception):
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