from unittest.mock import MagicMock, PropertyMock, patch

from fetcher.rss_fetcher import RSSFetcher
from fetcher.newsapi_fetcher import NewsAPIFetcher
from fetcher.gnews_fetcher import GNewsFetcher


def test_rss_fetcher_close():
    fetcher = RSSFetcher()
    session = MagicMock()
    fetcher._local.session = session
    fetcher.close()
    session.close.assert_called_once()
    assert not hasattr(fetcher._local, "session") or fetcher._local.session is None


def test_rss_fetcher_close_no_session():
    fetcher = RSSFetcher()
    fetcher.close()


def test_newsapi_fetcher_close():
    fetcher = NewsAPIFetcher()
    with patch.object(fetcher.session, "close") as mock_close:
        fetcher.close()
        mock_close.assert_called_once()


def test_gnews_fetcher_close():
    fetcher = GNewsFetcher()
    with patch.object(fetcher.session, "close") as mock_close:
        fetcher.close()
        mock_close.assert_called_once()
