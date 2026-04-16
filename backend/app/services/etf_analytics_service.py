import pandas as pd
from io import StringIO
from app.repositories.price_repository import PriceRepository
from app.core.exceptions import ETFApplicationError

class ETFAnalyticsService:
    """
    Service layer for processing ETF data and calculating financial metrics.
    Implements the core business logic for ETF price reconstruction and analysis.
    """
    def __init__(self, price_repository: PriceRepository):
        self.price_repo = price_repository
        # Pre-load historical prices to memory for performance optimization
        self._prices_df = self.price_repo.get_all_prices()

    def get_price_data(self):
        if self._prices_df is None or self._prices_df.empty:
            raise ETFApplicationError("Price data not found or failed to load.", status_code=500)
            
        return {
            "shape": self._prices_df.shape,
            "columns": list(self._prices_df.columns),
            "sample": self._prices_df.head(1).to_dict()
        }