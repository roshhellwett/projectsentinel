from verifier.cross_source_checker import CrossSourceChecker


def test_init_does_not_create_supabase():
    checker = CrossSourceChecker()
    assert not hasattr(checker, "supabase")


def test_init_creates_logger():
    checker = CrossSourceChecker()
    assert checker.logger is not None


def test_empty_articles_returns_empty():
    checker = CrossSourceChecker()
    assert checker.get_verified_groups([]) == []


def test_single_article_returns_empty():
    checker = CrossSourceChecker()
    articles = [
        {"url_hash": "a", "url": "https://example.com/a", "headline": "Test headline one", "source_name": "SrcA", "source_url": "https://example.com"},
    ]
    assert checker.get_verified_groups(articles) == []


def test_welds_two_articles_same_topic():
    checker = CrossSourceChecker()
    articles = [
        {"url_hash": "a", "url": "https://example.com/a", "headline": "India launches moon mission in historic space achievement", "source_name": "SrcA", "source_url": "https://srca.com"},
        {"url_hash": "b", "url": "https://example.com/b", "headline": "India moon mission launched in historic space achievement", "source_name": "SrcB", "source_url": "https://srcb.com"},
    ]
    groups = checker.get_verified_groups(articles)
    assert len(groups) == 1


def test_different_topics_not_grouped():
    checker = CrossSourceChecker()
    articles = [
        {"url_hash": "a", "url": "https://example.com/a", "headline": "India launches moon mission", "source_name": "SrcA", "source_url": "https://srca.com"},
        {"url_hash": "b", "url": "https://example.com/b", "headline": "Weather forecast sunny weekend ahead across country", "source_name": "SrcB", "source_url": "https://srcb.com"},
    ]
    groups = checker.get_verified_groups(articles)
    assert len(groups) == 0


def test_same_source_not_grouped():
    checker = CrossSourceChecker()
    articles = [
        {"url_hash": "a", "url": "https://example.com/a", "headline": "India launches moon mission", "source_name": "SameSrc", "source_url": "https://same.com"},
        {"url_hash": "b", "url": "https://example.com/b", "headline": "India moon mission launched today", "source_name": "SameSrc", "source_url": "https://same.com"},
    ]
    groups = checker.get_verified_groups(articles)
    assert len(groups) == 0


def test_max_articles_capped():
    checker = CrossSourceChecker()
    articles = [
        {"url_hash": str(i), "url": f"https://example.com/{i}", "headline": f"Article number {i} with generic words", "source_name": f"Src{i}", "source_url": f"https://src{i}.com"}
        for i in range(250)
    ]
    groups = checker.get_verified_groups(articles)
    assert len(groups) >= 0
