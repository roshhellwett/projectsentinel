from unittest.mock import MagicMock, patch

from cache.keys import KNOWN_CLAIMS, KNOWN_CLAIMS_TTL
from cache.shared_cache import cache
from verifier.factcheck_matcher import FactCheckMatcher


def _make_matcher_with_mock(claims: list[dict] | None = None) -> FactCheckMatcher:
    with patch("verifier.factcheck_matcher.get_supabase") as mock_get:
        mock_sb = MagicMock()
        mock_get.return_value = mock_sb
        if claims is not None:
            mock_sb.table.return_value.select.return_value.order.return_value.limit.return_value.execute.return_value = MagicMock(
                data=claims
            )
        matcher = FactCheckMatcher()
    return matcher, mock_sb


def setup_function():
    cache.reset_state()
    cache.register(KNOWN_CLAIMS, KNOWN_CLAIMS_TTL)


def test_loads_claims_on_first_call():
    cache.reset_state()
    cache.register(KNOWN_CLAIMS, KNOWN_CLAIMS_TTL)
    fake_claims = [
        {
            "claim_summary": "This is a known false claim about something important",
            "keywords": ["false", "claim"],
            "fact_check_url": "https://example.com/fact1",
        },
    ]
    matcher, mock_sb = _make_matcher_with_mock(fake_claims)
    result = matcher.is_false_claim("This is a false claim")
    assert result is True
    mock_sb.table.return_value.select.assert_called_once()


def test_does_not_reload_within_ttl():
    cache.reset_state()
    cache.register(KNOWN_CLAIMS, KNOWN_CLAIMS_TTL)
    fake_claims = [
        {"claim_summary": "Known false claim", "keywords": ["false"], "fact_check_url": "https://example.com/fact1"},
    ]
    matcher, mock_sb = _make_matcher_with_mock(fake_claims)
    matcher.is_false_claim("test")
    mock_sb.table.return_value.select.assert_called_once()
    mock_sb.reset_mock()
    matcher.is_false_claim("another test")
    mock_sb.table.return_value.select.assert_not_called()


def test_returns_false_on_empty_input():
    cache.reset_state()
    cache.register(KNOWN_CLAIMS, KNOWN_CLAIMS_TTL)
    matcher, _ = _make_matcher_with_mock([])
    assert matcher.is_false_claim("") is False
    assert matcher.is_false_claim(None) is False


def test_keyword_matching():
    cache.reset_state()
    cache.register(KNOWN_CLAIMS, KNOWN_CLAIMS_TTL)
    fake_claims = [
        {
            "claim_summary": "Donald Trump wins election fraud",
            "keywords": ["election", "fraud", "trump"],
            "fact_check_url": "https://example.com/fact1",
        },
    ]
    matcher, _ = _make_matcher_with_mock(fake_claims)
    assert matcher.is_false_claim("TRUMP wins ELECTION with FRAUD") is True
    assert matcher.is_false_claim("Weather is nice today") is False


def test_word_overlap_matching():
    cache.reset_state()
    cache.register(KNOWN_CLAIMS, KNOWN_CLAIMS_TTL)
    fake_claims = [
        {
            "claim_summary": "Government conspiracy to hide alien contact from public for decades",
            "keywords": [],
            "fact_check_url": "https://example.com/fact2",
        },
    ]
    matcher, _ = _make_matcher_with_mock(fake_claims)
    assert matcher.is_false_claim("How government hid alien contact from public") is True
    assert matcher.is_false_claim("Weather report today") is False


def test_uses_stale_cache_on_supabase_error():
    cache.reset_state()
    cache.register(KNOWN_CLAIMS, KNOWN_CLAIMS_TTL)
    with patch("verifier.factcheck_matcher.get_supabase") as mock_get:
        mock_sb = MagicMock()
        mock_get.return_value = mock_sb
        mock_sb.table.return_value.select.return_value.order.return_value.limit.return_value.execute.side_effect = (
            Exception("db down")
        )
        matcher = FactCheckMatcher()
        assert matcher.is_false_claim("test") is False


def test_no_supabase_returns_false():
    cache.reset_state()
    cache.register(KNOWN_CLAIMS, KNOWN_CLAIMS_TTL)
    with patch("verifier.factcheck_matcher.get_supabase", return_value=None):
        matcher = FactCheckMatcher()
        assert matcher.is_false_claim("test") is False
