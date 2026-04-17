import pandas as pd
import logging
from io import StringIO
from app.repositories.price_repository import PriceRepository
from app.core.exceptions import ETFApplicationError, InvalidFileError, ValidationError
from app.schemas.etf_schema import ETFAnalysisData, ConstituentSchema

logger = logging.getLogger(__name__)

class ETFAnalyticsService:
    """
    Service layer for processing ETF data and calculating financial metrics.
    Implements the core business logic for ETF price reconstruction and analysis.
    """
    def __init__(self, price_repository: PriceRepository):
        self.price_repo = price_repository
        # Pre-load historical prices to memory for performance optimization
        self._prices_df = self.price_repo.get_all_prices()
        if self._prices_df.empty:
            raise ETFApplicationError(
                    message="Internal price database is missing or empty.",
                    error_code="INTERNAL_SERVER_ERROR",
                    status_code=500
                )

    def analyze_etf(self, csv_content: str) -> ETFAnalysisData:
        """
        Main entry point for ETF analysis.
        Returns calculated history, table data, and top holdings.
        """
        logger.info("Starting ETF analysis request")

        # 1. Parsing & Validation
        etf_df = self._parse_composition_csv(csv_content)
        self._validate_weights(etf_df)

        # 2. Check Data Availability
        input_constituents = etf_df['name'].unique().tolist()
        available_constituents = self._prices_df.columns.tolist()
        missing = list(set(input_constituents) - set(available_constituents))

        if missing:
            raise ValidationError(f"Unsupported constituents: {', '.join(missing)}")
        
        # 3. Calculations
        # - Reconstruct ETF Price History (Time Series)
        history = self._calculate_price_history(etf_df, input_constituents)

        # - Map Latest Prices for Table & Analysis
        enriched_df = self._enrich_with_latest_market_data(etf_df)

        # - Get Top 5 Holdings (Bar Chart)
        top_5 = self._get_top_holdings(enriched_df, top_n=5)

        logger.info(f"Analysis complete for {len(input_constituents)} constituents.")

        # 4. Return Schema Models
        return ETFAnalysisData(
            reconstructed_history=history.to_dict(),
            all_constituents=[ConstituentSchema(**item) for item in enriched_df.to_dict(orient='records')],
            top_5_holdings=[ConstituentSchema(**item) for item in top_5.to_dict(orient='records')]
        )

    # --- Private Calculation Methods ---
    
    def _parse_composition_csv(self, csv_content: str) -> pd.DataFrame:
        try:
            df = pd.read_csv(StringIO(csv_content))
            if not {'name', 'weight'}.issubset(df.columns):
                raise InvalidFileError("CSV must contain 'name' and 'weight' columns.")
            return df
        except Exception as e:
            if isinstance(e, InvalidFileError): raise e
            raise InvalidFileError(f"Invalid CSV format: {str(e)}")
    
    def _validate_weights(self, etf_df: pd.DataFrame):
        if etf_df['weight'].isnull().any():
            missing_constituents = etf_df[etf_df['weight'].isnull()]['name'].tolist()
            raise InvalidFileError(f"Missing weight values for: {', '.join(missing_constituents)}")
        
        total_weight = etf_df['weight'].sum()
        # Using 20bps tolerance for potential floating point errors
        if not (0.998 <= total_weight <= 1.002):
            raise ValidationError(f"Invalid weight sum: {total_weight:.4f}. Must be ~1.0")
        
    def _calculate_price_history(self, etf_df: pd.DataFrame, constituents: List[str]) -> pd.Series:
        """Reconstructs ETF daily prices using weighted sum of constituents."""
        weights = etf_df.set_index('name')['weight'].loc[constituents]
        prices = self._prices_df[constituents]
        
        # Vectorized weighted sum: (Price_t_i * Weight_i)
        return (prices * weights).sum(axis=1).round(6)

    def _enrich_with_latest_market_data(self, etf_df: pd.DataFrame) -> pd.DataFrame:
        """Adds latest close price and holding size to the composition dataframe."""
        df = etf_df.copy()
        latest_prices = self._prices_df.iloc[-1]
        
        df['latest_close_price'] = df['name'].map(latest_prices)
        # Holding Size = Weight * Price
        df['holding_size'] = (df['weight'] * df['latest_close_price']).round(6)
        
        return df
    
    def _get_top_holdings(self, enriched_df: pd.DataFrame, top_n: int) -> pd.DataFrame:
        """Extracts top N holdings by size."""
        return enriched_df.sort_values(by='holding_size', ascending=False).head(top_n)