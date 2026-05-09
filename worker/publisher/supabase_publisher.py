"""
Supabase publisher - inserts verified posts into the database.
"""

import hashlib
import re

from database.client import get_supabase
from logger.pipeline_logger import PipelineLogger

_NORMALIZE_RE = re.compile(r"[^\w\s]")


def _normalize_headline(text: str) -> str:
    """Normalize headline for duplicate comparison."""
    return _NORMALIZE_RE.sub("", text.lower()).replace(" ", "")


class SupabasePublisher:
    """Publishes posts to Supabase database."""

    def __init__(self):
        self.logger = PipelineLogger()
        self.supabase = None
        self._init_supabase()

    def _init_supabase(self):
        """Initialize Supabase client."""
        self.supabase = get_supabase()

    def publish(self, post: dict) -> bool:
        """
        Insert post into posts table.

        Args:
            post: Post dict from post_builder

        Returns:
            True if successful, False otherwise
        """
        if not self.supabase:
            self.logger.log("PUBLISHER_ERROR", "Supabase not initialized")
            return False

        try:
            # Remove updated_at (handled by trigger) and add a stable story key when possible.
            post_data = {k: v for k, v in post.items() if k != "updated_at"}
            source_urls = sorted(source.get("url", "") for source in post_data.get("sources", []) if source.get("url"))
            if source_urls:
                post_data["story_fingerprint"] = hashlib.sha256("|".join(source_urls).encode()).hexdigest()

            # Prevent duplicate headlines
            headline = post_data.get("headline", "")
            if headline:
                norm_headline = _normalize_headline(headline)

                try:
                    recent = (
                        self.supabase.table("posts")
                        .select("headline")
                        .order("published_at", desc=True)
                        .limit(50)
                        .execute()
                    )
                    for row in recent.data or []:
                        if _normalize_headline(row.get("headline", "")) == norm_headline:
                            self.logger.log("PUBLISH_SKIP", f"Skipped duplicate headline: {headline[:50]}")
                            return False
                except Exception as e:
                    self.logger.log("PUBLISHER_WARN", f"Headline dedup check failed (proceeding): {str(e)[:80]}")

            try:
                result = self.supabase.table("posts").insert(post_data).execute()
            except Exception as e:
                if "story_fingerprint" in post_data and "story_fingerprint" in str(e):
                    post_data.pop("story_fingerprint", None)
                    result = self.supabase.table("posts").insert(post_data).execute()
                else:
                    raise

            if result.data:
                self.logger.log("PUBLISH", f"Published: {post.get('headline', '')[:50]}")
                return True
            else:
                self.logger.log("PUBLISHER_ERROR", "Insert returned no data")
                return False

        except Exception as e:
            self.logger.log("PUBLISHER_ERROR", f"Failed to publish: {str(e)}")
            return False
