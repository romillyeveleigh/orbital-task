"""
FastAPI application for Orbital Copilot usage tracking API.
"""

import logging
from typing import List
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import UsageItem, UsageResponse
from api_client import fetch_messages, fetch_reports_batch
from credit_calculator import calculate_credits_from_text

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Orbital Copilot Usage API",
    description="API for tracking credit usage in Orbital Copilot",
    version="1.0.0"
)

# Add CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/usage", response_model=UsageResponse, response_model_exclude_none=True)
async def get_usage():
    """
    Get usage data for the current billing period.
    
    Returns:
        UsageResponse with list of usage items, each containing:
        - id: Message ID
        - timestamp: ISO 8601 timestamp
        - report_name: Report name (omitted if no report)
        - credits_used: Credits consumed (rounded to 2 decimal places)
    """
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            # Fetch all messages
            messages = await fetch_messages(client)
            
            if not messages:
                return UsageResponse(usage=[])
            
            # Collect unique report IDs
            report_ids = []
            message_report_map = {}  # Map message index to report_id
            
            for idx, message in enumerate(messages):
                report_id = message.get("report_id")
                if report_id:
                    if report_id not in report_ids:
                        report_ids.append(report_id)
                    message_report_map[idx] = report_id
            
            # Fetch all reports concurrently with caching
            report_cache = {}
            if report_ids:
                await fetch_reports_batch(client, report_ids, report_cache)
            
            # Build usage items
            usage_items: List[UsageItem] = []
            
            for idx, message in enumerate(messages):
                message_id = message["id"]
                timestamp = message["timestamp"]
                text = message.get("text", "")
                report_id = message.get("report_id")
                
                # Determine credits and report name
                credits_used: float
                report_name: str | None = None
                
                if report_id and report_id in report_cache:
                    report = report_cache[report_id]
                    if report:
                        # Use report credit_cost
                        credits_used = float(report["credit_cost"])
                        report_name = report["name"]
                    else:
                        # Report not found, fallback to text calculation
                        logger.warning(f"Report {report_id} not found, calculating from text")
                        credits_used = calculate_credits_from_text(text)
                elif report_id:
                    # Report ID provided but not in cache (shouldn't happen, but handle gracefully)
                    logger.warning(f"Report {report_id} missing from cache, calculating from text")
                    credits_used = calculate_credits_from_text(text)
                else:
                    # No report_id, calculate from text
                    credits_used = calculate_credits_from_text(text)
                
                # Create usage item
                usage_item = UsageItem(
                    id=message_id,
                    timestamp=timestamp,
                    report_name=report_name,
                    credits_used=credits_used
                )
                usage_items.append(usage_item)
            
            return UsageResponse(usage=usage_items)
            
        except httpx.HTTPError as e:
            logger.error(f"External API error: {e}")
            raise HTTPException(status_code=503, detail="Failed to fetch usage data from external service")
        except Exception as e:
            logger.error(f"Unexpected error: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "ok", "message": "Orbital Copilot Usage API"}

