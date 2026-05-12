"""
Tests for multi-key tier rotation on GNewsFetcher and NewsAPIFetcher.

Covers:
- Loading 1..6 numbered keys with correct tier assignment.
- Legacy single-key fallback when no numbered variant is set.
- 429 rotation through tier 1, then activation of tier 2.
- has_quota() reflects pool state correctly.
- All keys exhausted → returns [] instead of raising.
"""

import os
from unittest.mock import MagicMock, patch

import pytest

from fetcher.gnews_fetcher import GNewsFetcher
from fetcher.newsapi_fetcher import NewsAPIFetcher
from utils.key_pool import KeyPool


# ------------------------------------------------------------------
# Shared fixtures
# ------------------------------------------------------------------


@pytest.fixture(autouse=True)
def reset_pools():
    """Class-level pools must not bleed across tests."""
    GNewsFetcher._reset_pool()
    NewsAPIFetcher._reset_pool()
    yield
    GNewsFetcher._reset_pool()
    NewsAPIFetcher._reset_pool()


def _mock_gnews_ok(headline="Some Indian Headline"):
    r = MagicMock()
    r.status_code = 200
    r.raise_for_status.return_value = None
    r.json.return_value = {
        "articles": [
            {
                "title": headline,
                "description": "A reasonably long excerpt about something important happening in India.",
                "url": "https://example.com/news/123",
                "source": {"name": "Example News"},
            }
        ]
    }
    return r


def _mock_newsapi_ok():
    r = MagicMock()
    r.status_code = 200
    r.raise_for_status.return_value = None
    r.json.return_value = {
        "status": "ok",
        "articles": [
            {
                "title": "Some Indian Headline",
                "description": "A reasonably long excerpt about a real event in India today.",
                "url": "https://example.com/news/456",
                "source": {"name": "Example News"},
            }
        ],
    }
    return r


def _mock_429():
    r = MagicMock()
    r.status_code = 429
    r.headers = {}
    r.text = ""
    return r


def _mock_newsapi_quota_error(code="rateLimited"):
    r = MagicMock()
    r.status_code = 200
    r.raise_for_status.return_value = None
    r.json.return_value = {"status": "error", "code": code, "message": "You hit the rate limit"}
    return r


# ------------------------------------------------------------------
# GNewsFetcher
# ------------------------------------------------------------------


def test_gnews_no_keys_returns_empty():
    with patch.dict(os.environ, {}, clear=True):
        GNewsFetcher._reset_pool()
        assert GNewsFetcher().fetch() == []
        assert GNewsFetcher.has_quota() is False


def test_gnews_legacy_single_key():
    with patch.dict(os.environ, {"GNEWS_API_KEY": "legacy"}, clear=True):
        GNewsFetcher._reset_pool()
        pool = GNewsFetcher._ensure_pool()
        assert pool is not None
        assert pool.size() == 1
        assert pool.get_stats()[0]["tier"] == 1


def test_gnews_six_keys_loaded_with_tiers():
    env = {f"GNEWS_API_KEY_{i}": f"gn{i}" for i in range(1, 7)}
    with patch.dict(os.environ, env, clear=True):
        GNewsFetcher._reset_pool()
        pool = GNewsFetcher._ensure_pool()
        assert pool.size() == 6
        assert [s["tier"] for s in pool.get_stats()] == [1, 1, 1, 2, 2, 2]


@patch("fetcher.gnews_fetcher.requests.Session.get")
def test_gnews_rotates_tier_one_then_succeeds_on_tier_two(mock_get):
    # 3x tier-1 429s, then a 200 on the first tier-2 key.
    mock_get.side_effect = [_mock_429(), _mock_429(), _mock_429(), _mock_gnews_ok()]

    env = {f"GNEWS_API_KEY_{i}": f"gn{i}" for i in range(1, 7)}
    with patch.dict(os.environ, env, clear=True):
        GNewsFetcher._reset_pool()
        result = GNewsFetcher().fetch()

    assert len(result) == 1
    assert mock_get.call_count == 4
    # Final (winning) call must use one of the tier-2 keys.
    last_params = mock_get.call_args_list[-1].kwargs["params"]
    assert last_params["apikey"] in {"gn4", "gn5", "gn6"}
    # First three calls used tier-1 keys.
    for call in mock_get.call_args_list[:3]:
        assert call.kwargs["params"]["apikey"] in {"gn1", "gn2", "gn3"}


@patch("fetcher.gnews_fetcher.requests.Session.get")
def test_gnews_all_exhausted_returns_empty_not_raise(mock_get):
    mock_get.return_value = _mock_429()

    env = {"GNEWS_API_KEY_1": "a", "GNEWS_API_KEY_2": "b"}
    with patch.dict(os.environ, env, clear=True):
        GNewsFetcher._reset_pool()
        result = GNewsFetcher().fetch()

    assert result == []
    # Two keys → exactly two 429s before the pool reports exhaustion.
    assert mock_get.call_count == 2
    assert GNewsFetcher.has_quota() is False


@patch("fetcher.gnews_fetcher.requests.Session.get")
def test_gnews_uses_page_size_100(mock_get):
    mock_get.return_value = _mock_gnews_ok()
    with patch.dict(os.environ, {"GNEWS_API_KEY_1": "x"}, clear=True):
        GNewsFetcher._reset_pool()
        GNewsFetcher().fetch()

    params = mock_get.call_args.kwargs["params"]
    assert params["max"] == 100


# ------------------------------------------------------------------
# NewsAPIFetcher
# ------------------------------------------------------------------


def test_newsapi_no_keys_returns_empty():
    with patch.dict(os.environ, {}, clear=True):
        NewsAPIFetcher._reset_pool()
        assert NewsAPIFetcher().fetch() == []
        assert NewsAPIFetcher.has_quota() is False


def test_newsapi_legacy_single_key():
    with patch.dict(os.environ, {"NEWSAPI_KEY": "legacy"}, clear=True):
        NewsAPIFetcher._reset_pool()
        pool = NewsAPIFetcher._ensure_pool()
        assert pool is not None
        assert pool.size() == 1


def test_newsapi_six_keys_loaded_with_tiers():
    env = {f"NEWSAPI_KEY_{i}": f"na{i}" for i in range(1, 7)}
    with patch.dict(os.environ, env, clear=True):
        NewsAPIFetcher._reset_pool()
        pool = NewsAPIFetcher._ensure_pool()
        assert pool.size() == 6
        assert [s["tier"] for s in pool.get_stats()] == [1, 1, 1, 2, 2, 2]


@patch("fetcher.newsapi_fetcher.requests.Session.get")
def test_newsapi_rotates_on_http_429(mock_get):
    mock_get.side_effect = [_mock_429(), _mock_429(), _mock_429(), _mock_newsapi_ok()]

    env = {f"NEWSAPI_KEY_{i}": f"na{i}" for i in range(1, 7)}
    with patch.dict(os.environ, env, clear=True):
        NewsAPIFetcher._reset_pool()
        result = NewsAPIFetcher().fetch()

    assert len(result) == 1
    assert mock_get.call_count == 4
    last_params = mock_get.call_args_list[-1].kwargs["params"]
    assert last_params["apiKey"] in {"na4", "na5", "na6"}


@patch("fetcher.newsapi_fetcher.requests.Session.get")
def test_newsapi_rotates_on_in_body_quota_error(mock_get):
    """status=error code=rateLimited (HTTP 200) must trigger rotation, not abort."""
    mock_get.side_effect = [
        _mock_newsapi_quota_error("rateLimited"),
        _mock_newsapi_quota_error("maximumResultsReached"),
        _mock_newsapi_ok(),
    ]

    env = {f"NEWSAPI_KEY_{i}": f"na{i}" for i in range(1, 4)}
    with patch.dict(os.environ, env, clear=True):
        NewsAPIFetcher._reset_pool()
        result = NewsAPIFetcher().fetch()

    assert len(result) == 1
    assert mock_get.call_count == 3


@patch("fetcher.newsapi_fetcher.requests.Session.get")
def test_newsapi_non_quota_error_does_not_rotate(mock_get):
    """status=error with a non-quota code should NOT mark the key exhausted."""
    err = MagicMock()
    err.status_code = 200
    err.raise_for_status.return_value = None
    err.json.return_value = {"status": "error", "code": "apiKeyInvalid", "message": "Bad key"}
    mock_get.return_value = err

    with patch.dict(os.environ, {"NEWSAPI_KEY_1": "bad"}, clear=True):
        NewsAPIFetcher._reset_pool()
        result = NewsAPIFetcher().fetch()

    assert result == []
    assert mock_get.call_count == 1  # No retry — bail immediately
    # Pool still considers the key "available" since it wasn't a quota error.
    assert NewsAPIFetcher.has_quota() is True


@patch("fetcher.newsapi_fetcher.requests.Session.get")
def test_newsapi_uses_page_size_100(mock_get):
    mock_get.return_value = _mock_newsapi_ok()
    with patch.dict(os.environ, {"NEWSAPI_KEY_1": "x"}, clear=True):
        NewsAPIFetcher._reset_pool()
        NewsAPIFetcher().fetch()
    params = mock_get.call_args.kwargs["params"]
    assert params["pageSize"] == 100


# ------------------------------------------------------------------
# Shared KeyPool sanity (separately from the Groq-flavored test file)
# ------------------------------------------------------------------


def test_keypool_has_available_reflects_exhaustion():
    pool = KeyPool([(1, "a"), (2, "b")])
    assert pool.has_available() is True
    pool.mark_exhausted(0)
    assert pool.has_available() is True
    pool.mark_exhausted(1)
    assert pool.has_available() is False
