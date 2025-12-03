"""
Tests for api_client module.
"""

import pytest
import httpx
import pytest_httpx
from api_client import fetch_messages, fetch_report, fetch_reports_batch


class TestFetchMessages:
    """Test fetch_messages function."""
    
    @pytest.mark.asyncio
    async def test_fetch_messages_success(self, httpx_mock: pytest_httpx.HTTPXMock):
        """Test successful message fetch."""
        mock_response = {
            "messages": [
                {"id": 1, "timestamp": "2024-01-01T00:00:00Z", "text": "Test"},
                {"id": 2, "timestamp": "2024-01-02T00:00:00Z", "text": "Test 2"}
            ]
        }
        httpx_mock.add_response(
            method="GET",
            url="https://owpublic.blob.core.windows.net/tech-task/messages/current-period",
            json=mock_response
        )
        
        async with httpx.AsyncClient() as client:
            messages = await fetch_messages(client)
        
        assert len(messages) == 2
        assert messages[0]["id"] == 1
        assert messages[1]["id"] == 2
    
    @pytest.mark.asyncio
    async def test_fetch_messages_empty(self, httpx_mock: pytest_httpx.HTTPXMock):
        """Test fetch when no messages exist."""
        mock_response = {"messages": []}
        httpx_mock.add_response(
            method="GET",
            url="https://owpublic.blob.core.windows.net/tech-task/messages/current-period",
            json=mock_response
        )
        
        async with httpx.AsyncClient() as client:
            messages = await fetch_messages(client)
        
        assert messages == []
    
    @pytest.mark.asyncio
    async def test_fetch_messages_http_error(self, httpx_mock: pytest_httpx.HTTPXMock):
        """Test fetch when HTTP error occurs."""
        httpx_mock.add_response(
            method="GET",
            url="https://owpublic.blob.core.windows.net/tech-task/messages/current-period",
            status_code=500
        )
        
        async with httpx.AsyncClient() as client:
            with pytest.raises(httpx.HTTPError):
                await fetch_messages(client)
    
    @pytest.mark.asyncio
    async def test_fetch_messages_network_error(self, httpx_mock: pytest_httpx.HTTPXMock):
        """Test fetch when network error occurs."""
        httpx_mock.add_exception(
            httpx.NetworkError("Connection failed")
        )
        
        async with httpx.AsyncClient() as client:
            with pytest.raises(httpx.HTTPError):
                await fetch_messages(client)


class TestFetchReport:
    """Test fetch_report function."""
    
    @pytest.mark.asyncio
    async def test_fetch_report_success(self, httpx_mock: pytest_httpx.HTTPXMock):
        """Test successful report fetch."""
        mock_report = {
            "id": 123,
            "name": "Test Report",
            "credit_cost": 50.00
        }
        httpx_mock.add_response(
            method="GET",
            url="https://owpublic.blob.core.windows.net/tech-task/reports/123",
            json=mock_report
        )
        
        async with httpx.AsyncClient() as client:
            report = await fetch_report(client, 123)
        
        assert report is not None
        assert report["id"] == 123
        assert report["name"] == "Test Report"
        assert report["credit_cost"] == 50.00
    
    @pytest.mark.asyncio
    async def test_fetch_report_not_found(self, httpx_mock: pytest_httpx.HTTPXMock):
        """Test fetch when report doesn't exist."""
        httpx_mock.add_response(
            method="GET",
            url="https://owpublic.blob.core.windows.net/tech-task/reports/999",
            status_code=404
        )
        
        async with httpx.AsyncClient() as client:
            report = await fetch_report(client, 999)
        
        assert report is None
    
    @pytest.mark.asyncio
    async def test_fetch_report_http_error(self, httpx_mock: pytest_httpx.HTTPXMock):
        """Test fetch when HTTP error occurs."""
        httpx_mock.add_response(
            method="GET",
            url="https://owpublic.blob.core.windows.net/tech-task/reports/123",
            status_code=500
        )
        
        async with httpx.AsyncClient() as client:
            report = await fetch_report(client, 123)
        
        # Should return None on error (not raise)
        assert report is None
    
    @pytest.mark.asyncio
    async def test_fetch_report_network_error(self, httpx_mock: pytest_httpx.HTTPXMock):
        """Test fetch when network error occurs."""
        httpx_mock.add_exception(
            httpx.NetworkError("Connection failed")
        )
        
        async with httpx.AsyncClient() as client:
            report = await fetch_report(client, 123)
        
        # Should return None on error (not raise)
        assert report is None


class TestFetchReportsBatch:
    """Test fetch_reports_batch function."""
    
    @pytest.mark.asyncio
    async def test_fetch_reports_batch_success(self, httpx_mock: pytest_httpx.HTTPXMock):
        """Test successful batch fetch."""
        # Mock multiple report endpoints
        httpx_mock.add_response(
            method="GET",
            url="https://owpublic.blob.core.windows.net/tech-task/reports/1",
            json={"id": 1, "name": "Report 1", "credit_cost": 10.00}
        )
        httpx_mock.add_response(
            method="GET",
            url="https://owpublic.blob.core.windows.net/tech-task/reports/2",
            json={"id": 2, "name": "Report 2", "credit_cost": 20.00}
        )
        
        async with httpx.AsyncClient() as client:
            cache = {}
            result = await fetch_reports_batch(client, [1, 2], cache)
        
        assert len(result) == 2
        assert result[1]["name"] == "Report 1"
        assert result[2]["name"] == "Report 2"
        assert cache is result  # Should mutate cache in place
    
    @pytest.mark.asyncio
    async def test_fetch_reports_batch_with_missing(self, httpx_mock: pytest_httpx.HTTPXMock):
        """Test batch fetch with some missing reports."""
        httpx_mock.add_response(
            method="GET",
            url="https://owpublic.blob.core.windows.net/tech-task/reports/1",
            json={"id": 1, "name": "Report 1", "credit_cost": 10.00}
        )
        httpx_mock.add_response(
            method="GET",
            url="https://owpublic.blob.core.windows.net/tech-task/reports/2",
            status_code=404
        )
        
        async with httpx.AsyncClient() as client:
            cache = {}
            result = await fetch_reports_batch(client, [1, 2], cache)
        
        assert result[1] is not None
        assert result[2] is None  # Missing report
    
    @pytest.mark.asyncio
    async def test_fetch_reports_batch_uses_cache(self, httpx_mock: pytest_httpx.HTTPXMock):
        """Test that batch fetch uses existing cache."""
        # Pre-populate cache
        cache = {
            1: {"id": 1, "name": "Cached Report", "credit_cost": 5.00}
        }
        
        # Only mock the uncached report
        httpx_mock.add_response(
            method="GET",
            url="https://owpublic.blob.core.windows.net/tech-task/reports/2",
            json={"id": 2, "name": "New Report", "credit_cost": 15.00}
        )
        
        async with httpx.AsyncClient() as client:
            result = await fetch_reports_batch(client, [1, 2], cache)
        
        assert result[1]["name"] == "Cached Report"  # From cache
        assert result[2]["name"] == "New Report"  # Fetched
    
    @pytest.mark.asyncio
    async def test_fetch_reports_batch_empty_list(self, httpx_mock: pytest_httpx.HTTPXMock):
        """Test batch fetch with empty list."""
        async with httpx.AsyncClient() as client:
            cache = {}
            result = await fetch_reports_batch(client, [], cache)
        
        assert result == {}
    
    @pytest.mark.asyncio
    async def test_fetch_reports_batch_all_cached(self, httpx_mock: pytest_httpx.HTTPXMock):
        """Test batch fetch when all reports are cached."""
        cache = {
            1: {"id": 1, "name": "Report 1", "credit_cost": 10.00},
            2: {"id": 2, "name": "Report 2", "credit_cost": 20.00}
        }
        
        async with httpx.AsyncClient() as client:
            result = await fetch_reports_batch(client, [1, 2], cache)
        
        assert len(result) == 2
        # No HTTP requests should be made (httpx_mock would raise if called)
    
    @pytest.mark.asyncio
    async def test_fetch_reports_batch_no_cache_provided(self, httpx_mock: pytest_httpx.HTTPXMock):
        """Test batch fetch without providing cache."""
        httpx_mock.add_response(
            method="GET",
            url="https://owpublic.blob.core.windows.net/tech-task/reports/1",
            json={"id": 1, "name": "Report 1", "credit_cost": 10.00}
        )
        
        async with httpx.AsyncClient() as client:
            result = await fetch_reports_batch(client, [1])
        
        assert result[1] is not None
        assert isinstance(result, dict)

