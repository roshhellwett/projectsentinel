

import re
from datetime import UTC, datetime

from database.client import get_supabase
from logger.pipeline_logger import PipelineLogger

class FactCheckMatcher:

    def __init__(self):
        self.logger = PipelineLogger()
        self.supabase = None
        self.known_claims: list[dict] = []
        self._last_load: datetime = datetime.min.replace(tzinfo=UTC)
        self._init_supabase()

    def _init_supabase(self):

        self.supabase = get_supabase()

    def _load_known_claims(self):

        now = datetime.now(UTC)
        if (now - self._last_load).total_seconds() < 3600 and self.known_claims:
            return

        if not self.supabase:
            return

        try:
            result = (
                self.supabase.table("known_false_claims")
                .select("claim_summary,keywords,fact_check_url")
                .order("added_at", desc=True)
                .limit(500)
                .execute()
            )
            self.known_claims = result.data or []
            self._last_load = now
            self.logger.log("FACTCHECK_MATCHER", f"Loaded {len(self.known_claims)} known false claims")
        except Exception as e:
            self.logger.log("FACTCHECK_MATCHER_ERROR", f"Failed to load claims: {str(e)}")

    def is_false_claim(self, headline: str) -> bool:

        if not headline:
            return False

        self._load_known_claims()

        if not self.known_claims:
            return False

        headline_lower = headline.lower()
        headline_words = set(re.findall(r"\b\w+\b", headline_lower))

        for claim in self.known_claims:
            keywords = claim.get("keywords", [])

            if keywords:
                keyword_matches = sum(
                    1 for kw in keywords if re.search(r"\b" + re.escape(kw.lower()) + r"\b", headline_lower)
                )
                threshold = max(2, len(keywords) * 0.3)
                if keyword_matches >= threshold:
                    self.logger.log("FACTCHECK_MATCHER", f"Matched false claim: {claim.get('claim_summary', '')[:50]}")
                    return True

            claim_summary = claim.get("claim_summary", "").lower()
            if claim_summary and len(claim_summary) > 20:
                claim_words = set(re.findall(r"\b\w+\b", claim_summary))
                if not headline_words or not claim_words:
                    continue
                overlap = headline_words & claim_words
                if len(overlap) >= 4 and len(overlap) / min(len(headline_words), len(claim_words)) >= 0.5:
                    self.logger.log("FACTCHECK_MATCHER", f"Word overlap match: {claim.get('claim_summary', '')[:50]}")
                    return True

        return False
