import pandas as pd
import pytest
from pathlib import Path
from unittest.mock import patch
from app.repositories.price_repository import PriceRepository
from app.core.exceptions import ETFApplicationError

@pytest.fixture
def repo():
    return PriceRepository()

def test_get_all_prices_success(repo, tmp_path):
    """
    Unit test for valid prices.csv
    """
    # temp file
    d = tmp_path / "data"
    d.mkdir()
    file_path = d / "prices.csv"
    file_path.write_text("DATE,AAPL,MSFT\n2026-04-01,150.0,300.0")

    # change settings path to temp file (Mocking settings)
    with patch("app.repositories.price_repository.settings") as mock_settings:
        mock_settings.DATA_SOURCE_TYPE = "CSV"
        mock_settings.DATA_PRICE_PATH = str(file_path)
        
        df = repo.get_all_prices()
        
        assert not df.empty
        assert "AAPL" in df.columns
        assert df.index.name == "DATE"
        assert df.loc["2026-04-01", "AAPL"] == 150.0

def test_get_all_prices_file_not_found(repo):
    """
    Unit test for missing prices.csv
    """
    with patch("app.repositories.price_repository.settings") as mock_settings:
        mock_settings.DATA_SOURCE_TYPE = "CSV"
        mock_settings.DATA_PRICE_PATH = "wrong_path.csv"
        
        with pytest.raises(ETFApplicationError) as exc:
            repo.get_all_prices()

        assert "Internal price database is missing or empty." in exc.value.message
        assert exc.value.error_code == "INTERNAL_SERVER_ERROR"
        assert exc.value.status_code == 500

def test_get_all_prices_invalid_csv(repo, tmp_path):
    """
    Unit test for invalid prices.csv
    """
    # temp file
    d = tmp_path / "data"
    d.mkdir()
    file_path = d / "prices.csv"
    file_path.write_text("this,is,not,a,proper,csv") # NO "DATE"

    with patch("app.repositories.price_repository.settings") as mock_settings:
        mock_settings.DATA_SOURCE_TYPE = "CSV"
        mock_settings.DATA_PRICE_PATH = str(file_path)
        
        with pytest.raises(ETFApplicationError) as exc:
            repo.get_all_prices()

        assert "Internal price database is missing or empty." in exc.value.message
        assert exc.value.error_code == "INTERNAL_SERVER_ERROR"
        assert exc.value.status_code == 500

def test_get_all_prices_empty_csv(repo, tmp_path):
    """
    Unit test for empty prices.csv after parsing
    """
    d = tmp_path / "data"
    d.mkdir()
    file_path = d / "prices.csv"
    file_path.write_text("DATE,AAPL,MSFT\n")

    with patch("app.repositories.price_repository.settings") as mock_settings:
        mock_settings.DATA_SOURCE_TYPE = "CSV"
        mock_settings.DATA_PRICE_PATH = str(file_path)

        with pytest.raises(ETFApplicationError) as exc:
            repo.get_all_prices()

        assert "Internal price database is missing or empty." in exc.value.message
        assert exc.value.error_code == "INTERNAL_SERVER_ERROR"
        assert exc.value.status_code == 500

def test_get_all_prices_unsupported_data_source(repo):
    """
    Unit test for unsupported data source type
    """
    with patch("app.repositories.price_repository.settings") as mock_settings:
        mock_settings.DATA_SOURCE_TYPE = "DB"
        mock_settings.DATA_PRICE_PATH = "unused.csv"

        with pytest.raises(ETFApplicationError) as exc:
            repo.get_all_prices()

        assert "Unsupported data source type: DB" in exc.value.message
        assert exc.value.error_code == "INTERNAL_SERVER_ERROR"
        assert exc.value.status_code == 500