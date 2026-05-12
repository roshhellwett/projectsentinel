"""
GNews API fetcher - supplementary news source.

Multi-key tier rotation: up to 6 keys via GNEWS_API_KEY_1..GNEWS_API_KEY_6.
Tier 1 (keys 1-3) is used until every tier-1 key is 429-exhausted for the
run, then tier 2 (keys 4-6) activates. Falls back to the legacy single
GNEWS_API_KEY when no numbered variant is configured.

Free tier per key = 100 calls/day, so 3 tier-1 keys give 300 effective
calls/day, and the full 6-key set gives 600 with seamless failover.
"""

import os
import threading
from datetime import UTC, datetime, timedelta
from typing import Optional
from urllib.parse import urlparse

import requests

from fetcher.url_tools import compute_url_hash, normalize_url
from logger.pipeline_logger import PipelineLogger
from utils.key_pool import AllKeysExhaustedError, KeyPool, load_numbered_keys


class GNewsFetcher:
    """Fetches news from GNews API with multi-key tier rotation."""

    API_URL = "https://gnews.io/api/v4/search"
    PAGE_SIZE = 100  # GNews free tier allows up to 100 articles per call.
    MAX_429_ROTATIONS = 6  # cap to avoid runaway in pathological cases

    # Class-level pool so concurrent calls share daily counters.
    _key_pool: Optional[KeyPool] = None
    _key_pool_lock = threading.Lock()

    def __init__(self):
        self.logger = PipelineLogger()
        self.session = requests.Session()

    # ------------------------------------------------------------------
    # Pool management
    # ------------------------------------------------------------------

    @classmethod
    def _ensure_pool(cls) -> Optional[KeyPool]:
        with cls._key_pool_lock:
            if cls._key_pool is None:
                keys = load_numbered_keys(os.getenv, "GNEWS_API_KEY", max_keys=6)
                if keys:
                    cls._key_pool = KeyPool(keys, name="GNews")
            return cls._key_pool

    @classmethod
    def _reset_pool(cls) -> None:
        """Reset the shared pool. Intended for tests only."""
        with cls._key_pool_lock:
            cls._key_pool = None

    @classmethod
    def has_quota(cls) -> bool:
        """True if at least one GNews key is still usable this run."""
        pool = cls._ensure_pool()
        return bool(pool and pool.has_available())

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def fetch(self) -> list[dict]:
        """
        Fetch Indian news from GNews. Rotates through configured keys on 429,
        falling through to tier 2 once tier 1 is exhausted for the run.

        Returns the parsed article list (empty if no key available or all 429).
        """
        pool = self._ensure_pool()
        if pool is None:
            self.logger.log("GNEWS", "No API key configured, skipping")
            return []

        yesterday = (datetime.now(UTC) - timedelta(days=1)).strftime("%Y-%m-%d")

        rotations = 0
        while rotations <= self.MAX_429_ROTATIONS:
            try:
                slot_idx, api_key = pool.pick()
            except AllKeysExhaustedError:
                self.logger.log(
                    "GNEWS",
                    "All GNews keys are rate-limited for this run, skipping",
                    {"key_stats": pool.get_stats()},
                )
                return []

            stats = pool.get_stats()
            params = {
                "q": "India",
                "lang": "en",
                "country": "in",
                "max": self.PAGE_SIZE,
                "from": yesterday,
                "apikey": api_key,
            }

            try:
                response = self.session.get(self.API_URL, params=params, timeout=30)

                # Handle 429 before raise_for_status to enable immediate rotation.
                if response.status_code == 429:
                    pool.mark_exhausted(slot_idx)
                    rotations += 1
                    self.logger.log(
                        "GNEWS",
                        f"Key #{slot_idx + 1} (tier {stats[slot_idx]['tier']}) rate-limited (429), rotating",
                    )
                    continue

                response.raise_for_status()
                pool.record_success(slot_idx)
                data = response.json()

                articles = []
                for item in data.get("articles", []):
                    article = self._parse_item(item)
                    if article:
                        articles.append(article)

                updated = pool.get_stats()
                self.logger.log(
                    "GNEWS",
                    f"Fetched {len(articles)} articles via key #{slot_idx + 1} "
                    f"(tier {updated[slot_idx]['tier']}, calls_today={updated[slot_idx]['calls_today']})",
                )
                return articles

            except requests.exceptions.RequestException as e:
                # Non-429 transport failure: don't rotate (the issue is network,
                # not the key), just bail out so we don't burn extra quota.
                self.logger.log("GNEWS_ERROR", f"API request failed: {str(e)[:120]}")
                return []
            except Exception as e:
                self.logger.log("GNEWS_ERROR", f"Unexpected error: {str(e)[:120]}")
                return []

        self.logger.log("GNEWS", "Exceeded 429 rotation cap, giving up for this run")
        return []

    def _parse_item(self, item: dict) -> dict | None:
        """
        Parse GNews API item into standard article format.

        Args:
            item: GNews article dict

        Returns:
            Article dict or None if invalid
        """
        url = normalize_url(item.get("url", ""))
        if not url:
            return None

        headline = item.get("title", "").strip()
        if not headline or len(headline) < 10:
            return None

        excerpt = item.get("description", "") or ""
        words = excerpt.split()
        if len(words) > 150:
            excerpt = " ".join(words[:150]) + "..."

        source_name = item.get("source", {}).get("name", "GNews")

        return {
            "url": url,
            "url_hash": compute_url_hash(url),
            "headline": headline,
            "excerpt": excerpt,
            "source_name": source_name,
            "source_url": self._get_base_url(url),
            "category_hint": "general",
            "fetched_at": datetime.now(UTC).isoformat(),
        }

    def _get_base_url(self, url: str) -> str:
        """Extract base URL from full URL."""
        try:
            parsed = urlparse(url)
            return f"{parsed.scheme}://{parsed.netloc}"
        except Exception:
            return ""
