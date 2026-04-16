class ETFApplicationError(Exception):
    """Base class for all business-related errors in this app."""
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

class DataNotFoundError(ETFApplicationError):
    """Raised when a required file or data record is missing."""
    def __init__(self, message: str = "Requested data not found"):
        super().__init__(message, status_code=404)

class InvalidFileError(ETFApplicationError):
    """Raised when the uploaded file is invalid or corrupted."""
    def __init__(self, message: str = "Invalid file format"):
        super().__init__(message, status_code=400)