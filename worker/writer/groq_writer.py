"""
Groq AI writer - writes neutral headlines and summaries from verified facts.
Token-optimized: system+user split, minimal prompt, rate limiting.
"""

import json
import os
import re
import time

import requests

from logger.pipeline_logger import PipelineLogger
from rate_limiter.limiter import RateLimiter


class GroqWriter:
    """Writes news posts using Groq API with Llama 3.3 70B."""

    API_URL = "https://api.groq.com/openai/v1/chat/completions"
    MAX_RETRIES = 3
    RETRY_DELAY = 10
    MIN_DELAY_SECONDS = 6

    SYSTEM_PROMPT = (
        "You are a neutral news writer. "
        "Return ONLY a valid JSON object with no extra text, no markdown, no explanation.\n\n"
        'JSON format: {"headline": "<short neutral factual headline under 12 words>", '
        '"summary": "<exactly 3 sentences, under 80 words>"}\n\n'
        "Rules: Do not invent info. Headline < 12 words. Summary = exactly 3 sentences, < 80 words. "
        "Plain English, no jargon, no opinion, no bias, no sensationalism, active voice."
    )

    def __init__(self):
        self.logger = PipelineLogger()
        self.api_key = os.getenv("GROQ_API_KEY", "")
        self.write_model = os.getenv("GROQ_WRITE_MODEL", "llama-3.3-70b-versatile")
        self.rate_limiter = RateLimiter.get_global("groq", self.MIN_DELAY_SECONDS)

    def write(self, key_facts: list[str], category: str) -> dict:
        """
        Write neutral headline and summary from verified facts.

        Args:
            key_facts: List of verified facts from verifier
            category: Article category

        Returns:
            Dict with headline and summary
        """
        if not self.api_key:
            raise Exception("Groq API key not configured")

        if not key_facts:
            raise Exception("No key facts provided")

        user_content = self._build_prompt(key_facts, category)

        headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}

        data = {
            "model": self.write_model,
            "messages": [{"role": "system", "content": self.SYSTEM_PROMPT}, {"role": "user", "content": user_content}],
            "temperature": 0.3,
            "max_tokens": 200,
            "response_format": {"type": "json_object"},
        }

        for attempt in range(self.MAX_RETRIES):
            self.rate_limiter.wait_if_needed()

            try:
                response = requests.post(self.API_URL, headers=headers, json=data, timeout=30)
                response.raise_for_status()

                result = response.json()
                content = result["choices"][0]["message"]["content"]

                parsed = self._parse_response(content)
                self.logger.log("GROQ", f"Wrote article: {parsed.get('headline', '')[:50]}")
                return parsed

            except requests.exceptions.RequestException as e:
                error_str = str(e)
                if "429" in error_str:
                    wait = self._extract_retry_delay(error_str)
                    self.logger.log("GROQ", f"Rate limited, waiting {wait}s (attempt {attempt + 1}/{self.MAX_RETRIES})")
                    time.sleep(wait)
                    continue
                self.logger.log("GROQ_ERROR", f"API request failed (attempt {attempt + 1}): {str(e)[:80]}")
                if attempt < self.MAX_RETRIES - 1:
                    time.sleep(self.RETRY_DELAY)
                else:
                    raise
            except Exception as e:
                self.logger.log("GROQ_ERROR", f"Unexpected error: {str(e)}")
                raise

        raise Exception("Max retries exceeded for Groq writer")

    def _extract_retry_delay(self, error_str: str) -> int:
        """Extract retry delay from error message."""
        match = re.search(r"retry in (\d+(?:\.\d+)?)s", error_str, re.IGNORECASE)
        if match:
            return int(float(match.group(1))) + 2
        return self.RETRY_DELAY

    def _build_prompt(self, key_facts: list[str], category: str) -> str:
        """Build token-efficient writing prompt."""
        facts_text = "\n".join(f"{i + 1}. {fact}" for i, fact in enumerate(key_facts))
        return f"Category: {category}\n\nVerified facts:\n{facts_text}"

    def _parse_response(self, text: str) -> dict:
        """Parse Groq JSON response."""
        text = text.strip()
        text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text).strip()

        try:
            result = json.loads(text)
        except json.JSONDecodeError:
            self.logger.log("GROQ_ERROR", f"Failed to parse JSON: {text[:100]}")
            return {"headline": "News Update", "summary": "Details to follow."}

        if not isinstance(result, dict) or "headline" not in result or "summary" not in result:
            return {"headline": "News Update", "summary": "Details to follow."}

        headline = str(result["headline"]).strip()
        if len(headline.split()) > 15:
            headline = " ".join(headline.split()[:12]) + "..."

        summary = str(result["summary"]).strip()

        return {"headline": headline, "summary": summary[:300]}
