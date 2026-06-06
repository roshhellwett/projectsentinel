

class ScoreEvaluator:

    @staticmethod
    def evaluate(
        groq_score: int | None = None,
        source_articles: list[dict] | None = None,
        fact_check_flags: list[str] | None = None,
    ) -> dict:

        base_score = groq_score if groq_score is not None else 0
        if source_articles is None:
            source_articles = []
        if fact_check_flags is None:
            fact_check_flags = []

        source_count = len(source_articles)

        final_score = int(base_score)

        if source_count >= 4:
            final_score = min(100, final_score + 10)
        elif source_count == 3:
            final_score = min(100, final_score + 5)

        if fact_check_flags:
            final_score = max(0, final_score - 15)

        final_score = max(0, min(100, final_score))

        return {
            "final_score": final_score,
            "source_count": source_count,
            "sources": [{"name": a.get("source_name", ""), "url": a.get("url", "")} for a in source_articles],
            "fact_check_flags": fact_check_flags,
        }
