"""
Persist and restore Groq API key daily usage counters to Supabase.

Counters are stored in the `groq_usage` table as a JSONB array keyed by
slot index. On worker startup (first pool init) the persisted counts for
today are restored so the daily quotas survive Railway redeploys.
"""

from datetime import date

from database.client import get_supabase
from logger.pipeline_logger import PipelineLogger

_logger = PipelineLogger()


def save_key_stats(stats: list[dict]) -> None:
    """Upsert today's key usage stats to Supabase. Non-fatal on error."""
    try:
        supabase = get_supabase()
        today = str(date.today())
        (
            supabase.table("groq_usage")
            .upsert(
                {"usage_date": today, "key_stats": stats},
                on_conflict="usage_date",
            )
            .execute()
        )
    except Exception as exc:
        _logger.log("GROQ_USAGE_WARN", f"Failed to save key stats: {str(exc)[:100]}")


def load_key_stats() -> list[dict]:
    """Load today's key usage stats from Supabase. Returns [] on miss or error."""
    try:
        supabase = get_supabase()
        today = str(date.today())
        result = (
            supabase.table("groq_usage")
            .select("key_stats")
            .eq("usage_date", today)
            .maybe_single()
            .execute()
        )
        if result.data:
            return result.data.get("key_stats") or []
    except Exception as exc:
        _logger.log("GROQ_USAGE_WARN", f"Failed to load key stats: {str(exc)[:100]}")
    return []
