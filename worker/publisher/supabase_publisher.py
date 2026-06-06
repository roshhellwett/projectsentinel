

import hashlib
import re

from database.client import get_supabase
from fetcher.url_tools import title_similarity
from logger.pipeline_logger import PipelineLogger

_NORMALIZE_RE = re.compile(r"[^\w\s]")

def _normalize_headline(text: str) -> str:

    return _NORMALIZE_RE.sub("", text.lower()).replace(" ", "")

class SupabasePublisher:

    def __init__(self):
        self.logger = PipelineLogger()
        self.supabase = None
        self._recent_headlines: list[str] | None = None
        self._init_supabase()

    def _init_supabase(self):

        self.supabase = get_supabase()

    def publish(self, post: dict) -> bool:

        if not self.supabase:
            self.logger.log("PUBLISHER_ERROR", "Supabase not initialized")
            return False

        try:
            post_data = {k: v for k, v in post.items() if k != "updated_at"}
            source_urls = sorted(source.get("url", "") for source in post_data.get("sources", []) if source.get("url"))
            if source_urls:
                post_data["story_fingerprint"] = hashlib.sha256("|".join(source_urls).encode()).hexdigest()

            headline = post_data.get("headline", "")
            if headline:
                norm_headline = _normalize_headline(headline)
                recent = self._get_recent_headlines()

                for existing in recent:
                    if (_normalize_headline(existing) == norm_headline
                            or title_similarity(headline, existing) >= 0.75):
                        self.logger.log("PUBLISH_SKIP", f"Skipped duplicate headline: {headline[:50]}")
                        return False

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
                if headline and self._recent_headlines is not None:
                    self._recent_headlines.append(headline)
                return True
            else:
                self.logger.log("PUBLISHER_ERROR", "Insert returned no data")
                return False

        except Exception as e:
            self.logger.log("PUBLISHER_ERROR", f"Failed to publish: {str(e)}")
            return False

    def _get_recent_headlines(self) -> list[str]:

        if self._recent_headlines is not None:
            return self._recent_headlines

        self._recent_headlines = []
        if not self.supabase:
            return self._recent_headlines

        try:
            recent = (
                self.supabase.table("posts")
                .select("headline")
                .order("published_at", desc=True)
                .limit(200)
                .execute()
            )
            self._recent_headlines = [
                row.get("headline", "") for row in (recent.data or []) if row.get("headline")
            ]
        except Exception as e:
            self.logger.log("PUBLISHER_WARN", f"Headline dedup load failed (proceeding): {str(e)[:80]}")

        return self._recent_headlines
