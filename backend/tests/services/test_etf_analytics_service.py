import pytest
import pandas as pd
from unittest.mock import MagicMock
from app.services.etf_analytics_service import ETFAnalyticsService
from app.core.exceptions import ValidationError, InvalidFileError, ETFApplicationError
from app.schemas.etf_schema import ETFAnalysisData, ConstituentSchema

@pytest.fixture
def mock_repo():
    """mock repository"""
    repo = MagicMock()
    # set to return propert prices
    mock_data = pd.DataFrame(
        {"AAPL": [100, 110], "MSFT": [200, 210]},
        index=pd.Index(["2026-04-01", "2026-04-02"], name="DATE")
    )
    repo.get_all_prices.return_value = mock_data
    return repo

def test_if_repo_empty():
    """
    Unit test if repository is empty
    """
    empty_repo = MagicMock()
    empty_repo.get_all_prices.return_value = pd.DataFrame()
    
    with pytest.raises(ETFApplicationError) as exc:
        ETFAnalyticsService(empty_repo)
    
    assert "Internal price database" in exc.value.message
    assert exc.value.error_code == "INTERNAL_SERVER_ERROR"
    assert exc.value.status_code == 500

def test_analyze_etf_success(mock_repo):
    """
    Unit test for a valid csv file
    """
    service = ETFAnalyticsService(mock_repo)
    csv_content = "name,weight\nAAPL,0.5\nMSFT,0.5"
    
    result = service.analyze_etf(csv_content)
    
    assert isinstance(result, ETFAnalysisData)

    assert "2026-04-02" in result.reconstructed_history
    assert result.reconstructed_history["2026-04-02"] == 160.0 # (110 * 0.5) + (210 * 0.5) = 160.0

    assert len(result.all_constituents) == 2
    assert isinstance(result.all_constituents[0], ConstituentSchema)

    top_holdings = result.top_5_holdings
    assert len(top_holdings) == 2

    # MSFT > AAPL
    assert top_holdings[0].name == "MSFT"
    assert top_holdings[0].holding_size == 105.0
    assert top_holdings[0].latest_close_price == 210.0
    assert top_holdings[1].name == "AAPL"
    assert top_holdings[1].holding_size == 55.0

def test_analyze_etf_invalid_csv(mock_repo):
    """
    Unit test for invalid csv
    """
    service = ETFAnalyticsService(mock_repo)
    wrong_columns_csv = "ticker,percent\nAAPL,0.5\nMSFT,0.5" # wrong column names
    
    with pytest.raises(InvalidFileError) as exc:
        service.analyze_etf(wrong_columns_csv)
    
    assert "CSV must contain 'name' and 'weight' columns" in str(exc.value.message)
    assert exc.value.error_code == "INVALID_FILE_ERROR"
    assert exc.value.status_code == 400

def test_analyze_etf_invalid_weight_sum(mock_repo):
    """
    Unit test for weight sum != 1.0 (0.998 ~ 1.002)
    """
    service = ETFAnalyticsService(mock_repo)
    bad_csv = "name,weight\nAAPL,0.7\nMSFT,0.1" # 0.8    
    with pytest.raises(ValidationError) as exc:
        service.analyze_etf(bad_csv)
    
    assert "Invalid weight sum" in str(exc.value.message)
    assert "0.8000" in str(exc.value.message)
    assert exc.value.error_code == "VALIDATION_ERROR"
    assert exc.value.status_code == 422

def test_analyze_etf_unsupported_constituent(mock_repo):
    """
    Unit test for an ETF file with constituents that are not in prices.csv
    """
    service = ETFAnalyticsService(mock_repo)
    bad_csv = "name,weight\nTSLA,1.0" # not in prices.csv
    
    with pytest.raises(ValidationError) as exc:
        service.analyze_etf(bad_csv)
    
    assert "Unsupported constituents" in str(exc.value.message)
    assert "TSLA" in str(exc.value.message)
    assert exc.value.error_code == "VALIDATION_ERROR"
    assert exc.value.status_code == 422