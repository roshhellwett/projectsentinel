"""
Post builder - assembles final post object before database insertion.
Fixed: single timestamp capture, validation.
"""

from datetime import UTC, datetime


class PostBuilder:
    """Builds the final post object from verified data."""

    def build(
        self,
        headline: str,
        summary: str,
        category: str,
        credibility_score: int,
        credibility_reason: str,
        source_articles: list[dict],
    ) -> dict:
        """
        Assemble final post object.

        Args:
            headline: AI-written headline
            summary: AI-written summary
            category: Article category
            credibility_score: Verification score
            credibility_reason: Why the score was given
            source_articles: List of confirming source articles

        Returns:
            Post dict ready for database insertion
        """
        if not headline or not headline.strip():
            raise ValueError("Headline cannot be empty")
        if not summary or not summary.strip():
            raise ValueError("Summary cannot be empty")

        sources = [
            {"name": article.get("source_name", "Unknown"), "url": article.get("url", "")}
            for article in source_articles
            if article.get("url")
        ]

        now = datetime.now(UTC).isoformat()

        return {
            "headline": headline.strip(),
            "summary": summary.strip(),
            "category": category,
            "credibility_score": max(0, min(100, credibility_score)),
            "credibility_reason": credibility_reason,
            "source_count": len(sources),
            "sources": sources,
            "fact_check_flags": [],
            "status": "published",
            "correction_note": None,
            "published_at": now,
            "updated_at": now,
        }
