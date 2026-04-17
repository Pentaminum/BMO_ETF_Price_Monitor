import pandas as pd
import pytest
from pathlib import Path
from unittest.mock import patch
from app.repositories.price_repository import PriceRepository

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
        
        df = repo.get_all_prices()
        
        assert isinstance(df, pd.DataFrame)
        assert df.empty

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
        
        df = repo.get_all_prices()
        
        assert df.empty