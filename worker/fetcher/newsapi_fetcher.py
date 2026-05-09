"""
NewsAPI.org fetcher - supplementary news source.
Limited to 6 calls per day to stay within free tier (100 req/day).
"""

import os
from datetime import UTC, datetime, timedelta

import requests

from fetcher.url_tools import compute_url_hash, normalize_url
from logger.pipeline_logger import PipelineLogger


class NewsAPIFetcher:
    """Fetches news from NewsAPI.org."""

    API_URL = "https://newsapi.org/v2/everything"

    def __init__(self):
        self.api_key = os.getenv("NEWSAPI_KEY", "")
        self.logger = PipelineLogger()
        self.session = requests.Session()

    def fetch(self) -> list[dict]:
        """
        Fetch Indian news from NewsAPI.
        Uses 1 API call per run - stays within 100 req/day limit.

        Returns:
            List of article dicts
        """
        if not self.api_key:
            self.logger.log("NEWSAPI", "No API key configured, skipping")
            return []

        articles = []

        # Search for India news from last 24 hours
        yesterday = (datetime.now(UTC) - timedelta(days=1)).strftime("%Y-%m-%d")

        params = {
            "q": "India",
            "language": "en",
            "from": yesterday,
            "sortBy": "publishedAt",
            "pageSize": 20,
            "apiKey": self.api_key,
        }

        try:
            response = self.session.get(self.API_URL, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()

            if data.get("status") != "ok":
                self.logger.log("NEWSAPI_ERROR", f"API error: {data.get('message', 'Unknown')}")
                return []

            for item in data.get("articles", []):
                article = self._parse_item(item)
                if article:
                    articles.append(article)

            self.logger.log("NEWSAPI", f"Fetched {len(articles)} articles")

        except requests.exceptions.RequestException as e:
            self.logger.log("NEWSAPI_ERROR", f"API request failed: {str(e)}")
        except Exception as e:
            self.logger.log("NEWSAPI_ERROR", f"Unexpected error: {str(e)}")

        return articles

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
            from urllib.parse import urlparse

            parsed = urlparse(url)
            return f"{parsed.scheme}://{parsed.netloc}"
        except Exception:
            return ""
