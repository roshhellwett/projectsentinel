from writer.post_builder import PostBuilder


def test_build_valid_post():
    pb = PostBuilder()
    post = pb.build(
        headline="Test Headline",
        summary="This is a test summary for the article.",
        category="politics",
        credibility_score=75,
        credibility_reason="Multiple sources agree",
        source_articles=[
            {"source_name": "Source1", "url": "https://example1.com"},
            {"source_name": "Source2", "url": "https://example2.com"},
        ],
    )
    assert post["headline"] == "Test Headline"
    assert post["category"] == "politics"
    assert post["credibility_score"] == 75
    assert post["source_count"] == 2
    assert len(post["sources"]) == 2
    assert post["status"] == "published"
    assert "published_at" in post

def test_build_empty_headline():
    pb = PostBuilder()
    import pytest

    with pytest.raises(ValueError, match="Headline cannot be empty"):
        pb.build("", "summary", "politics", 50, "reason", [])

def test_build_empty_summary():
    pb = PostBuilder()
    import pytest

    with pytest.raises(ValueError, match="Summary cannot be empty"):
        pb.build("headline", "", "politics", 50, "reason", [])

def test_build_score_clamping():
    pb = PostBuilder()
    post = pb.build("Headline", "Summary.", "tech", 150, "reason", [{"url": "https://x.com"}])
    assert post["credibility_score"] == 100

    post = pb.build("Headline", "Summary.", "tech", -10, "reason", [{"url": "https://x.com"}])
    assert post["credibility_score"] == 0

def test_build_no_url_sources():
    pb = PostBuilder()
    post = pb.build(
        "Headline",
        "Summary.",
        "sports",
        80,
        "good",
        [{"source_name": "NoURL"}, {"source_name": "S2", "url": "https://valid.com"}],
    )
    assert len(post["sources"]) == 1
    assert "title" in post["sources"][0]
    assert post["sources"][0]["url"] == "https://valid.com"
