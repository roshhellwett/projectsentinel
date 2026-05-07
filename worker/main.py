"""
Main entry point for ProjectSentinel worker.
Starts FastAPI server and APScheduler for the news pipeline.
"""

import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from apscheduler.schedulers.background import BackgroundScheduler

from api.health import router as health_router
from api.trigger import router as trigger_router
from scheduler.jobs import run_pipeline

scheduler = BackgroundScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage scheduler lifecycle."""
    scheduler.add_job(
        run_pipeline,
        'interval',
        minutes=30,
        id='news_pipeline',
        replace_existing=True,
        max_instances=1
    )

    scheduler.add_job(
        run_pipeline,
        'interval',
        hours=4,
        id='supplementary_fetch',
        replace_existing=True,
        max_instances=1,
        kwargs={'supplementary_only': True}
    )

    scheduler.add_job(
        run_pipeline,
        'cron',
        day=1,
        hour=2,
        id='archive_old_posts',
        replace_existing=True,
        max_instances=1,
        kwargs={'archive_only': True}
    )

    try:
        scheduler.start()
        print("Scheduler started")
        print("  - Main pipeline: every 30 minutes")
        print("  - Supplementary APIs: every 4 hours")
        print("  - Archive job: 1st of month at 2 AM")
    except Exception as e:
        print(f"Scheduler failed to start: {e}")

    yield

    try:
        scheduler.shutdown()
        print("Scheduler shut down")
    except Exception:
        pass


app = FastAPI(
    title="ProjectSentinel Worker",
    description="AI-powered news verification and publishing pipeline",
    version="1.0.0",
    lifespan=lifespan
)

app.include_router(health_router, tags=["health"])
app.include_router(trigger_router, tags=["trigger"])


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
