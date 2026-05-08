"""
Health check endpoint for keep-alive pings and monitoring.
"""

from datetime import UTC, datetime

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class HealthResponse(BaseModel):
    """Health check response model."""

    status: str
    timestamp: str


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Returns 200 OK with timestamp.
    Used by cron-job.org and GitHub Actions to keep the backend awake.
    """
    return HealthResponse(status="ok", timestamp=datetime.now(UTC).isoformat())
