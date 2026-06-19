

import json
import os
import re
import threading
import time

import requests

from logger.pipeline_logger import PipelineLogger
from utils.groq_pool import (
    get_groq_pool,
    get_verify_model_chain,
    reset_pool,
    save_verify_pool_stats,
)
from utils.key_pool import AllKeysExhaustedError, KeyPool

_KeyPool = KeyPool
__all__ = ["AllKeysExhaustedError", "GroqVerifier", "_KeyPool"]

class GroqVerifier:

    API_URL = "https://api.groq.com/openai/v1/chat/completions"
    MAX_RETRIES = 3
    RETRY_DELAY = 10

    EST_TOKENS_PER_CALL = 850

    _key_pool: KeyPool | None = None
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

    FALLBACK_MODELS = ["llama-3.1-8b-instant"]

    def __init__(self):
        self.logger = PipelineLogger()
        self.verify_model = os.getenv("GROQ_VERIFY_MODEL", "llama-3.3-70b-versatile")

    @classmethod
    def _ensure_pool(cls) -> KeyPool | None:

        with cls._key_pool_lock:
            if cls._key_pool is None:
                cls._key_pool = get_groq_pool()
            return cls._key_pool

    @classmethod
    def save_pool_stats(cls) -> None:

        save_verify_pool_stats()

    @classmethod
    def _reset_pool(cls) -> None:

        with cls._key_pool_lock:
            cls._key_pool = None
        reset_pool()

    def verify(self, article_group: list[dict]) -> dict:

        pool = self._ensure_pool()
        if pool is None:
            raise Exception("Groq verification API key not configured")

        user_content = self._build_prompt(article_group)
        chain = get_verify_model_chain()

        last_exhaustion: AllKeysExhaustedError | None = None
        for model_idx, model in enumerate(chain):
            if model_idx > 0:
                self.logger.log(
                    "GROQ_VERIFY",
                    f"Model fallback → {model}",
                )

            try:
                return self._verify_with_model(model, pool, user_content)
            except AllKeysExhaustedError as exc:
                last_exhaustion = exc
                if model_idx < len(chain) - 1:
                    self.logger.log(
                        "GROQ_VERIFY",
                        f"All keys exhausted on {model}; cascading to next model in chain",
                    )
                    continue
                self.logger.log(
                    "GROQ_VERIFY_ERROR",
                    f"Entire model chain exhausted: {exc}",
                )
                raise

        if last_exhaustion is not None:
            raise last_exhaustion
        raise Exception("Groq verify model chain is empty")

    def _verify_with_model(
        self, model: str, pool: KeyPool, user_content: str
    ) -> dict:

        retries_used = 0
        rotations = 0
        max_rotations = max(pool.size(), 1) + 1

        while retries_used < self.MAX_RETRIES and rotations <= max_rotations:
            try:
                slot_idx, api_key = pool.pick(
                    estimated_tokens=self.EST_TOKENS_PER_CALL,
                    model=model,
                )
            except AllKeysExhaustedError:
                raise

            stats = pool.get_stats(model=model)
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
                response = requests.post(self.API_URL, headers=headers, json=data, timeout=30)

                if response.status_code == 429:
                    retry_after = self._extract_429_wait(response)
                    pool.record_429(slot_idx, retry_after, model=model)
                    rotations += 1
                    self.logger.log(
                        "GROQ_VERIFY",
                        f"Key #{slot_idx + 1} (tier {stats[slot_idx]['tier']}) rate-limited (429), "
                        f"cooldown={retry_after}s, rotating",
                        {"retry_after_seconds": retry_after},
                    )
                    continue

                if response.status_code in (401, 403):
                    pool.mark_invalid(slot_idx)
                    rotations += 1
                    self.logger.log(
                        "GROQ_VERIFY_ERROR",
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
                    self.logger.log(
                        "GROQ_VERIFY_ERROR",
                        f"Malformed API response shape (retry {retries_used}/{self.MAX_RETRIES})",
                    )
                    continue

                try:
                    content = payload["choices"][0]["message"]["content"]
                except (KeyError, IndexError, TypeError) as e:
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

                updated = pool.get_stats(model=model)
                self.logger.log(
                    "GROQ_VERIFY",
                    f"Verified article: score={parsed.get('score', 0)}, "
                    f"model={model}, key=#{slot_idx + 1} (tier {updated[slot_idx]['tier']}), "
                    f"tokens={total_tokens}",
                    {"key_stats": updated},
                )
                return parsed

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

        try:
            pool.pick(estimated_tokens=self.EST_TOKENS_PER_CALL, model=model)
        except AllKeysExhaustedError:
            raise
        raise Exception("Max retries exceeded for Groq verification")

    def _extract_429_wait(self, response: requests.Response) -> int:

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

    def _extract_retry_delay(self, error_str: str, attempt: int) -> int:

        if "429" in error_str:
            match = re.search(r"retry in (\d+(?:\.\d+)?)s", error_str, re.IGNORECASE)
            if match:
                return int(float(match.group(1))) + 2
        if "503" in error_str:
            return 15 * (attempt + 1)
        return self.RETRY_DELAY * (attempt + 1)

    def _build_prompt(self, article_group: list[dict]) -> str:

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

        words = str(text or "").split()
        if len(words) <= limit:
            return " ".join(words)
        return " ".join(words[:limit])

    def _parse_response(self, text: str) -> dict | None:

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
