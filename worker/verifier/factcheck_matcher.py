import re

from cache.keys import KNOWN_CLAIMS, KNOWN_CLAIMS_TTL
from cache.shared_cache import cache
from database.client import get_supabase
from logger.pipeline_logger import PipelineLogger

cache.register(KNOWN_CLAIMS, KNOWN_CLAIMS_TTL)


class FactCheckMatcher:
    def __init__(self):
        self.logger = PipelineLogger()
        self.supabase = None
        self._init_supabase()

    def _init_supabase(self):

        self.supabase = get_supabase()

    def _load_known_claims(self):

        cached = cache.get(KNOWN_CLAIMS)
        if cached is not None:
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
            claims = result.data or []
            for claim in claims:
                claim_summary = claim.get("claim_summary", "").lower()
                if claim_summary and len(claim_summary) > 20:
                    claim["_claim_words"] = set(re.findall(r"\b\w+\b", claim_summary))
            cache.set(KNOWN_CLAIMS, claims)
            self.logger.log("FACTCHECK_MATCHER", f"Loaded {len(claims)} known false claims (cached)")
        except Exception as e:
            self.logger.log("FACTCHECK_MATCHER_ERROR", f"Failed to load claims: {str(e)}")

    def is_false_claim(self, headline: str) -> bool:

        if not headline:
            return False

        self._load_known_claims()

        claims = cache.stale_or_none(KNOWN_CLAIMS)
        if not claims:
            return False

        headline_lower = headline.lower()
        headline_words = set(re.findall(r"\b\w+\b", headline_lower))

        for claim in claims:
            keywords = claim.get("keywords", [])

            if keywords:
                keyword_matches = sum(
                    1 for kw in keywords if re.search(r"\b" + re.escape(kw.lower()) + r"\b", headline_lower)
                )
                threshold = max(1, int(len(keywords) * 0.5))
                if keyword_matches >= threshold:
                    self.logger.log("FACTCHECK_MATCHER", f"Matched false claim: {claim.get('claim_summary', '')[:50]}")
                    return True

            claim_words = claim.get("_claim_words")
            if claim_words:
                if not headline_words:
                    continue
                overlap = headline_words & claim_words
                if len(overlap) >= 4 and len(overlap) / min(len(headline_words), len(claim_words)) >= 0.5:
                    self.logger.log("FACTCHECK_MATCHER", f"Word overlap match: {claim.get('claim_summary', '')[:50]}")
                    return True

        return False
