"""
Async API client for fetching data from external services.
"""

import logging
from typing import Dict, List, Optional
import httpx

logger = logging.getLogger(__name__)

# External API endpoints
MESSAGES_API_URL = "https://owpublic.blob.core.windows.net/tech-task/messages/current-period"
REPORTS_API_BASE_URL = "https://owpublic.blob.core.windows.net/tech-task/reports"


async def fetch_messages(client: httpx.AsyncClient) -> List[dict]:
    """
    Fetch all messages for the current billing period.
    
    Args:
        client: httpx async client
        
    Returns:
        List of message dictionaries
        
    Raises:
        httpx.HTTPError: If API request fails
    """
    try:
        response = await client.get(MESSAGES_API_URL)
        response.raise_for_status()
        data = response.json()
        return data.get("messages", [])
    except httpx.HTTPError as e:
        logger.error(f"Failed to fetch messages: {e}")
        raise


async def fetch_report(client: httpx.AsyncClient, report_id: int) -> Optional[dict]:
    """
    Fetch report details by ID.
    
    Args:
        client: httpx async client
        report_id: Report ID to fetch
        
    Returns:
        Report dictionary with id, name, credit_cost, or None if not found
    """
    try:
        url = f"{REPORTS_API_BASE_URL}/{report_id}"
        response = await client.get(url)
        
        if response.status_code == 404:
            logger.warning(f"Report {report_id} not found (404)")
            return None
            
        response.raise_for_status()
        return response.json()
    except httpx.HTTPError as e:
        logger.error(f"Failed to fetch report {report_id}: {e}")
        return None


async def fetch_reports_batch(
    client: httpx.AsyncClient, 
    report_ids: List[int],
    cache: Optional[Dict[int, dict]] = None
) -> Dict[int, dict]:
    """
    Fetch multiple reports concurrently, with caching to avoid duplicate calls.
    
    Args:
        client: httpx async client
        report_ids: List of unique report IDs to fetch
        cache: Optional cache dictionary (mutated in place)
        
    Returns:
        Dictionary mapping report_id to report data (None if not found)
    """
    if cache is None:
        cache = {}
    
    # Filter out already cached report IDs
    uncached_ids = [rid for rid in report_ids if rid not in cache]
    
    if not uncached_ids:
        return cache
    
    # Fetch all uncached reports concurrently
    import asyncio
    tasks = [fetch_report(client, report_id) for report_id in uncached_ids]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    # Update cache with results
    for report_id, result in zip(uncached_ids, results):
        if isinstance(result, Exception):
            logger.error(f"Error fetching report {report_id}: {result}")
            cache[report_id] = None
        else:
            cache[report_id] = result
    
    return cache

