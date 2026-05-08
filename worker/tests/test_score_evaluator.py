from verifier.score_evaluator import ScoreEvaluator


def make_articles(n):
    return [{"source_name": f"Src{i}", "url": f"https://example{i}.com"} for i in range(n)]


def test_evaluator_perfect_score():
    result = ScoreEvaluator.evaluate(groq_score=80, source_articles=make_articles(5), fact_check_flags=[])
    assert result["final_score"] >= 80


def test_evaluator_with_flags():
    result = ScoreEvaluator.evaluate(
        groq_score=80, source_articles=make_articles(3), fact_check_flags=["partially_matched_claim"]
    )
    assert result["final_score"] < 80


def test_evaluator_low_source_count():
    result = ScoreEvaluator.evaluate(groq_score=70, source_articles=make_articles(2), fact_check_flags=[])
    assert result["final_score"] > 0


def test_evaluator_minimum_score():
    result = ScoreEvaluator.evaluate(
        groq_score=10, source_articles=make_articles(1), fact_check_flags=["confirmed_false_claim"]
    )
    assert result["final_score"] == 0


def test_evaluator_source_count():
    result = ScoreEvaluator.evaluate(groq_score=50, source_articles=make_articles(1), fact_check_flags=[])
    assert result["source_count"] == 1
    assert len(result["sources"]) == 1


def test_evaluator_source_bonus():
    result_2 = ScoreEvaluator.evaluate(groq_score=80, source_articles=make_articles(2), fact_check_flags=[])
    result_4 = ScoreEvaluator.evaluate(groq_score=80, source_articles=make_articles(4), fact_check_flags=[])
    assert result_4["final_score"] > result_2["final_score"]
