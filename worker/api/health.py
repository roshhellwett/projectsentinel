

from datetime import UTC, datetime, timedelta

from fastapi import APIRouter
from pydantic import BaseModel

from database.client import get_supabase

router = APIRouter()

class HealthResponse(BaseModel):

    status: str
    timestamp: str

class StatusResponse(BaseModel):

    last_run_at: str | None
    stories_today: int
    pipeline_healthy: bool
    checked_at: str

@router.get("/health", response_model=HealthResponse)
async def health_check():

    return HealthResponse(status="ok", timestamp=datetime.now(UTC).isoformat())

@router.get("/status", response_model=StatusResponse)
async def pipeline_status():

    now = datetime.now(UTC)

    last_run_at: str | None = None
    stories_today: int = 0

    sb = get_supabase()
    if sb:
        try:
            run_result = (
                sb.table("pipeline_runs").select("started_at").order("started_at", desc=True).limit(1).execute()
            )
            if run_result.data:
                last_run_at = run_result.data[0]["started_at"]

            today_start = now.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
            count_result = (
                sb.table("posts")
                .select("id", count="exact", head=True)
                .gte("published_at", today_start)
                .execute()
            )
            stories_today = count_result.count or 0
        except Exception:
            pass

    pipeline_healthy = False
    if last_run_at:
        try:
            last_dt = datetime.fromisoformat(last_run_at.replace("Z", "+00:00"))
            pipeline_healthy = (now - last_dt) < timedelta(minutes=45)
        except Exception:
            pass

    return StatusResponse(
        last_run_at=last_run_at,
        stories_today=stories_today,
        pipeline_healthy=pipeline_healthy,
        checked_at=now.isoformat(),
    )
