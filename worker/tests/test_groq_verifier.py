import json
import os
from unittest.mock import MagicMock, patch

import pytest

from verifier.groq_verifier import AllKeysExhaustedError, GroqVerifier, _KeyPool


# Reset the class-level key pool before and after every test so that
# env-var patches in one test cannot bleed into the next.
@pytest.fixture(autouse=True)
def reset_key_pool():
    GroqVerifier._reset_pool()
    yield
    GroqVerifier._reset_pool()


def test_verifier_init_defaults():
    with patch.dict(os.environ, {"GROQ_API_KEY_VERIFY_1": "test_key"}, clear=True):
        v = GroqVerifier()
        assert v.verify_model == "llama-3.3-70b-versatile"


def test_verifier_init_custom_model():
    with patch.dict(
        os.environ, {"GROQ_API_KEY_VERIFY_1": "test_key", "GROQ_VERIFY_MODEL": "llama3-70b-8192"}, clear=True
    ):
        v = GroqVerifier()
        assert v.verify_model == "llama3-70b-8192"


def test_verifier_no_api_key():
    with patch.dict(os.environ, {}, clear=True):
        v = GroqVerifier()
        with pytest.raises(Exception, match="Groq verification API key not configured"):
            v.verify([{"headline": "test", "source_name": "src", "excerpt": "test"}])


def test_verifier_legacy_single_key_fallback():
    with patch.dict(os.environ, {"GROQ_API_KEY_VERIFY": "legacy_key"}, clear=True):
        v = GroqVerifier()
        pool = v._ensure_pool()
        assert pool is not None
        idx, key = pool.pick()
        assert key == "legacy_key"


def test_verifier_three_keys_loaded():
    env = {
        "GROQ_API_KEY_VERIFY_1": "key1",
        "GROQ_API_KEY_VERIFY_2": "key2",
        "GROQ_API_KEY_VERIFY_3": "key3",
    }
    with patch.dict(os.environ, env, clear=True):
        v = GroqVerifier()
        pool = v._ensure_pool()
        stats = pool.get_stats()
        assert len(stats) == 3


def test_verifier_numbered_keys_take_priority_over_legacy():
    env = {
        "GROQ_API_KEY_VERIFY_1": "numbered_key",
        "GROQ_API_KEY_VERIFY": "legacy_key",
    }
    with patch.dict(os.environ, env, clear=True):
        v = GroqVerifier()
        pool = v._ensure_pool()
        stats = pool.get_stats()
        assert len(stats) == 1
        _, key = pool.pick()
        assert key == "numbered_key"


def test_parse_response_valid():
    v = GroqVerifier()
    valid_json = json.dumps(
        {
            "score": 75,
            "reason": "Multiple sources agree on key facts",
            "key_facts": ["fact1", "fact2"],
            "category": "politics",
            "headline": "Test Headline",
            "summary": "Summary text here.",
        }
    )
    result = v._parse_response(valid_json)
    assert result is not None
    assert result["score"] == 75
    assert result["category"] == "politics"
    assert len(result["key_facts"]) == 2


def test_parse_response_invalid_json():
    v = GroqVerifier()
    result = v._parse_response("not json")
    assert result is None


def test_parse_response_missing_fields():
    v = GroqVerifier()
    result = v._parse_response(json.dumps({"score": 50}))
    assert result is None


def test_parse_response_score_clamped():
    v = GroqVerifier()
    result = v._parse_response(
        json.dumps({"score": 150, "reason": "test", "key_facts": ["fact"], "category": "politics"})
    )
    assert result["score"] == 100


def test_parse_response_invalid_category_defaults():
    v = GroqVerifier()
    result = v._parse_response(
        json.dumps({"score": 50, "reason": "test", "key_facts": ["fact"], "category": "invalid_category"})
    )
    assert result["category"] == "world"


def test_build_prompt_truncation():
    v = GroqVerifier()
    articles = [{"headline": "word " * 20, "source_name": "Source1", "excerpt": "word " * 50}]
    prompt = v._build_prompt(articles)
    assert len(prompt) > 0
    assert "Headline:" in prompt
    assert "Source1" in prompt


def test_trim_words_short():
    v = GroqVerifier()
    result = v._trim_words("hello world", 10)
    assert result == "hello world"


def test_trim_words_long():
    v = GroqVerifier()
    text = "one two three four five"
    result = v._trim_words(text, 3)
    assert result == "one two three"


@patch("verifier.groq_verifier.requests.post")
def test_verify_success(mock_post):
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "choices": [
            {
                "message": {
                    "content": json.dumps(
                        {
                            "score": 80,
                            "reason": "good",
                            "key_facts": ["fact"],
                            "category": "tech",
                            "headline": "Test",
                            "summary": "Summary.",
                        }
                    )
                }
            }
        ]
    }
    mock_response.raise_for_status.return_value = None
    mock_post.return_value = mock_response

    with patch.dict(os.environ, {"GROQ_API_KEY_VERIFY_1": "test_key"}, clear=True):
        v = GroqVerifier()
        result = v.verify([{"headline": "test", "source_name": "src", "excerpt": "text"}])
        assert result["score"] == 80
        assert result["category"] == "tech"


@patch("verifier.groq_verifier.time.sleep", return_value=None)
@patch("verifier.groq_verifier.requests.post")
def test_verify_retry_on_failure(mock_post, mock_sleep):
    from requests.exceptions import RequestException

    mock_post.side_effect = RequestException("503 Service Unavailable")

    with patch.dict(os.environ, {"GROQ_API_KEY_VERIFY_1": "test_key"}, clear=True):
        v = GroqVerifier()
        with pytest.raises(Exception, match="Max retries exceeded"):
            v.verify([{"headline": "test", "source_name": "src", "excerpt": "text"}])
        assert mock_post.call_count == 3


# ------------------------------------------------------------------
# _KeyPool unit tests
# ------------------------------------------------------------------


def test_key_pool_lowest_usage_first():
    pool = _KeyPool(["key_a", "key_b", "key_c"])
    # Artificially inflate key_a's counter
    pool.record_success(0)
    pool.record_success(0)
    idx, key = pool.pick()
    assert idx in (1, 2), "Should pick key_b or key_c (both at 0 calls)"
    assert key in ("key_b", "key_c")


def test_key_pool_exhausted_key_skipped():
    pool = _KeyPool(["key_a", "key_b"])
    pool.mark_exhausted(0)
    idx, key = pool.pick()
    assert idx == 1
    assert key == "key_b"


def test_key_pool_all_exhausted_raises():
    pool = _KeyPool(["key_a", "key_b"])
    pool.mark_exhausted(0)
    pool.mark_exhausted(1)
    with pytest.raises(AllKeysExhaustedError):
        pool.pick()


def test_key_pool_midnight_reset():
    from datetime import date, timedelta

    pool = _KeyPool(["key_a"])
    pool.record_success(0)
    pool.mark_exhausted(0)

    yesterday = str(date.today() - timedelta(days=1))
    with pool._lock:
        pool._slots[0]["day"] = yesterday

    # After pick(), the slot should be refreshed and available again
    idx, key = pool.pick()
    assert idx == 0
    assert pool.get_stats()[0]["calls_today"] == 0
    assert pool.get_stats()[0]["skip_this_run"] is False


def test_key_pool_record_success_increments():
    pool = _KeyPool(["key_a"])
    pool.record_success(0)
    pool.record_success(0)
    assert pool.get_stats()[0]["calls_today"] == 2


@patch("verifier.groq_verifier.time.sleep", return_value=None)
@patch("verifier.groq_verifier.requests.post")
def test_verify_rotates_on_429(mock_post, mock_sleep):
    """First key gets 429, second key succeeds – verify returns the result."""
    good_content = json.dumps(
        {
            "score": 72,
            "reason": "ok",
            "key_facts": ["fact"],
            "category": "politics",
            "headline": "Headline",
            "summary": "Summary.",
        }
    )

    resp_429 = MagicMock()
    resp_429.status_code = 429
    resp_429.headers = {}
    resp_429.text = ""

    resp_ok = MagicMock()
    resp_ok.status_code = 200
    resp_ok.raise_for_status.return_value = None
    resp_ok.json.return_value = {"choices": [{"message": {"content": good_content}}]}

    mock_post.side_effect = [resp_429, resp_ok]

    env = {"GROQ_API_KEY_VERIFY_1": "key1", "GROQ_API_KEY_VERIFY_2": "key2"}
    with patch.dict(os.environ, env, clear=True):
        v = GroqVerifier()
        result = v.verify([{"headline": "test", "source_name": "src", "excerpt": "text"}])

    assert result["score"] == 72
    assert mock_post.call_count == 2


@patch("verifier.groq_verifier.time.sleep", return_value=None)
@patch("verifier.groq_verifier.requests.post")
def test_verify_all_keys_429_raises(mock_post, mock_sleep):
    """All keys return 429 – should raise AllKeysExhaustedError."""
    resp_429 = MagicMock()
    resp_429.status_code = 429
    resp_429.headers = {}
    resp_429.text = ""

    mock_post.return_value = resp_429

    env = {"GROQ_API_KEY_VERIFY_1": "key1", "GROQ_API_KEY_VERIFY_2": "key2", "GROQ_API_KEY_VERIFY_3": "key3"}
    with patch.dict(os.environ, env, clear=True):
        v = GroqVerifier()
        with pytest.raises(AllKeysExhaustedError):
            v.verify([{"headline": "test", "source_name": "src", "excerpt": "text"}])
