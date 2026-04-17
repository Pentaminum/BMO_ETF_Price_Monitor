from pydantic import BaseModel, Field
from typing import List, Dict

class ConstituentSchema(BaseModel):
    name: str = Field(..., json_schema_extra={"example": "A"})
    weight: float = Field(..., description="Normalized weight (0.0 to 1.0)", json_schema_extra={"example": 0.05})
    latest_close_price: float = Field(..., json_schema_extra={"example": 150.25})
    holding_size: float = Field(..., json_schema_extra={"example": 1000.0})

class ETFAnalysisData(BaseModel):
    reconstructed_history: Dict[str, float] = Field(
        ..., 
        json_schema_extra={"example": {"2024-01-01": 100.0, "2024-01-02": 101.5}}
    )
    all_constituents: List[ConstituentSchema]
    top_5_holdings: List[ConstituentSchema]

class ETFAnalysisResponse(BaseModel):
    status: str = Field(..., json_schema_extra={"example": "success"})
    data: ETFAnalysisData

class ErrorResponse(BaseModel):
    status: str = Field("error", json_schema_extra={"example": "error"})
    message: str = Field(..., json_schema_extra={"example": "Invalid file format"})
    error_type: str = Field(..., json_schema_extra={"example": "INVALID_FILE_ERROR"})