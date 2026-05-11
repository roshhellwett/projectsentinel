"""
Fact-check feed fetcher - updates known_false_claims table from AltNews and AFP.
Optimized: batch insert instead of N+1 queries.
"""

import re

import feedparser
import requests

from logger.pipeline_logger import PipelineLogger


_STOP_WORDS: frozenset[str] = frozenset(
    {
        "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
        "have", "has", "had", "do", "does", "did", "will", "would", "could",
        "should", "may", "might", "must", "shall", "can", "need", "to", "of",
        "in", "for", "on", "with", "at", "by", "from", "as", "into", "through",
        "during", "before", "after", "above", "below", "between", "under",
        "again", "further", "then", "once", "here", "there", "when", "where",
        "why", "how", "all", "each", "few", "more", "most", "other", "some",
        "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too",
        "very", "just", "and", "but", "if", "or", "because", "until", "while",
        "this", "that", "these", "those", "am", "s", "t", "don", "doesn",
        "didn", "wasn", "weren", "haven", "hasn", "hadn", "won", "wouldn",
        "shouldn", "mightn", "mustn", "isn", "aren",
    }
)


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
        from database.client import get_supabase

        supabase = get_supabase()
        if not supabase:
            self.logger.log("FACTCHECK_ERROR", "Database connection failed or not configured")
            return 0

        new_claims = []
        existing_urls = set()

        try:
            # Bound the query — fact-check feeds only republish recent items,
            # so the latest 2000 URLs are sufficient for dedup.
            existing = (
                supabase.table("known_false_claims")
                .select("fact_check_url")
                .order("added_at", desc=True)
                .limit(2000)
                .execute()
            )
            existing_urls = {row["fact_check_url"] for row in (existing.data or []) if row.get("fact_check_url")}
        except Exception as e:
            self.logger.log("FACTCHECK_ERROR", f"Failed to get existing claims: {str(e)}")

        for feed_config in self.FACTCHECK_FEEDS:
            try:
                # Use requests for the network call so we have a timeout
                # (feedparser.parse(url) has no timeout and can hang the pipeline).
                resp = requests.get(
                    feed_config["url"],
                    timeout=20,
                    headers={"User-Agent": "IndiaVerified Bot/1.0"},
                )
                resp.raise_for_status()
                feed = feedparser.parse(resp.content)

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
                try:
                    supabase.table("known_false_claims").upsert(new_claims, on_conflict="fact_check_url").execute()
                except TypeError:
                    supabase.table("known_false_claims").insert(new_claims).execute()
                self.logger.log("FACTCHECK", f"Added {len(new_claims)} new fact checks")
            except Exception as e:
                self.logger.log("FACTCHECK_ERROR", f"Batch insert failed: {str(e)}")

        return len(new_claims)

    def _parse_factcheck(self, entry, source: str) -> dict | None:
        """Parse a fact-check entry into claim format."""
        url = entry.get("link", "")
        if not url:
            return None

        title = entry.get("title", "").strip()
        if not title:
            return None

        keywords = self._extract_keywords(title)

        return {"claim_summary": title, "source": source, "fact_check_url": url, "keywords": keywords}

    def _extract_keywords(self, title: str) -> list[str]:
        """Extract relevant keywords from a fact-check title."""
        words = re.findall(r"\b\w+\b", title.lower())
        keywords = [w for w in words if len(w) > 3 and w not in _STOP_WORDS]

        return list(dict.fromkeys(keywords))[:10]
