"""
Regression tests for the RSS fetcher's auto-disable mechanism.

Verifies that:
  1. A feed survives transient blips (1-2 failures) without being parked.
  2. A feed is parked after exactly `_FAIL_THRESHOLD` consecutive failures.
  3. Parked feeds are skipped before reaching the thread pool.
  4. A successful fetch clears any prior failure streak.
  5. Park lifts after `_PARK_DURATION_SECONDS` elapses.
"""

from unittest.mock import MagicMock, patch

import pytest

from fetcher.rss_fetcher import RSSFetcher


@pytest.fixture(autouse=True)
def _isolate_health_state():
    """Ensure each test starts with a clean per-feed health state."""
    RSSFetcher._reset_health()
    yield
    RSSFetcher._reset_health()


def _make_failing_response():
    """Return a Mock that raises on raise_for_status()."""
    resp = MagicMock()
    resp.raise_for_status.side_effect = Exception("404 Client Error")
    return resp


def _make_ok_response():
    """Return a Mock that returns a valid feed with one parseable entry.

    Note: under the post-fix `_fetch_feed` contract, a 200 OK with zero
    entries is itself a failure (publishers who silently break their RSS
    return exactly this). A "true success" therefore needs at least one
    item that survives the headline length / link checks in `_parse_entry`.
    """
    resp = MagicMock()
    resp.raise_for_status.return_value = None
    resp.content = (
        b"<?xml version='1.0'?>"
        b"<rss><channel><title>t</title>"
        b"<item>"
        b"<title>Some real story headline that is long enough</title>"
        b"<link>https://example.com/some-real-story</link>"
        b"<description>desc</description>"
        b"</item>"
        b"</channel></rss>"
    )
    return resp


def _make_empty_response():
    """Return a Mock that returns 200 OK but with zero parseable entries.

    Mirrors the production failure mode for HT, The Wire, Quint, WION,
    Zee News, Jansatta, NDTV Business, etc. — HTTP succeeds, the body
    parses as a valid feed shell, but no items are present.
    """
    resp = MagicMock()
    resp.raise_for_status.return_value = None
    resp.content = b"<?xml version='1.0'?><rss><channel><title>t</title></channel></rss>"
    return resp


def test_transient_failure_does_not_park_feed():
    """A single failure should not trip the threshold (3)."""
    source = {"name": "Test", "url": "https://example.com/feed", "category_hint": "general"}
    fetcher = RSSFetcher()

    with patch("requests.Session.get", return_value=_make_failing_response()):
        fetcher._fetch_feed(source)

    assert RSSFetcher._is_parked(source["url"]) is False


def test_two_failures_still_not_parked():
    """Two consecutive failures should still leave the feed active."""
    source = {"name": "Test", "url": "https://example.com/feed", "category_hint": "general"}
    fetcher = RSSFetcher()

    with patch("requests.Session.get", return_value=_make_failing_response()):
        fetcher._fetch_feed(source)
        fetcher._fetch_feed(source)

    assert RSSFetcher._is_parked(source["url"]) is False


def test_three_consecutive_failures_parks_feed():
    """The 3rd consecutive failure should trip the threshold and park the feed."""
    source = {"name": "Test", "url": "https://example.com/feed", "category_hint": "general"}
    fetcher = RSSFetcher()

    with patch("requests.Session.get", return_value=_make_failing_response()):
        fetcher._fetch_feed(source)
        fetcher._fetch_feed(source)
        fetcher._fetch_feed(source)

    assert RSSFetcher._is_parked(source["url"]) is True


def test_success_resets_failure_streak():
    """A successful fetch in the middle of a failure streak should clear it."""
    source = {"name": "Test", "url": "https://example.com/feed", "category_hint": "general"}
    fetcher = RSSFetcher()

    with patch("requests.Session.get") as mock_get:
        # Fail, fail, succeed, fail, fail — only 2 trailing fails after the
        # success, so the feed should NOT be parked.
        mock_get.side_effect = [
            _make_failing_response(),
            _make_failing_response(),
            _make_ok_response(),
            _make_failing_response(),
            _make_failing_response(),
        ]
        for _ in range(5):
            fetcher._fetch_feed(source)

    assert RSSFetcher._is_parked(source["url"]) is False


def test_parked_feed_is_skipped_in_fetch_all():
    """fetch_all() should not submit parked feeds to the thread pool."""
    source = {"name": "Test", "url": "https://example.com/feed", "category_hint": "general"}
    fetcher = RSSFetcher()

    # Force-park the feed by tripping the threshold directly.
    RSSFetcher._record_failure(source["url"])
    RSSFetcher._record_failure(source["url"])
    RSSFetcher._record_failure(source["url"])
    assert RSSFetcher._is_parked(source["url"]) is True

    # When fetch_all runs against a source list containing only the parked
    # feed, no HTTP call should occur.
    with patch(
        "fetcher.rss_fetcher.get_rss_sources", return_value=[source]
    ), patch("requests.Session.get") as mock_get:
        result = fetcher.fetch_all()

    assert result == []
    assert mock_get.call_count == 0


def test_park_lifts_after_duration_elapses():
    """Once `_PARK_DURATION_SECONDS` has passed, the feed should be eligible again."""
    source = {"name": "Test", "url": "https://example.com/feed", "category_hint": "general"}

    # Trip the park.
    for _ in range(3):
        RSSFetcher._record_failure(source["url"])
    assert RSSFetcher._is_parked(source["url"]) is True

    # Rewind `parked_until` to the past, simulating 24h+ elapsed.
    with RSSFetcher._feed_health_lock:
        RSSFetcher._feed_health[source["url"]]["parked_until"] = 0.0

    assert RSSFetcher._is_parked(source["url"]) is False


def test_three_consecutive_empty_fetches_parks_feed():
    """200 OK with zero parsed articles must count as a failure.

    Production-driven regression: HT, The Wire, Quint, WION, Zee News,
    Jansatta, and NDTV Business all return HTTP 200 with empty bodies for
    hours. Without this contract they never trip the failure threshold
    and burn a thread-pool slot on every run forever.
    """
    source = {"name": "Test", "url": "https://example.com/feed", "category_hint": "general"}
    fetcher = RSSFetcher()

    with patch("requests.Session.get", return_value=_make_empty_response()):
        fetcher._fetch_feed(source)
        fetcher._fetch_feed(source)
        assert RSSFetcher._is_parked(source["url"]) is False  # 2 empties — still alive
        fetcher._fetch_feed(source)

    assert RSSFetcher._is_parked(source["url"]) is True


def test_real_success_resets_empty_fetch_streak():
    """A non-empty fetch must clear an in-progress empty-fetch streak."""
    source = {"name": "Test", "url": "https://example.com/feed", "category_hint": "general"}
    fetcher = RSSFetcher()

    with patch("requests.Session.get") as mock_get:
        # empty, empty, real success, empty, empty — only 2 trailing
        # empties after the success, so the feed should NOT be parked.
        mock_get.side_effect = [
            _make_empty_response(),
            _make_empty_response(),
            _make_ok_response(),
            _make_empty_response(),
            _make_empty_response(),
        ]
        for _ in range(5):
            fetcher._fetch_feed(source)

    assert RSSFetcher._is_parked(source["url"]) is False
