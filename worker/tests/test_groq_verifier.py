import json
import os
from unittest.mock import MagicMock, patch

from verifier.groq_verifier import GroqVerifier


def test_verifier_init_defaults():
    with patch.dict(os.environ, {"GROQ_API_KEY_VERIFY": "test_key"}, clear=True):
        v = GroqVerifier()
        assert v.api_key == "test_key"
        assert v.verify_model == "llama3-8b-8192"


def test_verifier_init_custom_model():
    with patch.dict(
        os.environ, {"GROQ_API_KEY_VERIFY": "test_key", "GROQ_VERIFY_MODEL": "llama3-70b-8192"}, clear=True
    ):
        v = GroqVerifier()
        assert v.verify_model == "llama3-70b-8192"


def test_verifier_no_api_key():
    with patch.dict(os.environ, {}, clear=True):
        v = GroqVerifier()
        import pytest

        with pytest.raises(Exception, match="Groq verification API key not configured"):
            v.verify([{"headline": "test", "source_name": "src", "excerpt": "test"}])


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
    assert result["category"] == "politics"


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

    with patch.dict(os.environ, {"GROQ_API_KEY_VERIFY": "test_key"}, clear=True):
        v = GroqVerifier()
        result = v.verify([{"headline": "test", "source_name": "src", "excerpt": "text"}])
        assert result["score"] == 80
        assert result["category"] == "tech"


@patch("verifier.groq_verifier.time.sleep", return_value=None)
@patch("verifier.groq_verifier.requests.post")
def test_verify_retry_on_failure(mock_post, mock_sleep):
    from requests.exceptions import RequestException

    mock_post.side_effect = RequestException("503 Service Unavailable")

    with patch.dict(os.environ, {"GROQ_API_KEY_VERIFY": "test_key"}, clear=True):
        v = GroqVerifier()
        import pytest

        with pytest.raises(Exception, match="Max retries exceeded"):
            v.verify([{"headline": "test", "source_name": "src", "excerpt": "text"}])
        assert mock_post.call_count == 3
