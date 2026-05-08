import json
import os
from unittest.mock import MagicMock, patch

from writer.groq_writer import GroqWriter


def test_writer_init_defaults():
    with patch.dict(os.environ, {"GROQ_API_KEY": "test_key"}, clear=True):
        w = GroqWriter()
        assert w.api_key == "test_key"
        assert w.write_model == "llama3-70b-8192"


def test_writer_init_custom_model():
    with patch.dict(os.environ, {"GROQ_API_KEY": "test_key", "GROQ_WRITE_MODEL": "llama3-8b-8192"}, clear=True):
        w = GroqWriter()
        assert w.write_model == "llama3-8b-8192"


def test_writer_no_api_key():
    with patch.dict(os.environ, {}, clear=True):
        w = GroqWriter()
        import pytest

        with pytest.raises(Exception, match="Groq API key not configured"):
            w.write(["fact1"], "politics")


def test_writer_no_facts():
    with patch.dict(os.environ, {"GROQ_API_KEY": "test_key"}, clear=True):
        w = GroqWriter()
        import pytest

        with pytest.raises(Exception, match="No key facts provided"):
            w.write([], "politics")


def test_parse_response_valid():
    w = GroqWriter()
    result = w._parse_response(
        json.dumps({"headline": "Test Headline", "summary": "Sentence one. Sentence two. Sentence three."})
    )
    assert result["headline"] == "Test Headline"
    assert len(result["summary"]) > 0


def test_parse_response_json_decode_error():
    w = GroqWriter()
    result = w._parse_response("not json")
    assert result["headline"] == "News Update"
    assert result["summary"] == "Details to follow."


def test_parse_response_missing_fields():
    w = GroqWriter()
    result = w._parse_response(json.dumps({"headline": "Test"}))
    assert result["headline"] == "News Update"


def test_parse_response_headline_too_long():
    w = GroqWriter()
    long_headline = "one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen"
    result = w._parse_response(json.dumps({"headline": long_headline, "summary": "Short summary."}))
    words = result["headline"].split()
    assert len(words) <= 15


def test_build_prompt():
    w = GroqWriter()
    facts = ["Fact one", "Fact two", "Fact three"]
    prompt = w._build_prompt(facts, "politics")
    assert "politics" in prompt
    assert "Fact one" in prompt
    assert "Fact two" in prompt
    assert "Fact three" in prompt


@patch("writer.groq_writer.requests.post")
def test_write_success(mock_post):
    mock_response = MagicMock()
    mock_response.json.return_value = {
        "choices": [
            {
                "message": {
                    "content": json.dumps(
                        {"headline": "Test Headline", "summary": "First sentence. Second sentence. Third sentence."}
                    )
                }
            }
        ]
    }
    mock_response.raise_for_status.return_value = None
    mock_post.return_value = mock_response

    with patch.dict(os.environ, {"GROQ_API_KEY": "test_key"}, clear=True):
        w = GroqWriter()
        result = w.write(["Verified fact one", "Verified fact two"], "politics")
        assert result["headline"] == "Test Headline"
