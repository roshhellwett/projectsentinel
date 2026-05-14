"""
NewsAPI.org fetcher - supplementary news source.

Multi-key tier rotation: up to 6 keys via NEWSAPI_KEY_1..NEWSAPI_KEY_6.
Tier 1 (keys 1-3) is used until every tier-1 key is 429/quota-exhausted
for the run, then tier 2 (keys 4-6) activates. Falls back to the legacy
single NEWSAPI_KEY when no numbered variant is configured.

NewsAPI's free "Developer" tier returns 429 with `code=rateLimited` once
the daily quota is reached. We treat both HTTP 429 and the in-body
`rateLimited` / `maximumResultsReached` status codes as exhaustion signals.
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


class NewsAPIFetcher:
    """Fetches news from NewsAPI.org with multi-key tier rotation."""

    API_URL = "https://newsapi.org/v2/everything"
    PAGE_SIZE = 100  # NewsAPI free tier allows up to 100 results per page.
    MAX_429_ROTATIONS = 6

    # In-body quota-exhaustion error codes returned with HTTP 200/401/429.
    # `rateLimited` / `maximumResultsReached` / `apiKeyExhausted` all reset
    # at midnight UTC, so we park the slot for the day only.
    _QUOTA_CODES = {"rateLimited", "maximumResultsReached", "apiKeyExhausted"}

    # In-body codes that indicate the key is permanently dead (revoked or
    # account-disabled). Treat these like an HTTP 401/403 — disable the slot
    # globally so we don't waste another HTTP call on it.
    _INVALID_KEY_CODES = {"apiKeyInvalid", "apiKeyDisabled"}

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
                keys = load_numbered_keys(os.getenv, "NEWSAPI_KEY", max_keys=6)
                if keys:
                    cls._key_pool = KeyPool(keys, name="NewsAPI")
            return cls._key_pool

    @classmethod
    def _reset_pool(cls) -> None:
        """Reset the shared pool. Intended for tests only."""
        with cls._key_pool_lock:
            cls._key_pool = None

    @classmethod
    def has_quota(cls) -> bool:
        """True if at least one NewsAPI key is still usable this run."""
        pool = cls._ensure_pool()
        return bool(pool and pool.has_available())

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def fetch(self) -> list[dict]:
        """
        Fetch Indian news from NewsAPI with tier rotation on 429 / quota errors.
        """
        pool = self._ensure_pool()
        if pool is None:
            self.logger.log("NEWSAPI", "No API key configured, skipping")
            return []

        yesterday = (datetime.now(UTC) - timedelta(days=1)).strftime("%Y-%m-%d")

        rotations = 0
        while rotations <= self.MAX_429_ROTATIONS:
            try:
                slot_idx, api_key = pool.pick()
            except AllKeysExhaustedError:
                self.logger.log(
                    "NEWSAPI",
                    "All NewsAPI keys are rate-limited for this run, skipping",
                    {"key_stats": pool.get_stats()},
                )
                return []

            stats = pool.get_stats()
            params = {
                "q": "India",
                "language": "en",
                "from": yesterday,
                "sortBy": "publishedAt",
                "pageSize": self.PAGE_SIZE,
                "apiKey": api_key,
            }

            try:
                response = self.session.get(self.API_URL, params=params, timeout=30)

                if response.status_code == 429:
                    pool.mark_exhausted(slot_idx)
                    rotations += 1
                    self.logger.log(
                        "NEWSAPI",
                        f"Key #{slot_idx + 1} (tier {stats[slot_idx]['tier']}) HTTP 429, rotating",
                    )
                    continue

                response.raise_for_status()
                data = response.json()

                # NewsAPI uses status=error with various in-body codes even on
                # HTTP 200 for some quota / auth cases. Translate them to the
                # right pool-level signal so the key gets parked correctly.
                if data.get("status") != "ok":
                    code = data.get("code", "")
                    msg = data.get("message", "Unknown")
                    if code in self._INVALID_KEY_CODES:
                        pool.mark_invalid(slot_idx)
                        rotations += 1
                        self.logger.log(
                            "NEWSAPI_ERROR",
                            f"Key #{slot_idx + 1} permanently invalid ({code}), "
                            f"disabling and rotating: {msg[:80]}",
                        )
                        continue
                    if code in self._QUOTA_CODES:
                        pool.mark_exhausted(slot_idx)
                        rotations += 1
                        self.logger.log(
                            "NEWSAPI",
                            f"Key #{slot_idx + 1} quota error ({code}), rotating: {msg[:80]}",
                        )
                        continue
                    # Unknown error code: log and bail out without penalizing
                    # the key (it's likely a caller-side parameter mistake).
                    self.logger.log("NEWSAPI_ERROR", f"API error: {msg[:120]} (code={code})")
                    return []

                pool.record_success(slot_idx)

                articles = []
                for item in data.get("articles", []):
                    article = self._parse_item(item)
                    if article:
                        articles.append(article)

                updated = pool.get_stats()
                self.logger.log(
                    "NEWSAPI",
                    f"Fetched {len(articles)} articles via key #{slot_idx + 1} "
                    f"(tier {updated[slot_idx]['tier']}, calls_today={updated[slot_idx]['calls_today']})",
                )
                return articles

            except requests.exceptions.RequestException as e:
                self.logger.log("NEWSAPI_ERROR", f"API request failed: {str(e)[:120]}")
                return []
            except Exception as e:
                self.logger.log("NEWSAPI_ERROR", f"Unexpected error: {str(e)[:120]}")
                return []

        self.logger.log("NEWSAPI", "Exceeded 429 rotation cap, giving up for this run")
        return []

    def _parse_item(self, item: dict) -> dict | None:
        """
        Parse NewsAPI item into standard article format.

        Args:
            item: NewsAPI article dict

        Returns:
            Article dict or None if invalid
        """
        url = normalize_url(item.get("url", ""))
        if not url:
            return None

        headline = item.get("title", "").strip()
        if not headline or len(headline) < 10:
            return None

        # Get description as excerpt
        excerpt = item.get("description", "") or ""
        words = excerpt.split()
        if len(words) > 150:
            excerpt = " ".join(words[:150]) + "..."

        source_name = item.get("source", {}).get("name", "NewsAPI")

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
