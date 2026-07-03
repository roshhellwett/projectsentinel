from unittest.mock import MagicMock, patch

from cache.shared_cache import cache
from cache.keys import PUBLISH_HEADLINES, PUBLISH_HEADLINES_TTL
from publisher.supabase_publisher import SupabasePublisher


def _make_publisher_with_mock() -> tuple[SupabasePublisher, MagicMock]:
    with patch("publisher.supabase_publisher.get_supabase") as mock_get:
        mock_sb = MagicMock()
        mock_get.return_value = mock_sb
        pub = SupabasePublisher()
    return pub, mock_sb


def setup_function():
    cache.reset_state()
    cache.register(PUBLISH_HEADLINES, PUBLISH_HEADLINES_TTL)


def make_post(headline: str = "Test Headline", sources=None):
    if sources is None:
        sources = [{"url": "https://example.com/article1"}]
    return {
        "headline": headline,
        "summary": "Test summary",
        "category": "world",
        "credibility_score": 85,
        "credibility_reason": "good",
        "sources": sources,
    }


def test_publish_success():
    cache.reset_state()
    cache.register(PUBLISH_HEADLINES, PUBLISH_HEADLINES_TTL)
    pub, mock_sb = _make_publisher_with_mock()
    mock_sb.table.return_value.insert.return_value.execute.return_value = MagicMock(data=[{"id": 1}])
    result = pub.publish(make_post())
    assert result is True


def test_publish_no_supabase():
    cache.reset_state()
    cache.register(PUBLISH_HEADLINES, PUBLISH_HEADLINES_TTL)
    with patch("publisher.supabase_publisher.get_supabase", return_value=None):
        pub = SupabasePublisher()
        assert pub.publish(make_post()) is False


def test_publish_duplicate_headline():
    cache.reset_state()
    cache.register(PUBLISH_HEADLINES, PUBLISH_HEADLINES_TTL)
    pub, mock_sb = _make_publisher_with_mock()
    cache.set(PUBLISH_HEADLINES, ["Duplicate Headline"])
    mock_sb.table.return_value.insert.return_value.execute.return_value = MagicMock(data=[{"id": 1}])
    assert pub.publish(make_post("Duplicate Headline")) is False


def test_publish_duplicate_similar_headline():
    cache.reset_state()
    cache.register(PUBLISH_HEADLINES, PUBLISH_HEADLINES_TTL)
    pub, mock_sb = _make_publisher_with_mock()
    cache.set(PUBLISH_HEADLINES, ["Breaking: Major Storm Hits Coast"])
    result = pub.publish(make_post("Breaking: Major Storm hits the coast!"))
    assert result is False


def test_publish_returns_false_on_insert_failure():
    cache.reset_state()
    cache.register(PUBLISH_HEADLINES, PUBLISH_HEADLINES_TTL)
    pub, mock_sb = _make_publisher_with_mock()
    mock_sb.table.return_value.insert.return_value.execute.return_value = MagicMock(data=None)
    assert pub.publish(make_post()) is False


def test_publish_exception_fallback():
    cache.reset_state()
    cache.register(PUBLISH_HEADLINES, PUBLISH_HEADLINES_TTL)
    pub, mock_sb = _make_publisher_with_mock()
    mock_sb.table.return_value.insert.return_value.execute.side_effect = Exception("db error")
    result = pub.publish(make_post())
    assert result is False


def test_get_recent_headlines_uses_cache():
    cache.reset_state()
    cache.register(PUBLISH_HEADLINES, PUBLISH_HEADLINES_TTL)
    pub, mock_sb = _make_publisher_with_mock()
    cache.set(PUBLISH_HEADLINES, ["Existing Headline"])
    headlines = pub._get_recent_headlines()
    assert "Existing Headline" in headlines
    mock_sb.table.return_value.select.assert_not_called()


def test_get_recent_headlines_loads_from_db():
    cache.reset_state()
    cache.register(PUBLISH_HEADLINES, PUBLISH_HEADLINES_TTL)
    pub, mock_sb = _make_publisher_with_mock()
    mock_sb.table.return_value.select.return_value.order.return_value.limit.return_value.execute.return_value = MagicMock(
        data=[{"headline": "DB Headline 1"}, {"headline": "DB Headline 2"}]
    )
    headlines = pub._get_recent_headlines()
    assert headlines == ["DB Headline 1", "DB Headline 2"]


def test_get_recent_headlines_returns_stale_on_db_error():
    cache.reset_state()
    cache.register(PUBLISH_HEADLINES, PUBLISH_HEADLINES_TTL)
    cache.set(PUBLISH_HEADLINES, ["Stale Headline"])
    pub, mock_sb = _make_publisher_with_mock()
    mock_sb.table.return_value.select.return_value.order.return_value.limit.return_value.execute.side_effect = Exception("timeout")
    headlines = pub._get_recent_headlines()
    assert headlines == ["Stale Headline"]
