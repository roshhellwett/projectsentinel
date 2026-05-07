"""
RSS feed fetcher - parallel fetching with session reuse.
Optimized: concurrent feed fetching, session passed to feedparser.
"""

import hashlib
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Dict, Optional
from datetime import datetime, timezone
from urllib.parse import urlparse
from bs4 import BeautifulSoup
import feedparser
import requests

from sources.rss_sources import get_rss_sources
from logger.pipeline_logger import PipelineLogger


class RSSFetcher:
    """Fetches and parses RSS feeds from configured sources."""

    def __init__(self, max_workers: int = 8):
        self.logger = PipelineLogger()
        self.max_workers = max_workers

    def fetch_all(self) -> List[Dict]:
        """
        Fetch all RSS feeds concurrently and return list of raw articles.

        Returns:
            List of article dicts with headline, url, excerpt, source info
        """
        articles = []
        sources = get_rss_sources()

        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            future_to_source = {
                executor.submit(self._fetch_feed, source): source
                for source in sources
            }

            for future in as_completed(future_to_source):
                source = future_to_source[future]
                try:
                    feed_articles = future.result(timeout=30)
                    articles.extend(feed_articles)
                    self.logger.log("RSS", f"Fetched {len(feed_articles)} from {source['name']}")
                except Exception as e:
                    self.logger.log("RSS_ERROR", f"Failed to fetch {source['name']}: {str(e)}")

        return articles

    def _fetch_feed(self, source: Dict) -> List[Dict]:
        """
        Fetch and parse a single RSS feed.

        Args:
            source: Dict with name, url, category_hint

        Returns:
            List of article dicts
        """
        articles = []

        session = requests.Session()
        session.headers.update({
            "User-Agent": "ProjectSentinel Bot/1.0 (+https://projectsentinel.in/bot)"
        })

        try:
            feed = feedparser.parse(source["url"], request_session=session)
        except Exception:
            return []

        for entry in feed.entries[:10]:
            try:
                article = self._parse_entry(entry, source)
                if article:
                    articles.append(article)
            except Exception as e:
                self.logger.log("RSS_PARSE", f"Failed to parse entry: {str(e)}")
                continue

        return articles

    def _parse_entry(self, entry, source: Dict) -> Optional[Dict]:
        """
        Parse a single RSS entry into article format.

        Args:
            entry: feedparser entry
            source: Source config dict

        Returns:
            Article dict or None if invalid
        """
        url = entry.get("link", "")
        if not url:
            return None

        headline = entry.get("title", "").strip()
        if not headline or len(headline) < 10:
            return None

        excerpt = self._extract_excerpt(entry)

        return {
            "url": url,
            "url_hash": hashlib.sha256(url.encode()).hexdigest(),
            "headline": headline,
            "excerpt": excerpt,
            "source_name": source["name"],
            "source_url": self._get_base_url(url),
            "category_hint": source.get("category_hint", "general"),
            "fetched_at": datetime.now(timezone.utc).isoformat()
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
        if len(words) > 150:
            text = " ".join(words[:150]) + "..."

        return text

    def _get_base_url(self, url: str) -> str:
        """Extract base URL from full URL."""
        try:
            parsed = urlparse(url)
            return f"{parsed.scheme}://{parsed.netloc}"
        except Exception:
            return ""
