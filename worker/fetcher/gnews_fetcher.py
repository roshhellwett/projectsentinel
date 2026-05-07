"""
GNews API fetcher - supplementary news source.
Limited to 6 calls per day to stay within free tier (100 req/day).
"""

import os
from typing import List, Dict, Optional
from datetime import datetime, timedelta

import requests

from logger.pipeline_logger import PipelineLogger
from fetcher.url_tools import compute_url_hash, normalize_url


class GNewsFetcher:
    """Fetches news from GNews API."""
    
    API_URL = "https://gnews.io/api/v4/search"
    
    def __init__(self):
        self.api_key = os.getenv("GNEWS_API_KEY", "")
        self.logger = PipelineLogger()
        self.session = requests.Session()
    
    def fetch(self) -> List[Dict]:
        """
        Fetch Indian news from GNews API.
        Uses 1 API call per run - stays within 100 req/day limit.
        
        Returns:
            List of article dicts
        """
        if not self.api_key:
            self.logger.log("GNEWS", "No API key configured, skipping")
            return []
        
        articles = []
        
        # Search for India news from last 24 hours
        yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
        
        params = {
            "q": "India",
            "lang": "en",
            "country": "in",
            "max": 20,
            "from": yesterday,
            "apikey": self.api_key
        }
        
        try:
            response = self.session.get(self.API_URL, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            for item in data.get("articles", []):
                article = self._parse_item(item)
                if article:
                    articles.append(article)
            
            self.logger.log("GNEWS", f"Fetched {len(articles)} articles")
            
        except requests.exceptions.RequestException as e:
            self.logger.log("GNEWS_ERROR", f"API request failed: {str(e)}")
        except Exception as e:
            self.logger.log("GNEWS_ERROR", f"Unexpected error: {str(e)}")
        
        return articles
    
    def _parse_item(self, item: Dict) -> Optional[Dict]:
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
        
        # Get description as excerpt
        excerpt = item.get("description", "")
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
            "fetched_at": None
        }
    
    def _get_base_url(self, url: str) -> str:
        """Extract base URL from full URL."""
        try:
            from urllib.parse import urlparse
            parsed = urlparse(url)
            return f"{parsed.scheme}://{parsed.netloc}"
        except Exception:
            return ""
