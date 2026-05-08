"""
Deduplication logic - SHA256 URL hashing and database checks.
Optimized: batch DB operations, upsert, minimal memory.
"""

import os
from datetime import UTC, datetime, timedelta

from supabase import create_client

from fetcher.url_tools import compute_url_hash
from logger.pipeline_logger import PipelineLogger


class Deduplicator:
    """Handles article deduplication using URL hashing."""

    def __init__(self):
        self.logger = PipelineLogger()
        self.supabase = None
        self._known_hashes: set[str] | None = None
        self._init_supabase()

    def _init_supabase(self):
        """Initialize Supabase client."""
        supabase_url = os.getenv("SUPABASE_URL", "")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

        if supabase_url and supabase_key:
            try:
                self.supabase = create_client(supabase_url, supabase_key)
            except Exception as e:
                self.logger.log("DEDUP_ERROR", f"Failed to connect to Supabase: {str(e)}")

    def _load_known_hashes(self) -> set[str]:
        """Load all known URL hashes from raw_articles (cached per pipeline run)."""
        if self._known_hashes is not None:
            return self._known_hashes

        if not self.supabase:
            self._known_hashes = set()
            return self._known_hashes

        try:
            cutoff = (datetime.now(UTC) - timedelta(days=45)).isoformat()
            recent_result = self.supabase.table("raw_articles").select("url_hash").gte("fetched_at", cutoff).execute()
            null_result = self.supabase.table("raw_articles").select("url_hash").is_("fetched_at", "null").execute()
            rows = (recent_result.data or []) + (null_result.data or [])
            self._known_hashes = {row["url_hash"] for row in rows if row.get("url_hash")}
        except Exception as e:
            self.logger.log("DEDUP_ERROR", f"Failed to load hashes: {str(e)}")
            self._known_hashes = set()

        return self._known_hashes

    def is_new(self, article: dict) -> bool:
        """
        Check if article is new using in-memory hash cache.
        Batch-inserts new articles at end of pipeline via mark_group_processed.

        Args:
            article: Article dict with url_hash

        Returns:
            True if article is new, False if duplicate
        """
        if not self.supabase:
            return True

        url_hash = article.get("url_hash", "")
        if not url_hash:
            return False

        known = self._load_known_hashes()
        if url_hash in known:
            return False

        known.add(url_hash)
        return True

    def batch_insert_new_articles(self, articles: list[dict]) -> int:
        """
        Batch insert all new articles into raw_articles.
        Call this once at end of fetch step for all new articles.

        Args:
            articles: List of article dicts that passed is_new()

        Returns:
            Number of articles inserted
        """
        if not self.supabase:
            return 0

        if not articles:
            return 0

        try:
            insert_data = [
                {
                    "url_hash": a["url_hash"],
                    "url": a["url"],
                    "headline": a["headline"],
                    "excerpt": a.get("excerpt", ""),
                    "source_name": a["source_name"],
                    "source_url": a.get("source_url", ""),
                    "category_hint": a.get("category_hint", "general"),
                    "processed": False,
                    "fetched_at": datetime.now(UTC).isoformat(),
                }
                for a in articles
            ]

            try:
                self.supabase.table("raw_articles").upsert(
                    insert_data, on_conflict="url_hash", ignore_duplicates=True
                ).execute()
            except TypeError:
                self.supabase.table("raw_articles").insert(insert_data).execute()

            self.logger.log("DEDUP", f"Batch inserted {len(insert_data)} new articles")
            return len(insert_data)

        except Exception as e:
            self.logger.log("DEDUP_ERROR", f"Batch insert failed: {str(e)}")
            return 0

    def log_discarded(self, article: dict, reason: str, score: int = None):
        """Log a discarded article to discarded_articles table."""
        if not self.supabase:
            return

        try:
            data = {
                "url": article.get("url", ""),
                "source_name": article.get("source_name", ""),
                "headline": article.get("headline", ""),
                "discard_reason": reason,
                "credibility_score": score,
                "discarded_at": datetime.now(UTC).isoformat(),
            }

            self.supabase.table("discarded_articles").insert(data).execute()

        except Exception as e:
            self.logger.log("DEDUP_ERROR", f"Failed to log discarded: {str(e)}")

    def log_discarded_group(self, group: list[dict], reason: str, score: int = None):
        """Batch log all articles in a group as discarded."""
        if not self.supabase:
            return

        try:
            data_list = [
                {
                    "url": a.get("url", ""),
                    "source_name": a.get("source_name", ""),
                    "headline": a.get("headline", ""),
                    "discard_reason": reason,
                    "credibility_score": score,
                    "discarded_at": datetime.now(UTC).isoformat(),
                }
                for a in group
            ]

            self.supabase.table("discarded_articles").insert(data_list).execute()

        except Exception as e:
            self.logger.log("DEDUP_ERROR", f"Failed to batch log discarded: {str(e)}")

    def mark_group_processed(self, group: list[dict]):
        """Batch mark all articles in a group as processed."""
        if not self.supabase:
            return

        url_hashes = [a.get("url_hash", "") for a in group if a.get("url_hash")]
        if not url_hashes:
            return

        try:
            self.supabase.table("raw_articles").update({"processed": True}).in_("url_hash", url_hashes).execute()
        except Exception as e:
            self.logger.log("DEDUP_ERROR", f"Failed to mark processed: {str(e)}")

    def compute_url_hash(self, url: str) -> str:
        """Compute SHA256 hash of URL."""
        return compute_url_hash(url)
