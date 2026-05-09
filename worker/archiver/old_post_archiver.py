"""Archives old worker data on the monthly maintenance run."""

from datetime import UTC, datetime, timedelta

from database.client import get_supabase
from logger.pipeline_logger import PipelineLogger


class OldPostArchiver:
    """Archives posts and cleans up old pipeline tables."""

    def __init__(self):
        self.logger = PipelineLogger()
        self.supabase = None
        self._init_supabase()

    def _init_supabase(self):
        """Initialize Supabase client."""
        self.supabase = get_supabase()

    def archive_old_posts(self) -> int:
        """
        Delete posts older than 6 months.

        Returns:
            Number of posts deleted
        """
        if not self.supabase:
            self.logger.log("ARCHIVER_ERROR", "Supabase not initialized")
            return 0

        try:
            cutoff_date = (datetime.now(UTC) - timedelta(days=180)).isoformat()
            count_result = (
                self.supabase.table("posts").select("id", count="exact").lt("published_at", cutoff_date).execute()
            )

            old_count = count_result.count if hasattr(count_result, "count") else 0

            if old_count == 0:
                self.logger.log("ARCHIVER", "No old posts to archive")
                return 0

            delete_result = self.supabase.table("posts").delete().lt("published_at", cutoff_date).execute()
            deleted = len(delete_result.data) if delete_result.data else 0
            self.logger.log("ARCHIVER", f"Archived {deleted} posts older than 6 months")
            return deleted

        except Exception as e:
            self.logger.log("ARCHIVER_ERROR", f"Failed to archive: {str(e)}")
            return 0

    def cleanup_discarded_articles(self, days: int = 30) -> int:
        """Delete discarded article logs older than the retention window."""
        return self._delete_old_rows("discarded_articles", "discarded_at", days)

    def cleanup_raw_articles(self, days: int = 60) -> int:
        """Delete raw article rows older than the retention window."""
        return self._delete_old_rows("raw_articles", "fetched_at", days)

    def cleanup_pipeline_tables(self) -> dict[str, int]:
        """Run all monthly pipeline table cleanup jobs."""
        return {
            "discarded_articles": self.cleanup_discarded_articles(),
            "raw_articles": self.cleanup_raw_articles(),
        }

    def _delete_old_rows(self, table: str, date_column: str, days: int) -> int:
        if not self.supabase:
            self.logger.log("ARCHIVER_ERROR", "Supabase not initialized")
            return 0

        try:
            cutoff_date = (datetime.now(UTC) - timedelta(days=days)).isoformat()
            delete_result = self.supabase.table(table).delete().lt(date_column, cutoff_date).execute()
            deleted = len(delete_result.data) if delete_result.data else 0
            self.logger.log("ARCHIVER", f"Deleted {deleted} {table} rows older than {days} days")
            return deleted
        except Exception as e:
            self.logger.log("ARCHIVER_ERROR", f"Failed to clean {table}: {str(e)}")
            return 0
