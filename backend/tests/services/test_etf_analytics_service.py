import pytest
import pandas as pd
import io
from unittest.mock import MagicMock
from app.services.etf_analytics_service import ETFAnalyticsService
from app.core.exceptions import ValidationError, InvalidFileError
from app.schemas.etf_schema import ETFAnalysisData, ConstituentSchema

@pytest.fixture
def mock_repo():
    """mock repository"""
    repo = MagicMock()
    # set to return proper prices
    mock_data = pd.DataFrame(
        {"AAPL": [100, 110], "MSFT": [200, 210]},
        index=pd.Index(["2026-04-01", "2026-04-02"], name="DATE")
    )
    repo.get_all_prices.return_value = mock_data
    return repo

def test_analyze_etf_success(mock_repo):
    """
    Unit test for a valid csv file.
    """
    service = ETFAnalyticsService(mock_repo)
    csv_content = io.BytesIO(b"name,weight\nAAPL,0.5\nMSFT,0.5")
    
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

def test_analyze_etf_invalid_csv_columns(mock_repo):
    """
    Unit test for invalid CSV with wrong column names.
    """
    service = ETFAnalyticsService(mock_repo)
    wrong_columns_csv = io.BytesIO(b"ticker,percent\nAAPL,0.5\nMSFT,0.5")

    with pytest.raises(InvalidFileError) as exc:
        service.analyze_etf(wrong_columns_csv)

    assert "CSV must contain 'name' and 'weight' columns" in exc.value.message
    assert exc.value.error_code == "INVALID_FILE_ERROR"
    assert exc.value.status_code == 400

def test_analyze_etf_empty_csv(mock_repo):
    """
    Unit test for empty uploaded CSV content.
    """
    service = ETFAnalyticsService(mock_repo)
    empty_csv = io.BytesIO(b"name,weight\n")

    with pytest.raises(InvalidFileError) as exc:
        service.analyze_etf(empty_csv)

    assert "Uploaded CSV file is empty" in exc.value.message
    assert exc.value.error_code == "INVALID_FILE_ERROR"
    assert exc.value.status_code == 400

def test_analyze_etf_missing_constituent_name(mock_repo):
    """
    Unit test for missing constituent name.
    """
    service = ETFAnalyticsService(mock_repo)
    bad_csv = io.BytesIO(b"name,weight\n,0.5\nMSFT,0.5")

    with pytest.raises(InvalidFileError) as exc:
        service.analyze_etf(bad_csv)

    assert "missing constituent names" in exc.value.message.lower()
    assert exc.value.error_code == "INVALID_FILE_ERROR"
    assert exc.value.status_code == 400

def test_analyze_etf_missing_weight_value(mock_repo):
    """
    Unit test for missing weight values.
    """
    service = ETFAnalyticsService(mock_repo)
    bad_csv = io.BytesIO(b"name,weight\nAAPL,\nMSFT,1.0")

    with pytest.raises(InvalidFileError) as exc:
        service.analyze_etf(bad_csv)

    assert "Missing weight values for constituents" in exc.value.message
    assert "AAPL" in exc.value.message
    assert exc.value.error_code == "INVALID_FILE_ERROR"
    assert exc.value.status_code == 400

def test_analyze_etf_invalid_weight_value(mock_repo):
    """
    Unit test for non-numeric weight values.
    """
    service = ETFAnalyticsService(mock_repo)
    bad_csv = io.BytesIO(b"name,weight\nAAPL,abc\nMSFT,1.0")

    with pytest.raises(InvalidFileError) as exc:
        service.analyze_etf(bad_csv)

    assert "Invalid weight values for constituents" in exc.value.message
    assert "AAPL" in exc.value.message
    assert exc.value.error_code == "INVALID_FILE_ERROR"
    assert exc.value.status_code == 400

def test_analyze_etf_negative_weight_value(mock_repo):
    """
    Unit test for negative weight values.
    """
    service = ETFAnalyticsService(mock_repo)
    bad_csv = io.BytesIO(b"name,weight\nAAPL,-0.2\nMSFT,1.2")

    with pytest.raises(ValidationError) as exc:
        service.analyze_etf(bad_csv)

    assert "Negative weight values found for constituents" in exc.value.message
    assert "AAPL" in exc.value.message
    assert exc.value.error_code == "VALIDATION_ERROR"
    assert exc.value.status_code == 422

def test_analyze_etf_invalid_weight_sum(mock_repo):
    """
    Unit test for weight sum != 1.0 (0.998 ~ 1.002).
    """
    service = ETFAnalyticsService(mock_repo)
    bad_csv = io.BytesIO(b"name,weight\nAAPL,0.7\nMSFT,0.1") # 0.8    
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
    bad_csv = io.BytesIO(b"name,weight\nTSLA,1.0") # not in prices.csv
    
    with pytest.raises(ValidationError) as exc:
        service.analyze_etf(bad_csv)
    
    assert "Unsupported constituents" in str(exc.value.message)
    assert "TSLA" in str(exc.value.message)
    assert exc.value.error_code == "VALIDATION_ERROR"
    assert exc.value.status_code == 422

def test_analyze_etf_duplicate_constituents(mock_repo):
    """
    Unit test for duplicate constituents.
    """
    service = ETFAnalyticsService(mock_repo)
    duplicate_csv = io.BytesIO(b"name,weight\nAAPL,0.2\nAAPL,0.3\nMSFT,0.5")
    
    result = service.analyze_etf(duplicate_csv)
    
    assert len(result.all_constituents) == 2
    aapl_constituent = next(c for c in result.all_constituents if c.name == "AAPL")
    assert aapl_constituent.weight == 0.5

    assert aapl_constituent.holding_size == 55.0