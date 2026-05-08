"""
Gemini 1.5 Flash verification - token-efficient AI verification.
Receives headline + excerpts only (not full articles).
"""

import json
import os
import time

from google import genai
from google.genai import types

from logger.pipeline_logger import PipelineLogger


class GeminiVerifier:
    """Verifies news articles using Gemini 1.5 Flash."""

    # Rate limiting: 6 seconds between calls = max 10 calls/min
    MIN_DELAY_SECONDS = 6
    _last_call_time = 0

    def __init__(self):
        self.logger = PipelineLogger()
        self.api_key = os.getenv("GEMINI_API_KEY", "")
        self.client = None
        self._init_client()

    def _init_client(self):
        """Initialize Gemini client."""
        if not self.api_key:
            self.logger.log("GEMINI", "No API key configured")
            return

        try:
            self.client = genai.Client(api_key=self.api_key)
            self.logger.log("GEMINI", "Client initialized")
        except Exception as e:
            self.logger.log("GEMINI_ERROR", f"Failed to initialize: {str(e)}")

    def verify(self, article_group: list[dict]) -> dict:
        """
        Verify an article group using Gemini.

        Args:
            article_group: List of articles about the same event (2+ sources)

        Returns:
            Dict with score, reason, key_facts, category
        """
        if not self.client:
            raise Exception("Gemini client not initialized")

        # Rate limiting
        self._apply_rate_limit()

        # Build minimal prompt
        prompt = self._build_prompt(article_group)

        try:
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    response = self.client.models.generate_content(
                        model="gemini-2.0-flash",
                        contents=prompt,
                        config=types.GenerateContentConfig(temperature=0.1, max_output_tokens=500),
                    )
                    break
                except Exception as e:
                    error_str = str(e)
                    if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                        # Extract retry delay from error message
                        retry_delay = 30
                        if "retry in" in error_str.lower():
                            import re

                            match = re.search(r"(\d+(?:\.\d+)?)s", error_str)
                            if match:
                                retry_delay = float(match.group(1)) + 2
                        if attempt < max_retries - 1:
                            self.logger.log(
                                "GEMINI",
                                f"Rate limited, waiting {retry_delay:.0f}s (attempt {attempt + 1}/{max_retries})",
                            )
                            time.sleep(retry_delay)
                            continue
                    elif "503" in error_str or "UNAVAILABLE" in error_str:
                        wait = 15 * (attempt + 1)
                        if attempt < max_retries - 1:
                            self.logger.log(
                                "GEMINI", f"Service unavailable, waiting {wait}s (attempt {attempt + 1}/{max_retries})"
                            )
                            time.sleep(wait)
                            continue
                    raise

            result = self._parse_response(response.text)
            self.logger.log("GEMINI", f"Verified article: score={result.get('score', 0)}")
            return result

        except Exception as e:
            self.logger.log("GEMINI_ERROR", f"Verification failed: {str(e)}")
            raise

    def _apply_rate_limit(self):
        """Enforce rate limiting between API calls."""
        import time

        current_time = time.time()
        time_since_last = current_time - GeminiVerifier._last_call_time

        if time_since_last < self.MIN_DELAY_SECONDS:
            sleep_time = self.MIN_DELAY_SECONDS - time_since_last
            time.sleep(sleep_time)

        GeminiVerifier._last_call_time = time.time()

    def _build_prompt(self, article_group: list[dict]) -> str:
        """
        Build token-efficient verification prompt.

        Args:
            article_group: List of articles

        Returns:
            Formatted prompt string
        """
        # Get headline from first article
        headline = article_group[0].get("headline", "")

        # Get excerpts from up to 3 sources
        excerpts = []
        for article in article_group[:3]:
            source = article.get("source_name", "Unknown")
            excerpt = article.get("excerpt", "")
            if excerpt:
                excerpts.append(f"[{source}] {excerpt}")

        excerpts_text = "\n\n".join(excerpts)

        system_prompt = """You are a news verification assistant.
You will receive a headline and short excerpts from multiple news sources about the same event.
Return ONLY a valid JSON object with no extra text, no markdown, no explanation.

JSON format:
{
  "score": <int 0-100>,
  "reason": "<one sentence explaining the score>",
  "key_facts": ["<fact1>", "<fact2>", "<fact3>", "<fact4>", "<fact5>"],
  "category": "<one of: politics|business|sports|crime|science|health|tech|world>"
}

Scoring rules (start at 50):
- Add 20 points if multiple reputable sources agree on key facts
- Add 10 points if named officials or institutions are cited
- Add 10 points if specific dates and locations are mentioned
- Add 10 points if language is neutral (no emotionally manipulative words)
- Subtract 20 points if claims are vague or unspecific
- Subtract 15 points if only anonymous sources are cited
- Subtract 10 points if language is designed to provoke outrage

Key facts should be 3-5 bullet points of verified information only.
Category must be one of the 8 allowed values."""

        user_message = f"Headline: {headline}\n\nSource excerpts:\n{excerpts_text}"

        return f"{system_prompt}\n\n{user_message}"

    def _parse_response(self, text: str) -> dict:
        """
        Parse Gemini JSON response.

        Args:
            text: Raw response text

        Returns:
            Parsed dict with score, reason, key_facts, category
        """
        # Clean up response (remove markdown code blocks if present)
        text = text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

        try:
            result = json.loads(text)

            # Validate required fields
            required = ["score", "reason", "key_facts", "category"]
            for field in required:
                if field not in result:
                    raise ValueError(f"Missing required field: {field}")

            # Ensure score is int 0-100
            score = int(result["score"])
            result["score"] = max(0, min(100, score))

            # Ensure key_facts is list
            if not isinstance(result["key_facts"], list):
                result["key_facts"] = [str(result["key_facts"])]

            # Validate category
            valid_categories = ["politics", "business", "sports", "crime", "science", "health", "tech", "world"]
            if result["category"] not in valid_categories:
                result["category"] = "politics"  # Default

            return result

        except json.JSONDecodeError:
            self.logger.log("GEMINI_ERROR", f"Failed to parse JSON: {text[:100]}")
            # Return a default low score response
            return {
                "score": 30,
                "reason": "Failed to parse verification result",
                "key_facts": [],
                "category": "politics",
            }
