from pydantic import BaseModel, Field
from typing import List, Dict

class ConstituentSchema(BaseModel):
    name: str = Field(..., example="A")
    weight: float = Field(..., example=0.05, description="Normalized weight (0.0 to 1.0)")
    latest_close_price: float = Field(..., example=150.25)
    holding_size: float = Field(..., example=1000.0)

class ETFAnalysisData(BaseModel):
    reconstructed_history: Dict[str, float] = Field(
        ..., 
        example={"2024-01-01": 100.0, "2024-01-02": 101.5}
    )
    all_constituents: List[ConstituentSchema]
    top_5_holdings: List[ConstituentSchema]

class ETFAnalysisResponse(BaseModel):
    status: str = Field(..., example="success")
    data: ETFAnalysisData

class ErrorResponse(BaseModel):
    status: str = Field("error", example="error")
    message: str = Field(..., example="Invalid file format")
    error_type: str = Field(..., example="INVALID_FILE_ERROR")