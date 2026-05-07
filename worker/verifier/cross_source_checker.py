"""
Cross-source verification - groups articles by topic using Union-Find for O(n log n).
Requires 2+ independent sources for verification.
"""

import os
import re
from typing import List, Dict, Set, Tuple
from datetime import datetime, timedelta, timezone
from collections import defaultdict

from supabase import create_client

from logger.pipeline_logger import PipelineLogger


class UnionFind:
    """Efficient Union-Find data structure for grouping articles."""

    def __init__(self, n: int):
        self.parent = list(range(n))
        self.rank = [0] * n

    def find(self, x: int) -> int:
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, x: int, y: int) -> bool:
        px, py = self.find(x), self.find(y)
        if px == py:
            return False
        if self.rank[px] < self.rank[py]:
            px, py = py, px
        self.parent[py] = px
        if self.rank[px] == self.rank[py]:
            self.rank[px] += 1
        return True


STOP_WORDS: Set[str] = frozenset({
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
    'her', 'was', 'one', 'our', 'out', 'has', 'have', 'been', 'being',
    'from', 'with', 'this', 'that', 'they', 'will', 'each', 'does', 'did',
    'more', 'most', 'some', 'such', 'than', 'very', 'just', 'because',
    'while', 'after', 'over', 'under', 'again', 'further', 'then', 'once',
    'here', 'there', 'when', 'where', 'why', 'how', 'what', 'which',
    'who', 'whom', 'whose', 'these', 'those', 'their', 'about', 'into',
    'through', 'during', 'before', 'between', 'other', 'only', 'own',
    'same', 'also', 'says', 'said', 'say', 'new', 'old', 'first', 'last',
    'high', 'low', 'big', 'yet', 'both', 'even', 'much', 'any', 'many',
    'may', 'might', 'must', 'shall', 'should', 'could', 'would',
    'india', 'indian', 'news', 'live', 'updates', 'breaking', 'latest',
})


class CrossSourceChecker:
    """Checks if articles are confirmed by multiple trusted sources."""

    MIN_SHARED_KEYWORDS = 2
    MIN_SIMILARITY = 0.24
    MAX_ARTICLES_TO_COMPARE = 80

    def __init__(self):
        self.logger = PipelineLogger()
        self.supabase = None
        self._recent_cache: List[Dict] = []
        self._cache_time: datetime = datetime.min.replace(tzinfo=timezone.utc)
        self._init_supabase()

    def _init_supabase(self):
        """Initialize Supabase client."""
        supabase_url = os.getenv("SUPABASE_URL", "")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

        if supabase_url and supabase_key:
            try:
                self.supabase = create_client(supabase_url, supabase_key)
            except Exception as e:
                self.logger.log("CROSS_SOURCE_ERROR", f"Failed to connect: {str(e)}")

    def _get_recent_raw_articles(self) -> List[Dict]:
        """Get recent unprocessed articles with 30-minute cache."""
        now = datetime.now(timezone.utc)
        if (now - self._cache_time).total_seconds() < 1800:
            return self._recent_cache

        if not self.supabase:
            return []

        try:
            two_hours_ago = (now - timedelta(hours=2)).isoformat()

            result = self.supabase.table("raw_articles")\
                .select("*")\
                .eq("processed", False)\
                .gte("fetched_at", two_hours_ago)\
                .execute()

            self._recent_cache = result.data or []
            self._cache_time = now
            return self._recent_cache
        except Exception as e:
            self.logger.log("CROSS_SOURCE_ERROR", f"Failed to get recent articles: {str(e)}")
            return []

    def get_verified_groups(self, articles: List[Dict]) -> List[List[Dict]]:
        """
        Group articles by topic using Union-Find and return only groups with 2+ sources.

        Time complexity: O(n * k) where k = avg keywords per article
        Space complexity: O(n)

        Args:
            articles: List of article dicts

        Returns:
            List of article groups (each group has 2+ different sources)
        """
        recent_articles = self._get_recent_raw_articles()
        all_articles = self._unique_articles(articles + recent_articles)

        if len(all_articles) < 2:
            return []

        groups = self._group_by_topic(all_articles)

        verified_groups = []
        for group in groups:
            source_names = set(a.get("source_name", "") for a in group)
            if len(source_names) >= 2:
                verified_groups.append(group[:5])

        self.logger.log("CROSS_SOURCE", f"Found {len(verified_groups)} verified groups from {len(groups)} total groups")
        return verified_groups

    def _group_by_topic(self, articles: List[Dict]) -> List[List[Dict]]:
        """
        Group articles by similar topics using Union-Find for O(n log n) grouping.

        Args:
            articles: List of articles

        Returns:
            List of article groups
        """
        articles = articles[:self.MAX_ARTICLES_TO_COMPARE]
        article_keywords = []
        for article in articles:
            headline = article.get("headline", "")
            keywords = self._extract_significant_words(headline)
            article_keywords.append(keywords)

        uf = UnionFind(len(articles))

        keyword_to_indices: Dict[str, List[int]] = defaultdict(list)
        for i, keywords in enumerate(article_keywords):
            for kw in keywords:
                keyword_to_indices[kw].append(i)

        candidate_pairs: Set[Tuple[int, int]] = set()
        for indices in keyword_to_indices.values():
            if len(indices) > 12:
                continue
            for left_pos, left in enumerate(indices):
                for right in indices[left_pos + 1:]:
                    candidate_pairs.add((left, right))

        for left, right in candidate_pairs:
            if self._same_source(articles[left], articles[right]):
                continue
            if self._are_same_story(article_keywords[left], article_keywords[right]):
                uf.union(left, right)

        group_map: Dict[int, List[int]] = defaultdict(list)
        for i in range(len(articles)):
            group_map[uf.find(i)].append(i)

        groups = []
        for indices in group_map.values():
            if len(indices) < 2:
                continue

            group = [articles[i] for i in indices]
            groups.append(group)

        return groups

    def _are_same_story(self, left: Set[str], right: Set[str]) -> bool:
        """Require more than one shared meaningful term before grouping."""
        if not left or not right:
            return False

        shared = left & right
        if len(shared) < self.MIN_SHARED_KEYWORDS:
            return False

        similarity = len(shared) / max(len(left | right), 1)
        return similarity >= self.MIN_SIMILARITY

    def _same_source(self, left: Dict, right: Dict) -> bool:
        """Treat matching source names or domains as the same source."""
        left_name = (left.get("source_name") or "").strip().lower()
        right_name = (right.get("source_name") or "").strip().lower()
        left_url = (left.get("source_url") or "").strip().lower()
        right_url = (right.get("source_url") or "").strip().lower()
        return bool((left_name and left_name == right_name) or (left_url and left_url == right_url))

    def _unique_articles(self, articles: List[Dict]) -> List[Dict]:
        """Deduplicate merged live and recent article lists by URL hash."""
        unique = []
        seen = set()
        for article in articles:
            key = article.get("url_hash") or article.get("url")
            if not key or key in seen:
                continue
            seen.add(key)
            unique.append(article)
        return unique

    def _extract_significant_words(self, headline: str) -> Set[str]:
        """
        Extract significant words from headline for matching.

        Args:
            headline: Article headline

        Returns:
            Set of significant words
        """
        if not headline:
            return set()

        headline = headline.lower()
        headline = re.sub(r'[^\w\s]', ' ', headline)

        words = headline.split()
        significant = {w for w in words if len(w) > 3 and w not in STOP_WORDS}

        return significant
