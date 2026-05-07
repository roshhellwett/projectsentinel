"""
Manual trigger endpoint for admin use.
Allows admin to manually run the pipeline.
"""

import os
from datetime import datetime
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional

from scheduler.jobs import run_pipeline

router = APIRouter()

ADMIN_SECRET_TOKEN = os.getenv("ADMIN_SECRET_TOKEN", "")


class TriggerResponse(BaseModel):
    """Trigger response model."""
    success: bool
    message: str
    timestamp: str


class TriggerRequest(BaseModel):
    """Trigger request model."""
    supplementary_only: bool = False
    archive_only: bool = False


@router.post("/trigger", response_model=TriggerResponse)
async def trigger_pipeline(
    request: Optional[TriggerRequest] = None,
    x_admin_token: str = Header(..., alias="X-Admin-Token")
):
    """
    Manually trigger the news pipeline.
    Requires admin token in X-Admin-Token header.
    """
    # Validate admin token
    if not ADMIN_SECRET_TOKEN:
        raise HTTPException(status_code=500, detail="Admin token not configured")
    
    if x_admin_token != ADMIN_SECRET_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid admin token")
    
    try:
        # Run pipeline with optional parameters
        kwargs = {}
        if request:
            if request.supplementary_only:
                kwargs['supplementary_only'] = True
            if request.archive_only:
                kwargs['archive_only'] = True
        
        # Run synchronously for API response
        import asyncio
        await asyncio.to_thread(run_pipeline, **kwargs)
        
        return TriggerResponse(
            success=True,
            message="Pipeline triggered successfully",
            timestamp=datetime.utcnow().isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline failed: {str(e)}")
