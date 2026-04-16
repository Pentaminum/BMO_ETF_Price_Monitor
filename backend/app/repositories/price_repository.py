import pandas as pd
import os
from app.core.config import settings

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
            if not os.path.exists(settings.DATA_PRICE_PATH): # if file doesn't exist
                return pd.DataFrame()
            try:
                return pd.read_csv(settings.DATA_PRICE_PATH, index_col="DATE")
            except Exception:
                # if file is empty or invalid format
                return pd.DataFrame()
        return pd.DataFrame() # Placeholder for future Database implementation (e.g., SQLAlchemy)