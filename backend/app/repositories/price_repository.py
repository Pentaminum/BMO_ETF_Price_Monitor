import pandas as pd
import os
import logging
from pathlib import Path
from app.core.config import settings

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
        if settings.DATA_SOURCE_TYPE == "CSV":
            path = Path(settings.DATA_PRICE_PATH)
            if not path.exists():
                logger.warning(f"Price data file not found at {path}")
                return pd.DataFrame()
            try:
                return pd.read_csv(path, index_col="DATE")
            except Exception as e:
                logger.error(f"Failed to read CSV at {path}: {e}")
                return pd.DataFrame()
        return pd.DataFrame() # Placeholder for future Database implementation (e.g., SQLAlchemy)