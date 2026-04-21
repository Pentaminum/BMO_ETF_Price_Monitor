import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.api.etf_endpoints import get_etf_service
from unittest.mock import MagicMock
from app.schemas.etf_schema import ConstituentSchema, ETFAnalysisData,  ETFAnalysisResponse, ErrorResponse

client = TestClient(app)

@pytest.fixture
def mock_service():
    """
    mock service
    """
    service = MagicMock()
    all_constituents = [
        ConstituentSchema(name="MSFT", weight=0.5, latest_close_price=210.0, holding_size=105.0),
        ConstituentSchema(name="AAPL", weight=0.5, latest_close_price=110.0, holding_size=55.0)
    ]

    mock_result = ETFAnalysisData(
        reconstructed_history={
            "2026-04-01": 150.0,
            "2026-04-02": 160.0
        },
        all_constituents=all_constituents,
        top_5_holdings=all_constituents
    )
    service.analyze_etf.return_value = mock_result
    return service

@pytest.fixture
def override_etf_service(mock_service):
    # Mock Injection
    app.dependency_overrides[get_etf_service] = lambda: mock_service
    yield
    app.dependency_overrides = {} # reset regardless of test result

def test_analyze_etf_endpoint_success(override_etf_service, mock_service):
    """
    Unit test for successful API call
    """ 
    csv_data = "name,weight\nAAPL,0.5\nMSFT,0.5"
    response = client.post(
        "/api/v1/analyze_etf",
        files={"file": ("ETF_test.csv", csv_data, "text/csv")}
    )

    assert response.status_code == 200
    mock_service.analyze_etf.assert_called_once()
    
    validated_response = ETFAnalysisResponse(**response.json())
    assert validated_response.status == "success"

    analysis_data = validated_response.data
    assert analysis_data.reconstructed_history["2026-04-02"] == 160.0

    assert len(analysis_data.all_constituents) == 2

def test_analyze_etf_endpoint_invalid_extension():
    """
    Unit test for invalid file extension (no CSV)
    """

    response = client.post(
        "/api/v1/analyze_etf",
        files={"file": ("test.txt", "test file", "text/plain")}
    )
    assert response.status_code == 400
    error_response = ErrorResponse(**response.json())
    
    assert error_response.status == "error"
    assert "Only CSV files are supported" in error_response.message
    assert error_response.error_type == "INVALID_FILE_ERROR"
