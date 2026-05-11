"""
Manual trigger endpoint for admin use.
Allows admin to manually run the pipeline.
"""

import os
import threading
from datetime import UTC, datetime

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel

from scheduler.jobs import run_pipeline

router = APIRouter()

ADMIN_SECRET_TOKEN = os.getenv("ADMIN_SECRET_TOKEN", "")
_pipeline_running = threading.Event()
_pipeline_lock = threading.Lock()


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
    request: TriggerRequest | None = None, x_admin_token: str = Header(..., alias="X-Admin-Token")
):
    """
    Manually trigger the news pipeline.
    Requires admin token in X-Admin-Token header.
    """
    if not ADMIN_SECRET_TOKEN:
        raise HTTPException(status_code=500, detail="Admin token not configured")

    if x_admin_token != ADMIN_SECRET_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid admin token")

    # Atomic check-and-set under a lock so two concurrent triggers can't both pass.
    with _pipeline_lock:
        if _pipeline_running.is_set():
            return TriggerResponse(
                success=False, message="Pipeline is already running", timestamp=datetime.now(UTC).isoformat()
            )
        _pipeline_running.set()

    kwargs = {}
    if request:
        if request.supplementary_only:
            kwargs["supplementary_only"] = True
        if request.archive_only:
            kwargs["archive_only"] = True

    def _run_guarded(**kw):
        try:
            run_pipeline(**kw)
        finally:
            _pipeline_running.clear()

    try:
        thread = threading.Thread(target=_run_guarded, kwargs=kwargs, daemon=True)
        thread.start()
    except Exception:
        # Spawn failed — release the guard so a future trigger can try again.
        _pipeline_running.clear()
        raise

    return TriggerResponse(
        success=True, message="Pipeline triggered successfully", timestamp=datetime.now(UTC).isoformat()
    )
