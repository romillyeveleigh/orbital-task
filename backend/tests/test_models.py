"""
Tests for Pydantic models.
"""

import pytest
from pydantic import ValidationError
from models import UsageItem, UsageResponse


class TestUsageItem:
    """Test UsageItem model."""
    
    def test_valid_usage_item_with_report(self):
        """Test valid UsageItem with report_name."""
        item = UsageItem(
            id=1000,
            timestamp="2024-04-29T02:08:29.375Z",
            report_name="Tenant Obligations Report",
            credits_used=79.00
        )
        assert item.id == 1000
        assert item.timestamp == "2024-04-29T02:08:29.375Z"
        assert item.report_name == "Tenant Obligations Report"
        assert item.credits_used == 79.00
    
    def test_valid_usage_item_without_report(self):
        """Test valid UsageItem without report_name."""
        item = UsageItem(
            id=1001,
            timestamp="2024-04-29T02:08:30.375Z",
            credits_used=5.50
        )
        assert item.id == 1001
        assert item.timestamp == "2024-04-29T02:08:30.375Z"
        assert item.report_name is None
        assert item.credits_used == 5.50
    
    def test_usage_item_excludes_none_report_name(self):
        """Test that None report_name is excluded from JSON."""
        item = UsageItem(
            id=1002,
            timestamp="2024-04-29T02:08:31.375Z",
            credits_used=10.00
        )
        json_dict = item.model_dump(exclude_none=True)
        assert "report_name" not in json_dict
        assert json_dict["id"] == 1002
        assert json_dict["credits_used"] == 10.00
    
    def test_usage_item_includes_report_name_when_present(self):
        """Test that report_name is included when present."""
        item = UsageItem(
            id=1003,
            timestamp="2024-04-29T02:08:32.375Z",
            report_name="Test Report",
            credits_used=20.00
        )
        json_dict = item.model_dump(exclude_none=True)
        assert json_dict["report_name"] == "Test Report"
    
    def test_missing_required_fields(self):
        """Test that missing required fields raise ValidationError."""
        with pytest.raises(ValidationError):
            UsageItem(
                id=1004,
                # Missing timestamp
                credits_used=5.00
            )
        
        with pytest.raises(ValidationError):
            UsageItem(
                # Missing id
                timestamp="2024-04-29T02:08:33.375Z",
                credits_used=5.00
            )
        
        with pytest.raises(ValidationError):
            UsageItem(
                id=1005,
                timestamp="2024-04-29T02:08:34.375Z"
                # Missing credits_used
            )
    
    def test_invalid_id_type(self):
        """Test that invalid id type raises ValidationError."""
        with pytest.raises(ValidationError):
            UsageItem(
                id="not-an-int",
                timestamp="2024-04-29T02:08:35.375Z",
                credits_used=5.00
            )
    
    def test_invalid_credits_type(self):
        """Test that invalid credits_used type raises ValidationError."""
        with pytest.raises(ValidationError):
            UsageItem(
                id=1006,
                timestamp="2024-04-29T02:08:36.375Z",
                credits_used="not-a-float"
            )


class TestUsageResponse:
    """Test UsageResponse model."""
    
    def test_valid_usage_response(self):
        """Test valid UsageResponse with usage items."""
        items = [
            UsageItem(
                id=1000,
                timestamp="2024-04-29T02:08:29.375Z",
                report_name="Report 1",
                credits_used=79.00
            ),
            UsageItem(
                id=1001,
                timestamp="2024-04-29T02:08:30.375Z",
                credits_used=5.50
            )
        ]
        response = UsageResponse(usage=items)
        assert len(response.usage) == 2
        assert response.usage[0].id == 1000
        assert response.usage[1].id == 1001
    
    def test_empty_usage_response(self):
        """Test UsageResponse with empty usage list."""
        response = UsageResponse(usage=[])
        assert response.usage == []
    
    def test_missing_usage_field(self):
        """Test that missing usage field raises ValidationError."""
        with pytest.raises(ValidationError):
            UsageResponse()
    
    def test_invalid_usage_type(self):
        """Test that invalid usage type raises ValidationError."""
        with pytest.raises(ValidationError):
            UsageResponse(usage="not-a-list")
        
        with pytest.raises(ValidationError):
            UsageResponse(usage=[{"invalid": "item"}])

