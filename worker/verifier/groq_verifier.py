"""
Groq AI verification - uses Llama 3.3 70B for news verification.
Token-optimized: system+user split, minimal prompt, model fallback.
"""

import json
import os
import re
import time

import requests

from logger.pipeline_logger import PipelineLogger
from rate_limiter.limiter import RateLimiter


class GroqVerifier:
    """Verifies news articles using Groq API (Llama 3.3 70B)."""

    API_URL = "https://api.groq.com/openai/v1/chat/completions"
    MAX_RETRIES = 3
    RETRY_DELAY = 10
    MIN_DELAY_SECONDS = 6

    SYSTEM_PROMPT = (
        "You are a news verification assistant. "
        "Return ONLY a valid JSON object with no extra text, no markdown, no explanation.\n\n"
        "JSON format:\n"
        '{"score": <int 0-100>, "reason": "<one sentence>", '
        '"key_facts": ["<fact1>",...,"<fact5>"], '
        '"category": "<politics|business|sports|crime|science|health|tech|world>", '
        '"headline": "<short neutral headline>", '
        '"summary": "<3 neutral sentences under 80 words>"}\n\n'
        "Scoring (start at 50): +20 multi-source agree, +10 named officials/institutions, "
        "+10 specific dates/locations, +10 neutral language, "
        "-20 vague claims, -15 only anonymous sources, -10 outrage-provoking language.\n"
        "Key facts: 3-5 verified info points only. Headline and summary must use only those facts."
    )

    FALLBACK_MODELS = ["llama3-8b-8192", "llama-3.1-8b-instant"]

    def __init__(self):
        self.logger = PipelineLogger()
        self.api_key = os.getenv("GROQ_API_KEY_VERIFY", "")
        self.verify_model = os.getenv("GROQ_VERIFY_MODEL", "llama-3.3-70b-versatile")
        self.rate_limiter = RateLimiter.get_global("groq", self.MIN_DELAY_SECONDS)

    def verify(self, article_group: list[dict]) -> dict:
        """
        Verify an article group using Groq.

        Args:
            article_group: List of articles about the same event (2+ sources)

        Returns:
            Dict with score, reason, key_facts, category
        """
        if not self.api_key:
            raise Exception("Groq verification API key not configured")

        user_content = self._build_prompt(article_group)
        headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}

        for attempt in range(self.MAX_RETRIES):
            model = (
                self.verify_model
                if attempt == 0
                else self.FALLBACK_MODELS[min(attempt - 1, len(self.FALLBACK_MODELS) - 1)]
            )

            data = {
                "model": model,
                "messages": [
                    {"role": "system", "content": self.SYSTEM_PROMPT},
                    {"role": "user", "content": user_content},
                ],
                "temperature": 0.1,
                "max_tokens": 520,
                "response_format": {"type": "json_object"},
            }

            try:
                self.rate_limiter.wait_if_needed()

                response = requests.post(self.API_URL, headers=headers, json=data, timeout=30)
                response.raise_for_status()

                result = response.json()
                content = result["choices"][0]["message"]["content"]

                parsed = self._parse_response(content)
                if parsed is not None:
                    self.logger.log("GROQ_VERIFY", f"Verified article: score={parsed.get('score', 0)}, model={model}")
                    return parsed

            except requests.exceptions.RequestException as e:
                error_str = str(e)
                wait = self._extract_retry_delay(error_str, attempt)
                self.logger.log(
                    "GROQ_VERIFY", f"Request failed ({model}), attempt {attempt + 1}/{self.MAX_RETRIES}: {str(e)[:80]}"
                )
                if wait > 0:
                    self.logger.log("GROQ_VERIFY", f"Waiting {wait}s before retry")
                    time.sleep(wait)
                else:
                    time.sleep(self.RETRY_DELAY)
                continue
            except Exception as e:
                self.logger.log("GROQ_VERIFY_ERROR", f"Verification failed: {str(e)}")
                raise

        raise Exception("Max retries exceeded for Groq verification")

    def _extract_retry_delay(self, error_str: str, attempt: int) -> int:
        """Extract retry delay from error message or compute exponential backoff."""
        if "429" in error_str:
            match = re.search(r"retry in (\d+(?:\.\d+)?)s", error_str, re.IGNORECASE)
            if match:
                return int(float(match.group(1))) + 2
        if "503" in error_str:
            return 15 * (attempt + 1)
        return self.RETRY_DELAY * (attempt + 1)

    def _build_prompt(self, article_group: list[dict]) -> str:
        """Build minimal token-efficient verification prompt."""
        headline = self._trim_words(article_group[0].get("headline", ""), 18)

        excerpts = []
        for article in article_group[:3]:
            source = article.get("source_name", "Unknown")
            excerpt = self._trim_words(article.get("excerpt", ""), 45)
            if excerpt:
                excerpts.append(f"[{source}] {excerpt}")

        excerpts_text = "\n\n".join(excerpts)

        return f"Headline: {headline}\n\nSource excerpts:\n{excerpts_text}"

    def _trim_words(self, text: str, limit: int) -> str:
        """Trim prompt content by words to keep token use predictable."""
        words = str(text or "").split()
        if len(words) <= limit:
            return " ".join(words)
        return " ".join(words[:limit])

    def _parse_response(self, text: str) -> dict | None:
        """Parse Groq JSON response. Returns None on failure."""
        text = text.strip()
        text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text).strip()

        try:
            result = json.loads(text)
        except json.JSONDecodeError:
            self.logger.log("GROQ_VERIFY_ERROR", f"Failed to parse JSON: {text[:100]}")
            return None

        if not isinstance(result, dict):
            return None

        required = ["score", "reason", "key_facts", "category"]
        for field in required:
            if field not in result:
                self.logger.log("GROQ_VERIFY_ERROR", f"Missing field: {field}")
                return None

        try:
            score = int(result["score"])
            result["score"] = max(0, min(100, score))
        except (ValueError, TypeError):
            return None

        if not isinstance(result["key_facts"], list):
            result["key_facts"] = [str(result["key_facts"])]

        valid_categories = ["politics", "business", "sports", "crime", "science", "health", "tech", "world"]
        if result["category"] not in valid_categories:
            result["category"] = "politics"

        if "headline" in result:
            headline = str(result["headline"]).strip()
            result["headline"] = self._trim_words(headline, 12)

        if "summary" in result:
            summary = " ".join(str(result["summary"]).split())
            result["summary"] = summary[:420]

        return result
