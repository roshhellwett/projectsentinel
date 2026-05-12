"""
Groq AI verification - uses Llama 3.3 70B for news verification.
Token-optimized: system+user split, minimal prompt, model fallback.
Multi-key rotation: up to 6 API keys arranged in two tiers of 3.
Tier 1 (keys 1-3) is used exclusively until every tier-1 key is
rate-limited for the current run; only then does tier 2 (keys 4-6)
activate. Within an active tier, the lowest-`calls_today` key wins.
Per-key daily counters and 429-aware exhaustion tracking are preserved.
"""

import json
import os
import re
import time
import threading
from typing import Optional

import requests

from logger.pipeline_logger import PipelineLogger
from rate_limiter.limiter import RateLimiter, RateLimitExceededError
from utils.key_pool import AllKeysExhaustedError, KeyPool, load_numbered_keys

# Re-exports preserved for backwards compatibility with existing call sites
# and tests that import `_KeyPool` / `AllKeysExhaustedError` from this module.
_KeyPool = KeyPool
__all__ = ["AllKeysExhaustedError", "GroqVerifier", "_KeyPool"]


class GroqVerifier:
    """Verifies news articles using Groq API (Llama 3.3 70B)."""

    API_URL = "https://api.groq.com/openai/v1/chat/completions"
    MAX_RETRIES = 3
    RETRY_DELAY = 10
    MIN_DELAY_SECONDS = 8

    # Shared key pool – class-level so concurrent pipeline runs share one counter set.
    _key_pool: Optional[KeyPool] = None
    _key_pool_lock = threading.Lock()

    SYSTEM_PROMPT = (
        "You are a news verification assistant. "
        "Return ONLY a valid JSON object with no extra text, no markdown, no explanation.\n\n"
        "JSON format:\n"
        '{"score": <int 0-100>, "reason": "<one sentence explicitly justifying the score>", '
        '"key_facts": ["<fact1>",...,"<fact5>"], '
        '"category": "<politics|business|sports|crime|science|health|tech|world|entertainment|education>", '
        '"headline": "<short neutral headline>", '
        '"summary": "<3 neutral sentences under 80 words>"}\n\n'
        "CATEGORY DEFINITIONS — choose exactly one:\n"
        "  politics: government, elections, policy, parliament, ministers, political parties\n"
        "  business: economy, markets, companies, finance, trade, industry, startups\n"
        "  sports: cricket, football, Olympics, athletes, tournaments, match results\n"
        "  crime: arrests, murders, scams, fraud, court verdicts, police investigations\n"
        "  science: research, space, discoveries, environment, climate, academic findings\n"
        "  health: medicine, diseases, hospitals, public health, fitness, nutrition\n"
        "  tech: technology, AI, software, gadgets, internet, cybersecurity, apps\n"
        "  world: international news, foreign policy, global events outside India\n"
        "  entertainment: films, music, celebrities, TV, OTT, awards, pop culture\n"
        "  education: schools, universities, exams, results, board, scholarship, students\n\n"
        "SCORING BANDS — assign a score that reflects the actual evidence quality:\n"
        "  90-100: 3+ authoritative named sources, specific data/dates/locations, official statements\n"
        "  70-89:  2 sources, some named officials, mostly factual with minor gaps\n"
        "  50-69:  vague claims, unnamed sources, speculative or unverified details\n"
        "  0-49:   single source only, emotionally loaded language, or unverifiable claims\n"
        "The 'reason' field MUST explicitly name which band applies and why.\n"
        "Key facts: 3-5 verified info points only. Headline and summary must use only those facts."
    )

    FALLBACK_MODELS = ["llama3-8b-8192", "llama-3.1-8b-instant"]

    def __init__(self):
        self.logger = PipelineLogger()
        self.verify_model = os.getenv("GROQ_VERIFY_MODEL", "llama-3.3-70b-versatile")
        # Daily cap removed – per-key counters in _KeyPool own quota tracking.
        self.rate_limiter = RateLimiter.get_global("groq_verify", self.MIN_DELAY_SECONDS)

    # ------------------------------------------------------------------
    # Class-level key pool management
    # ------------------------------------------------------------------

    @classmethod
    def _ensure_pool(cls) -> Optional[KeyPool]:
        """Lazily initialise the shared key pool. Returns None if no keys are configured."""
        with cls._key_pool_lock:
            if cls._key_pool is None:
                keys = cls._load_verify_keys()
                if keys:
                    cls._key_pool = KeyPool(keys, name="Groq verification")
                    try:
                        from persistence.groq_usage import load_key_stats
                        persisted = load_key_stats()
                        if persisted:
                            cls._key_pool.restore_stats(persisted)
                    except Exception:
                        pass  # Non-fatal: fresh counters are safe
            return cls._key_pool

    @classmethod
    def save_pool_stats(cls) -> None:
        """Persist current key counters to Supabase. Called at end of each pipeline run."""
        with cls._key_pool_lock:
            pool = cls._key_pool
        if pool is None:
            return
        try:
            from persistence.groq_usage import save_key_stats
            save_key_stats(pool.get_persist_stats())
        except Exception:
            pass  # Non-fatal

    @classmethod
    def _reset_pool(cls) -> None:
        """Reset the shared key pool. Intended for use in tests only."""
        with cls._key_pool_lock:
            cls._key_pool = None

    @staticmethod
    def _load_verify_keys() -> list[tuple[int, str]]:
        """
        Load verification API keys from environment variables.

        Priority:
          1. GROQ_API_KEY_VERIFY_1..GROQ_API_KEY_VERIFY_6
             - Slots 1-3 form tier 1 (primary, used first).
             - Slots 4-6 form tier 2 (fallback, only used after every
               tier-1 key is rate-limited for the current run).
             - Numbering may be sparse (e.g. only 1, 2, 4, 6 set); empty
               or missing slots are skipped but tier ordering is preserved
               based on the original 1-6 number.
          2. GROQ_API_KEY_VERIFY (legacy single-key fallback) — only used
             when none of the numbered variables are configured.
        """
        return load_numbered_keys(os.getenv, "GROQ_API_KEY_VERIFY", max_keys=6)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def verify(self, article_group: list[dict]) -> dict:
        """
        Verify an article group using Groq.

        Args:
            article_group: List of articles about the same event (2+ sources)

        Returns:
            Dict with score, reason, key_facts, category
        """
        pool = self._ensure_pool()
        if pool is None:
            raise Exception("Groq verification API key not configured")

        user_content = self._build_prompt(article_group)

        # 429-driven key rotations don't consume the retry budget — only
        # genuine errors do. This lets a single verify() call walk through
        # tier 1, hit 429s on every key, then seamlessly fall through to
        # tier 2 in the same call without surfacing "Max retries exceeded".
        # We cap total iterations to avoid runaway loops in pathological
        # cases (e.g. server returning malformed JSON forever).
        retries_used = 0   # counts only network / parse / 5xx failures
        rotations = 0      # counts 429-driven key rotations
        # One rotation per slot is the most we'd ever need before AllKeysExhaustedError fires.
        max_rotations = max(len(pool.get_stats()), 1) + 1

        while retries_used < self.MAX_RETRIES and rotations <= max_rotations:
            # Select the key with fewest calls today (skips 429-exhausted keys).
            try:
                slot_idx, api_key = pool.pick()
            except AllKeysExhaustedError as exc:
                self.logger.log("GROQ_VERIFY_ERROR", str(exc))
                raise

            # Only downgrade model after actual API errors, not parse failures
            model = (
                self.verify_model
                if retries_used == 0
                else self.FALLBACK_MODELS[min(retries_used - 1, len(self.FALLBACK_MODELS) - 1)]
            )

            stats = pool.get_stats()
            self.logger.log(
                "GROQ_VERIFY",
                f"Attempt retries={retries_used}/{self.MAX_RETRIES} "
                f"rotations={rotations}/{max_rotations}: key=#{slot_idx + 1} "
                f"(tier {stats[slot_idx]['tier']}), "
                f"calls_today={stats[slot_idx]['calls_today']}, model={model}",
                {"key_stats": stats},
            )

            headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
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

                # Handle 429 before raise_for_status to enable immediate key rotation.
                if response.status_code == 429:
                    pool.mark_exhausted(slot_idx)
                    rotations += 1
                    retry_after = self._extract_429_wait(response)
                    self.logger.log(
                        "GROQ_VERIFY",
                        f"Key #{slot_idx + 1} (tier {stats[slot_idx]['tier']}) rate-limited (429), "
                        f"rotating to next key",
                        {"retry_after_seconds": retry_after},
                    )
                    # Don't sleep when other keys are still available — we want to
                    # rotate immediately. Only honor Retry-After when we've burned
                    # through every key and would block on AllKeysExhaustedError anyway.
                    continue

                response.raise_for_status()
                # Count any HTTP 200 toward the daily quota — Groq bills these
                # whether or not the JSON is parseable on our side.
                pool.record_success(slot_idx)

                try:
                    result = response.json()
                    content = result["choices"][0]["message"]["content"]
                except (ValueError, KeyError, IndexError, TypeError) as e:
                    retries_used += 1
                    self.logger.log(
                        "GROQ_VERIFY_ERROR",
                        f"Malformed API response shape (retry {retries_used}/{self.MAX_RETRIES}): "
                        f"{str(e)[:80]}",
                    )
                    continue

                parsed = self._parse_response(content)
                if parsed is None:
                    retries_used += 1
                    self.logger.log(
                        "GROQ_VERIFY",
                        f"Unparseable response (retry {retries_used}/{self.MAX_RETRIES}), "
                        f"model={model} — retrying",
                    )
                    continue

                updated = pool.get_stats()
                self.logger.log(
                    "GROQ_VERIFY",
                    f"Verified article: score={parsed.get('score', 0)}, "
                    f"model={model}, key=#{slot_idx + 1} (tier {updated[slot_idx]['tier']})",
                    {"key_stats": updated},
                )
                return parsed

            except RateLimitExceededError:
                raise
            except requests.exceptions.RequestException as e:
                retries_used += 1
                error_str = str(e)
                wait = self._extract_retry_delay(error_str, retries_used - 1)
                self.logger.log(
                    "GROQ_VERIFY",
                    f"Request failed ({model}), retry {retries_used}/{self.MAX_RETRIES}: {str(e)[:80]}",
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

        # If every attempt was consumed by 429s, surface the more specific error.
        try:
            pool.pick()
        except AllKeysExhaustedError:
            raise
        raise Exception("Max retries exceeded for Groq verification")

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _extract_429_wait(self, response: requests.Response) -> int:
        """Extract wait seconds from a 429 response (Retry-After header or body text)."""
        retry_after = response.headers.get("Retry-After", "").strip()
        if retry_after.isdigit():
            return int(retry_after) + 1
        body = response.text
        match = re.search(r"retry in (\d+(?:\.\d+)?)s", body, re.IGNORECASE)
        if match:
            return int(float(match.group(1))) + 2
        return 0

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

        valid_categories = [
            "politics",
            "business",
            "sports",
            "crime",
            "education",
            "science",
            "health",
            "tech",
            "world",
            "entertainment",
        ]
        if result["category"] not in valid_categories:
            self.logger.log("GROQ_VERIFY", f"Invalid category '{result['category']}' — defaulting to 'world'")
            result["category"] = "world"

        if "headline" in result:
            headline = str(result["headline"]).strip()
            result["headline"] = self._trim_words(headline, 12)

        if "summary" in result:
            summary = " ".join(str(result["summary"]).split())
            result["summary"] = summary[:420]

        return result
