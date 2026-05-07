"""
Fact-check feed fetcher - updates known_false_claims table from AltNews and AFP.
Optimized: batch insert instead of N+1 queries.
"""

import hashlib
import re
from typing import List, Dict, Optional

import feedparser

from logger.pipeline_logger import PipelineLogger


class FactCheckFetcher:
    """Fetches fact-check feeds and updates known false claims database."""

    FACTCHECK_FEEDS = [
        {"name": "AltNews", "url": "https://www.altnews.in/feed/"},
        {"name": "AFP India", "url": "https://factcheck.afp.com/list/rss/IN"},
    ]

    def __init__(self):
        self.logger = PipelineLogger()

    def update_known_false_claims(self) -> int:
        """
        Fetch fact-check feeds and return count of new entries.
        Uses batch insert to avoid N+1 queries.

        Returns:
            Number of new fact-checks added
        """
        import os
        from supabase import create_client

        supabase_url = os.getenv("SUPABASE_URL", "")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

        if not supabase_url or not supabase_key:
            self.logger.log("FACTCHECK", "Supabase not configured, skipping update")
            return 0

        try:
            supabase = create_client(supabase_url, supabase_key)
        except Exception as e:
            self.logger.log("FACTCHECK_ERROR", f"Database connection failed: {str(e)}")
            return 0

        new_claims = []
        existing_urls = set()

        try:
            existing = supabase.table("known_false_claims").select("fact_check_url").execute()
            existing_urls = {row["fact_check_url"] for row in (existing.data or [])}
        except Exception as e:
            self.logger.log("FACTCHECK_ERROR", f"Failed to get existing claims: {str(e)}")

        for feed_config in self.FACTCHECK_FEEDS:
            try:
                feed = feedparser.parse(feed_config["url"])

                for entry in feed.entries:
                    claim = self._parse_factcheck(entry, feed_config["name"])
                    if claim and claim["fact_check_url"] not in existing_urls:
                        new_claims.append(claim)
                        existing_urls.add(claim["fact_check_url"])

                self.logger.log("FACTCHECK", f"Processed {feed_config['name']} feed")

            except Exception as e:
                self.logger.log("FACTCHECK_ERROR", f"Failed to process {feed_config['name']}: {str(e)}")
                continue

        if new_claims:
            try:
                supabase.table("known_false_claims").insert(new_claims).execute()
                self.logger.log("FACTCHECK", f"Added {len(new_claims)} new fact checks")
            except Exception as e:
                self.logger.log("FACTCHECK_ERROR", f"Batch insert failed: {str(e)}")

        return len(new_claims)

    def _parse_factcheck(self, entry, source: str) -> Optional[Dict]:
        """Parse a fact-check entry into claim format."""
        url = entry.get("link", "")
        if not url:
            return None

        title = entry.get("title", "").strip()
        if not title:
            return None

        keywords = self._extract_keywords(title)

        return {
            "claim_summary": title,
            "source": source,
            "fact_check_url": url,
            "keywords": keywords,
            "added_at": None
        }

    def _extract_keywords(self, title: str) -> List[str]:
        """Extract relevant keywords from a fact-check title."""
        stop_words = frozenset({
            "the", "a", "an", "is", "are", "was", "were", "be", "been",
            "being", "have", "has", "had", "do", "does", "did", "will",
            "would", "could", "should", "may", "might", "must", "shall",
            "can", "need", "to", "of", "in", "for", "on", "with", "at",
            "by", "from", "as", "into", "through", "during", "before",
            "after", "above", "below", "between", "under", "again",
            "further", "then", "once", "here", "there", "when", "where",
            "why", "how", "all", "each", "few", "more", "most", "other",
            "some", "such", "no", "nor", "not", "only", "own", "same",
            "so", "than", "too", "very", "just", "and", "but", "if", "or",
            "because", "until", "while", "this", "that", "these", "those",
            "am", "s", "t", "don", "doesn", "didn", "wasn", "weren",
            "haven", "hasn", "hadn", "won", "wouldn", "shouldn", "mightn",
            "mustn", "isn", "aren"
        })

        words = re.findall(r'\b\w+\b', title.lower())
        keywords = [w for w in words if len(w) > 3 and w not in stop_words]

        return list(dict.fromkeys(keywords))[:10]
