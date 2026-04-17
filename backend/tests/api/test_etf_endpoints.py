import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.api.etf_endpoints import get_etf_service
from unittest.mock import MagicMock

client = TestClient(app)

@pytest.fixture
def mock_service():
    """
    mock service
    """
    service = MagicMock()
    mock_result = {
        "reconstructed_history": {
            "2026-04-01": 150.0, # (100*0.5 + 200*0.5)
            "2026-04-02": 160.0  # (110*0.5 + 210*0.5)
        },
        "all_constituents": [
            {"name": "MSFT", "weight": 0.5, "latest_close_price": 210.0, "holding_size": 105.0},
            {"name": "AAPL", "weight": 0.5, "latest_close_price": 110.0, "holding_size": 55.0}
        ],
        "top_5_holdings": [
            {"name": "MSFT", "holding_size": 105.0},
            {"name": "AAPL", "holding_size": 55.0}
        ]
    }
    service.analyze_etf.return_value = mock_result
    return service

@pytest.fixture
def override_etf_service(mock_service):
    # Mock Injection
    app.dependency_overrides[get_etf_service] = lambda: mock_service
    yield
    app.dependency_overrides = {} # reset regardless of test result

def test_analyze_etf_endpoint_success(mock_service):
    """
    Unit test for successful API call
    """ 
    csv_data = "name,weight\nAAPL,0.5\nMSFT,0.5"
    response = client.post(
        "/api/v1/etf/analyze_etf",
        files={"file": ("ETF_test.csv", csv_data, "text/csv")}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["data"]["reconstructed_history"]["2026-04-02"] == 160.0
    assert data["data"]["top_5_holdings"][0]["name"] == "MSFT"

def test_analyze_etf_endpoint_invalid_extension():
    """
    Unit test for invalid file extension (no CSV)
    """

    response = client.post(
        "/api/v1/etf/analyze_etf",
        files={"file": ("test.txt", "test file", "text/plain")}
    )

    assert "Only CSV files are supported" in response.json()["message"]
    assert response.json()["error_type"] == "INVALID_FILE_ERROR"
    assert response.status_code == 400
