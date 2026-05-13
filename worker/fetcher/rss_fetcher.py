"""
RSS feed fetcher - parallel fetching with session reuse.

Optimisations:
  * Concurrent feed fetching via a thread pool.
  * Per-thread `requests.Session` reuse (HTTPS keep-alive).
  * **Auto-disable** of broken feeds: any feed that fails 3 fetches in a row
    is parked for 24 hours and skipped until then. On the next attempt after
    the park window, the feed is retried — if it recovers, the failure
    counter resets to zero. State is kept in process memory (not persisted)
    because a worker restart simply retries everything once and re-parks any
    feed that's still broken, which is the same outcome at trivial cost.
"""

import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import UTC, datetime
from urllib.parse import urlparse

import feedparser
import requests
from bs4 import BeautifulSoup

from fetcher.url_tools import compute_url_hash, normalize_url
from logger.pipeline_logger import PipelineLogger
from sources.rss_sources import get_rss_sources


class RSSFetcher:
    """Fetches and parses RSS feeds from configured sources."""

    _USER_AGENT = "IndiaVerified Bot/1.0 (+https://indiaverified.in/bot)"

    # ── Auto-disable tuning ──
    # Three consecutive failures before parking. One success anywhere in
    # between resets the streak. Tuned to absorb transient blips (publisher
    # restarts, DNS flaps) without prematurely parking healthy feeds.
    _FAIL_THRESHOLD = 3
    _PARK_DURATION_SECONDS = 24 * 60 * 60  # 24h

    # url → {"fails": int, "parked_until": float (epoch seconds)}
    # Shared across all RSSFetcher instances and threads, guarded by lock.
    _feed_health: dict[str, dict] = {}
    _feed_health_lock = threading.Lock()

    def __init__(self, max_workers: int = 8):
        self.logger = PipelineLogger()
        self.max_workers = max_workers
        self._local = threading.local()

    # ------------------------------------------------------------------
    # Auto-disable state machine
    # ------------------------------------------------------------------

    @classmethod
    def _is_parked(cls, url: str) -> bool:
        """True if this feed is currently in the 24h park window."""
        now = time.time()
        with cls._feed_health_lock:
            state = cls._feed_health.get(url)
            return bool(state and state.get("parked_until", 0) > now)

    @classmethod
    def _record_failure(cls, url: str) -> bool:
        """
        Bump the failure counter. Returns True iff this failure just tripped
        the threshold and parked the feed, so the caller can log the event
        exactly once instead of on every subsequent fail.
        """
        with cls._feed_health_lock:
            state = cls._feed_health.setdefault(url, {"fails": 0, "parked_until": 0.0})
            state["fails"] += 1
            if state["fails"] >= cls._FAIL_THRESHOLD:
                state["parked_until"] = time.time() + cls._PARK_DURATION_SECONDS
                state["fails"] = 0  # reset; next failure starts a fresh streak
                return True
        return False

    @classmethod
    def _record_success(cls, url: str) -> None:
        """Reset the failure streak and lift any active park for this feed."""
        with cls._feed_health_lock:
            state = cls._feed_health.get(url)
            if state and (state["fails"] or state["parked_until"]):
                state["fails"] = 0
                state["parked_until"] = 0.0

    @classmethod
    def _reset_health(cls) -> None:
        """Test-only hook to clear all per-feed health state."""
        with cls._feed_health_lock:
            cls._feed_health.clear()

    def _get_session(self) -> requests.Session:
        """Return a thread-local session (requests.Session is NOT thread-safe)."""
        session = getattr(self._local, "session", None)
        if session is None:
            session = requests.Session()
            session.headers.update({"User-Agent": self._USER_AGENT})
            self._local.session = session
        return session

    def fetch_all(self) -> list[dict]:
        """
        Fetch all RSS feeds concurrently and return list of raw articles.

        Feeds currently in the 24h park window are skipped before they ever
        reach the thread pool, so they don't consume a worker slot or HTTP
        timeout budget.

        Returns:
            List of article dicts with headline, url, excerpt, source info
        """
        articles = []
        all_sources = get_rss_sources()

        # Partition parked vs. active sources up-front so we can log the
        # skip count once instead of one line per parked feed.
        active_sources = []
        parked_count = 0
        for source in all_sources:
            if self._is_parked(source["url"]):
                parked_count += 1
            else:
                active_sources.append(source)

        if parked_count:
            self.logger.log(
                "RSS",
                f"Skipping {parked_count} parked feed(s); fetching {len(active_sources)} active",
            )

        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            future_to_source = {executor.submit(self._fetch_feed, source): source for source in active_sources}

            for future in as_completed(future_to_source):
                source = future_to_source[future]
                try:
                    feed_articles = future.result(timeout=30)
                    articles.extend(feed_articles)
                    self.logger.log("RSS", f"Fetched {len(feed_articles)} from {source['name']}")
                except Exception as e:
                    self.logger.log("RSS_ERROR", f"Failed to fetch {source['name']}: {str(e)}")

        return articles

    def _fetch_feed(self, source: dict) -> list[dict]:
        """
        Fetch and parse a single RSS feed.

        Args:
            source: Dict with name, url, category_hint

        Returns:
            List of article dicts
        """
        articles = []
        url = source["url"]
        name = source.get("name", url)

        try:
            resp = self._get_session().get(url, timeout=20)
            resp.raise_for_status()
            feed = feedparser.parse(resp.content)
        except Exception as e:
            just_parked = self._record_failure(url)
            if just_parked:
                self.logger.log(
                    "RSS_PARK",
                    f"Feed {name} parked for 24h after {self._FAIL_THRESHOLD} consecutive failures: {str(e)[:100]}",
                )
            else:
                self.logger.log(
                    "RSS_ERROR",
                    f"Feed fetch failed for {name}: {str(e)[:120]}",
                )
            return []

        # HTTP succeeded — clear any prior failure streak / park.
        self._record_success(url)

        for entry in feed.entries[:10]:
            try:
                article = self._parse_entry(entry, source)
                if article:
                    articles.append(article)
            except Exception as e:
                self.logger.log("RSS_PARSE", f"Failed to parse entry: {str(e)}")
                continue

        return articles

    def _parse_entry(self, entry, source: dict) -> dict | None:
        """
        Parse a single RSS entry into article format.

        Args:
            entry: feedparser entry
            source: Source config dict

        Returns:
            Article dict or None if invalid
        """
        url = normalize_url(entry.get("link", ""))
        if not url:
            return None

        headline = entry.get("title", "").strip()
        if not headline or len(headline) < 10:
            return None

        excerpt = self._extract_excerpt(entry)

        return {
            "url": url,
            "url_hash": compute_url_hash(url),
            "headline": headline,
            "excerpt": excerpt,
            "source_name": source["name"],
            "source_url": self._get_base_url(url),
            "category_hint": source.get("category_hint", "general"),
            "fetched_at": datetime.now(UTC).isoformat(),
        }

    def _extract_excerpt(self, entry) -> str:
        """
        Extract first 150 words from entry description/summary.

        Args:
            entry: feedparser entry

        Returns:
            Excerpt text (max 150 words)
        """
        text = entry.get("description", "") or entry.get("summary", "")

        if text:
            soup = BeautifulSoup(text, "html.parser")
            text = soup.get_text(separator=" ", strip=True)

        words = text.split()
        if len(words) > 60:
            text = " ".join(words[:60]) + "..."

        return text

    def _get_base_url(self, url: str) -> str:
        """Extract base URL from full URL."""
        try:
            parsed = urlparse(url)
            return f"{parsed.scheme}://{parsed.netloc}"
        except Exception:
            return ""
