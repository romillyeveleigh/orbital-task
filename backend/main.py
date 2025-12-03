"""
FastAPI application for Orbital Copilot usage tracking API.
"""

import logging
import os
from typing import List
import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from models import UsageItem, UsageResponse
from api_client import fetch_messages, fetch_reports_batch
from credit_calculator import calculate_credits_from_text

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Rate limiting configuration
limiter = Limiter(key_func=get_remote_address)
RATE_LIMIT = os.getenv("RATE_LIMIT", "60/minute")

app = FastAPI(
    title="Orbital Copilot Usage API",
    description="API for tracking credit usage in Orbital Copilot",
    version="1.0.0"
)

# Register rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS configuration
# In production, set ALLOWED_ORIGINS env var to comma-separated list of allowed origins
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET"],  # Only allow necessary methods
    allow_headers=["Content-Type"],
)


@app.get("/usage", response_model=UsageResponse, response_model_exclude_none=True)
@limiter.limit(RATE_LIMIT)
async def get_usage(request: Request):
    """
    Get usage data for the current billing period.
    
    Rate limited to prevent abuse (default: 60 requests/minute).
    
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
            
            for message in messages:
                report_id = message.get("report_id")
                if report_id and report_id not in report_ids:
                    report_ids.append(report_id)
            
            # Fetch all reports concurrently with caching
            report_cache = {}
            if report_ids:
                await fetch_reports_batch(client, report_ids, report_cache)
            
            # Build usage items
            usage_items: List[UsageItem] = []
            
            for idx, message in enumerate(messages):
                # Validate message structure
                if not isinstance(message, dict):
                    logger.warning(f"Invalid message at index {idx}: not a dictionary")
                    continue
                
                message_id = message.get("id")
                timestamp = message.get("timestamp")
                text = message.get("text", "")
                report_id = message.get("report_id")
                
                # Validate required fields
                if message_id is None or timestamp is None:
                    logger.warning(f"Invalid message at index {idx}: missing required fields (id or timestamp)")
                    continue
                
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
@limiter.limit("120/minute")
async def root(request: Request):
    """Health check endpoint."""
    return {"status": "ok", "message": "Orbital Copilot Usage API"}

