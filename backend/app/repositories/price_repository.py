import pandas as pd
import os
import logging
from pathlib import Path
from app.core.config import settings
from app.core.exceptions import ETFApplicationError

logger = logging.getLogger(__name__)

class PriceRepository:
    """
    Data access layer for retrieving historical price information.
    Designed to decouple business logic from the specific storage implementation.
    """

    def get_all_prices(self) -> pd.DataFrame:
        """
        Retrieves all historical price data from the configured data source.
        Returns an empty DataFrame if the file is missing or invalid  to ensure the server starts gracefully.

        """
        if settings.DATA_SOURCE_TYPE != "CSV":
            raise ETFApplicationError(
                message=f"Unsupported data source type: {settings.DATA_SOURCE_TYPE}",
                error_code="INTERNAL_SERVER_ERROR",
                status_code=500,
            )

        path = Path(settings.DATA_PRICE_PATH)

        if not path.exists():
            logger.error(f"Price data file not found at {path}")
            raise ETFApplicationError(
                message="Internal price database is missing or empty.",
                error_code="INTERNAL_SERVER_ERROR",
                status_code=500,
            )

        try:
            df = pd.read_csv(path, index_col="DATE")
        except Exception as e:
            logger.error(f"Failed to read CSV at {path}: {e}")
            raise ETFApplicationError(
                message="Internal price database is missing or empty.",
                error_code="INTERNAL_SERVER_ERROR",
                status_code=500,
            )

        if df.empty:
            logger.error(f"Price data CSV is empty at {path}")
            raise ETFApplicationError(
                message="Internal price database is missing or empty.",
                error_code="INTERNAL_SERVER_ERROR",
                status_code=500,
            )

        return df # Placeholder for future Database implementation (e.g., SQLAlchemy)