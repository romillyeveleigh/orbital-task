"""
Pydantic models for API request/response validation.
Ensures exact JSON contract compliance.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class UsageItem(BaseModel):
    """Individual usage item in the response."""
    id: int
    timestamp: str = Field(..., description="ISO 8601 timestamp")
    report_name: Optional[str] = Field(default=None, description="Report name if message generated a report")
    credits_used: float = Field(..., description="Credits consumed, rounded to 2 decimal places")
    
    class Config:
        # Exclude None values from JSON serialization
        # This ensures report_name is omitted (not null) when not present
        json_schema_extra = {
            "example": {
                "id": 1000,
                "timestamp": "2024-04-29T02:08:29.375Z",
                "report_name": "Tenant Obligations Report",
                "credits_used": 79.00
            }
        }


class UsageResponse(BaseModel):
    """Response model for /usage endpoint."""
    usage: List[UsageItem] = Field(..., description="List of usage items for current billing period")

