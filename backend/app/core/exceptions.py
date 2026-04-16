class ETFApplicationError(Exception):
    """Base class for all business-related errors in this app."""
    def __init__(self, message: str, error_code: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        super().__init__(self.message)

class DataNotFoundError(ETFApplicationError):
    """Raised when a required file or data record is missing."""
    def __init__(self, message: str = "Requested data not found"):
        super().__init__(message, error_code="DATA_NOT_FOUND_ERROR", status_code=404)

class InvalidFileError(ETFApplicationError):
    """Raised when the uploaded file is invalid (e.g. wrong column names, empty row)"""
    def __init__(self, message: str = "Invalid file format"):
        super().__init__(message, error_code="INVALID_FILE_ERROR", status_code=400)

class ValidationError(ETFApplicationError):
    """Raised when the business logic cannot be procssed (e.g. weight total != 0, unavailable constituents)"""
    def __init__(self, message: str):
        super().__init__(message, error_code="VALIDATION_ERROR", status_code=422)