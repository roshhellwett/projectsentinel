"""
Final score evaluation - combines Gemini score with cross-source results.
"""

from typing import List, Dict


class ScoreEvaluator:
    """Evaluates final credibility score based on multiple factors."""
    
    @staticmethod
    def evaluate(
        gemini_score: int,
        source_articles: List[Dict],
        fact_check_flags: List[str] = None
    ) -> Dict:
        """
        Calculate final credibility score and metadata.
        
        Args:
            gemini_score: Base score from Gemini (0-100)
            source_articles: List of confirming source articles
            fact_check_flags: Any fact-check warnings
            
        Returns:
            Dict with final_score, source_count, flags
        """
        if fact_check_flags is None:
            fact_check_flags = []
        
        source_count = len(source_articles)
        
        # Start with Gemini score
        final_score = gemini_score
        
        # Bonus for more sources (up to +10 for 4+ sources)
        if source_count >= 4:
            final_score = min(100, final_score + 10)
        elif source_count == 3:
            final_score = min(100, final_score + 5)
        
        # Penalty for fact-check flags
        if fact_check_flags:
            final_score = max(0, final_score - 15)
        
        # Ensure bounds
        final_score = max(0, min(100, final_score))
        
        return {
            "final_score": final_score,
            "source_count": source_count,
            "sources": [
                {"name": a.get("source_name", ""), "url": a.get("url", "")}
                for a in source_articles
            ],
            "fact_check_flags": fact_check_flags
        }
