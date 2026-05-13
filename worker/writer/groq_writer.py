"""
Groq AI writer - writes neutral headlines and summaries from verified facts.

Uses the SHARED 9-key, 3-tier write pool from `utils.groq_pool` so writer
calls are spread across the same accounts as the verifier (Groq enforces
quotas per-(account, model), so verify and write each get their own RPD
budget on the same account).

Default model is `llama-3.1-8b-instant` whose free-tier RPD (≈14400) is
~14× higher than `llama-3.3-70b-versatile`. The writer's task (3-sentence
summary from given facts) does not benefit meaningfully from 70B, so 8B
is the right tradeoff to keep the worker delivering news non-stop.
"""

import json
import os
import re
import threading
import time
from typing import Optional

import requests

from logger.pipeline_logger import PipelineLogger
from utils.groq_pool import get_groq_pool, get_write_model_chain, reset_pool
from utils.key_pool import AllKeysExhaustedError, KeyPool


class GroqWriter:
    """Writes news posts using Groq API with multi-key tier rotation."""

    API_URL = "https://api.groq.com/openai/v1/chat/completions"
    MAX_RETRIES = 3
    RETRY_DELAY = 10

    # Tight estimate: ~120 input + ~150 output tokens per write call.
    EST_TOKENS_PER_CALL = 320

    _key_pool: Optional[KeyPool] = None
    _key_pool_lock = threading.Lock()

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
        # 8B-instant is the right tradeoff for headline+summary writing —
        # massively higher RPD vs. 70B, and the verifier already extracts
        # the key facts so the writer just rewords them.
        self.write_model = os.getenv("GROQ_WRITE_MODEL", "llama-3.1-8b-instant")

    # ------------------------------------------------------------------
    # Pool management
    # ------------------------------------------------------------------

    @classmethod
    def _ensure_pool(cls) -> Optional[KeyPool]:
        """Return the shared Groq pool (same one verifier uses). Lazy singleton."""
        with cls._key_pool_lock:
            if cls._key_pool is None:
                cls._key_pool = get_groq_pool()
            return cls._key_pool

    @classmethod
    def _reset_pool(cls) -> None:
        """Reset the shared Groq pool. Tests only."""
        with cls._key_pool_lock:
            cls._key_pool = None
        reset_pool()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def write(self, key_facts: list[str], category: str) -> dict:
        """
        Write neutral headline and summary from verified facts, cascading
        through the write-model chain when keys exhaust on the current model.
        """
        pool = self._ensure_pool()
        if pool is None:
            raise Exception("Groq API key not configured")

        if not key_facts:
            raise Exception("No key facts provided")

        user_content = self._build_prompt(key_facts, category)
        chain = get_write_model_chain()

        last_exhaustion: Optional[AllKeysExhaustedError] = None
        for model_idx, model in enumerate(chain):
            if model_idx > 0:
                self.logger.log(
                    "GROQ_WRITE",
                    f"Model fallback → {model}",
                )
            try:
                return self._write_with_model(model, pool, user_content)
            except AllKeysExhaustedError as exc:
                last_exhaustion = exc
                if model_idx < len(chain) - 1:
                    self.logger.log(
                        "GROQ_WRITE",
                        f"All keys exhausted on {model}; cascading to next model in chain",
                    )
                    continue
                self.logger.log(
                    "GROQ_WRITE_ERROR",
                    f"Entire model chain exhausted: {exc}",
                )
                raise

        if last_exhaustion is not None:
            raise last_exhaustion
        raise Exception("Groq write model chain is empty")

    def _write_with_model(
        self, model: str, pool: KeyPool, user_content: str
    ) -> dict:
        """Run the write loop bound to a single model."""
        retries_used = 0   # genuine failures (parse / 5xx / network)
        rotations = 0      # 429-driven key rotations
        max_rotations = max(pool.size(), 1) + 1

        while retries_used < self.MAX_RETRIES and rotations <= max_rotations:
            try:
                slot_idx, api_key = pool.pick(
                    estimated_tokens=self.EST_TOKENS_PER_CALL, model=model,
                )
            except AllKeysExhaustedError:
                # Surface to outer cascade loop.
                raise

            stats = pool.get_stats(model=model)
            self.logger.log(
                "GROQ_WRITE",
                f"Attempt retries={retries_used}/{self.MAX_RETRIES} "
                f"rotations={rotations}/{max_rotations}: key=#{slot_idx + 1} "
                f"(tier {stats[slot_idx]['tier']}), model={model}",
            )

            headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
            data = {
                "model": model,
                "messages": [
                    {"role": "system", "content": self.SYSTEM_PROMPT},
                    {"role": "user", "content": user_content},
                ],
                "temperature": 0.3,
                "max_tokens": 200,
                "response_format": {"type": "json_object"},
            }

            try:
                response = requests.post(self.API_URL, headers=headers, json=data, timeout=30)

                if response.status_code == 429:
                    retry_after = self._extract_429_wait(response)
                    pool.record_429(slot_idx, retry_after, model=model)
                    rotations += 1
                    self.logger.log(
                        "GROQ_WRITE",
                        f"Key #{slot_idx + 1} rate-limited (429), cooldown={retry_after}s, rotating",
                    )
                    continue

                # 401/403 = revoked / invalid / billing-suspended key.
                if response.status_code in (401, 403):
                    pool.mark_invalid(slot_idx)
                    rotations += 1
                    self.logger.log(
                        "GROQ_WRITE_ERROR",
                        f"Key #{slot_idx + 1} returned {response.status_code} "
                        f"(invalid/revoked), disabling and rotating",
                    )
                    continue

                response.raise_for_status()

                try:
                    payload = response.json()
                    usage = payload.get("usage", {}) or {}
                    total_tokens = int(usage.get("total_tokens") or self.EST_TOKENS_PER_CALL)
                except Exception:
                    payload = None
                    total_tokens = self.EST_TOKENS_PER_CALL
                pool.record_usage(slot_idx, total_tokens, model=model)

                if payload is None:
                    retries_used += 1
                    self.logger.log("GROQ_WRITE_ERROR", "Malformed response shape")
                    continue

                try:
                    content = payload["choices"][0]["message"]["content"]
                except (KeyError, IndexError, TypeError) as e:
                    retries_used += 1
                    self.logger.log(
                        "GROQ_WRITE_ERROR",
                        f"Malformed response (retry {retries_used}/{self.MAX_RETRIES}): {str(e)[:80]}",
                    )
                    continue

                parsed = self._parse_response(content)
                if parsed is None:
                    retries_used += 1
                    self.logger.log(
                        "GROQ_WRITE",
                        f"Unparseable response (retry {retries_used}/{self.MAX_RETRIES}) — retrying",
                    )
                    continue

                self.logger.log(
                    "GROQ_WRITE",
                    f"Wrote: {parsed.get('headline','')[:50]} (tokens={total_tokens})",
                )
                return parsed

            except requests.exceptions.RequestException as e:
                retries_used += 1
                error_str = str(e)
                if "429" in error_str:
                    wait = self._extract_retry_delay(error_str)
                    pool.record_429(slot_idx, wait, model=model)
                    rotations += 1
                    self.logger.log(
                        "GROQ_WRITE",
                        f"Network 429 on key #{slot_idx + 1}, cooldown={wait}s, rotating",
                    )
                    continue
                self.logger.log(
                    "GROQ_WRITE_ERROR",
                    f"Request failed (retry {retries_used}/{self.MAX_RETRIES}): {str(e)[:80]}",
                )
                if retries_used < self.MAX_RETRIES:
                    time.sleep(self.RETRY_DELAY)
                continue
            except Exception as e:
                self.logger.log("GROQ_WRITE_ERROR", f"Unexpected error: {str(e)}")
                raise

        # If every attempt was consumed by 429s, surface the more specific error.
        try:
            pool.pick(estimated_tokens=self.EST_TOKENS_PER_CALL, model=model)
        except AllKeysExhaustedError:
            raise
        raise Exception("Max retries exceeded for Groq writer")

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _extract_429_wait(self, response: requests.Response) -> int:
        """Extract wait seconds from a 429 response."""
        retry_after = response.headers.get("Retry-After", "").strip()
        if retry_after.isdigit():
            return int(retry_after) + 1
        body = response.text or ""
        match = re.search(r"retry in (\d+(?:\.\d+)?)s", body, re.IGNORECASE)
        if match:
            return int(float(match.group(1))) + 2
        if re.search(r"per\s*day|daily\s*limit", body, re.IGNORECASE):
            return 6 * 3600
        return 0

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

    def _parse_response(self, text: str) -> dict | None:
        """Parse Groq JSON response. Returns None on failure."""
        text = text.strip()
        text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text).strip()

        try:
            result = json.loads(text)
        except json.JSONDecodeError:
            self.logger.log("GROQ_WRITE_ERROR", f"Failed to parse JSON: {text[:100]}")
            return None

        if not isinstance(result, dict) or "headline" not in result or "summary" not in result:
            self.logger.log("GROQ_WRITE_ERROR", "Response missing headline or summary field")
            return None

        headline = str(result["headline"]).strip()
        summary = str(result["summary"]).strip()

        if not headline or not summary:
            self.logger.log("GROQ_WRITE_ERROR", "Empty headline or summary in response")
            return None

        if len(headline.split()) > 15:
            headline = " ".join(headline.split()[:12]) + "..."

        return {"headline": headline, "summary": summary[:300]}
