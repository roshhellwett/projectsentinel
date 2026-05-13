"""
Multi-tier, multi-model API key pool with token-bucket pacing.

Design
------
- N keys are loaded with their original env-var number (1..N) and grouped
  into tiers of `TIER_SIZE` (default 3): keys 1-3 = tier 1, 4-6 = tier 2,
  7-9 = tier 3.
- `pick(model)` walks tiers in ascending order; first tier with an
  immediately-eligible slot wins. Tier 2 is dormant until every tier-1
  slot is in cooldown / dead / windowed-out for the requested model.
- Each (slot, model) pair maintains its OWN state: calls_today,
  cooldown_until, rpm_window, tpm_window. This is correct because Groq
  enforces rate limits per `(account, model)`, so a key that's RPD-dead
  on llama-3.3-70b still has a fresh 14400-RPD bucket on
  llama-3.1-8b-instant.
- "Equal pressure" load distribution: within a tier, the slot with the
  smallest (last_used_at, total_calls_across_all_models, calls_today)
  tuple wins. This guarantees:
    1. Time-spread (LRU avoids stacking on the same slot).
    2. Cross-model balance (verify on slot 1 doesn't push every write to
       a different slot indefinitely).
    3. Within-model balance (tiebreak on calls_today for current model).
- 429s set per-(slot, model) `cooldown_until = now + retry_after`. Long
  retry-after values (>= DAY_DEAD_THRESHOLD) flip the per-model `day_dead`
  flag so the slot is parked for that model for the rest of the day.
- 401/403 → `mark_invalid(idx)` parks the slot GLOBALLY (revoked keys
  are bad on every model) for the rest of the process lifetime.

Backward compatibility
----------------------
- `pick()`, `record_usage(idx, tokens)`, `record_429(idx, retry_after)`
  with no model argument operate on a hidden `_default` model bucket.
  Non-Groq fetchers (GNews, NewsAPI) keep working without changes.
- `mark_exhausted(idx)` still parks the slot for the run (legacy
  fetcher-style daily cap that ignores cooldown semantics).

All operations are thread-safe.
"""

from __future__ import annotations

import threading
import time
from collections import deque
from datetime import date, datetime, timezone


_DEFAULT_MODEL = "_default"


class AllKeysExhaustedError(Exception):
    """Raised when no key is currently usable for the requested model.

    Carries `.retry_after` (seconds) when exhaustion is purely transient
    (cooldowns / window saturation) so callers can decide whether to wait.
    """

    retry_after: float = 0.0


class KeyPool:
    """Thread-safe multi-tier, multi-model key pool with token-bucket pacing."""

    TIER_SIZE = 3
    DEFAULT_RPM_LIMIT = 0          # 0 = disabled (no per-minute request cap)
    DEFAULT_TPM_LIMIT = 0          # 0 = disabled (no per-minute token cap)
    DEFAULT_RPD_LIMIT = 0          # 0 = disabled (no daily cap, just warn)
    DEFAULT_MIN_DELAY = 0.0        # No per-slot spacing by default
    DEFAULT_COOLDOWN_FALLBACK = 60 # Used when 429 has no Retry-After info
    DAY_DEAD_THRESHOLD = 1800      # retry_after >= 30min => park slot all day

    def __init__(
        self,
        keys: list[str] | list[tuple[int, str]],
        *,
        tier_size: int | None = None,
        name: str = "key_pool",
        rpm_limit: int = DEFAULT_RPM_LIMIT,
        tpm_limit: int = DEFAULT_TPM_LIMIT,
        rpd_limit: int = DEFAULT_RPD_LIMIT,
        min_delay: float = DEFAULT_MIN_DELAY,
        model_limits: dict[str, tuple[int, int, int]] | None = None,
    ) -> None:
        """
        Args:
            keys: list of keys, or list of (env_number, key) tuples.
            tier_size: keys per tier (default 3).
            name: pool name for logs.
            rpm_limit / tpm_limit / rpd_limit: default per-(slot, model)
                limits applied to any model not present in `model_limits`.
            min_delay: minimum seconds between pick() calls per slot.
            model_limits: optional `{model: (rpd, rpm, tpm)}` map. The
                pool consults this when a model-specific request comes in;
                it falls back to the default limits otherwise.
        """
        self._lock = threading.Lock()
        self._name = name
        self._tier_size = tier_size or self.TIER_SIZE
        self._default_rpm_limit = rpm_limit
        self._default_tpm_limit = tpm_limit
        self._default_rpd_limit = rpd_limit
        self._min_delay = float(min_delay)
        self._model_limits: dict[str, tuple[int, int, int]] = dict(model_limits or {})

        normalized: list[tuple[int, str]] = []
        for i, item in enumerate(keys):
            if isinstance(item, tuple):
                normalized.append(item)
            else:
                normalized.append((i + 1, item))

        self._slots: list[dict] = [
            {
                "key": k,
                "tier": ((num - 1) // self._tier_size) + 1,
                "skip_this_run": False,    # legacy fetcher-style daily parking
                "_invalid_key": False,     # 401/403 — bad on every model
                "last_used_at": 0.0,       # global LRU timestamp
                "_last_seen_day": str(date.today()),  # for slot-level daily reset
                # Lazily populated `{model: per_model_state}` dicts.
                "_per_model": {},
            }
            for num, k in normalized
        ]

    # ------------------------------------------------------------------
    # Per-model state helpers
    # ------------------------------------------------------------------

    def _limits_for(self, model: str) -> tuple[int, int, int]:
        """(rpd, rpm, tpm) for `model` — model-specific overrides or defaults."""
        if model in self._model_limits:
            return self._model_limits[model]
        return self._default_rpd_limit, self._default_rpm_limit, self._default_tpm_limit

    def _get_model_state(self, slot: dict, model: str) -> dict:
        """Return (creating if needed) the per-model substate for this slot."""
        per = slot["_per_model"]
        ms = per.get(model)
        if ms is None:
            ms = {
                "calls_today": 0,
                "tokens_today": 0,
                "day": str(date.today()),
                "day_dead": False,
                "cooldown_until": 0.0,
                "rpm_window": deque(),
                "tpm_window": deque(),
            }
            per[model] = ms
        return ms

    def _refresh_model_state(self, slot: dict, model: str, now: float) -> dict:
        """Roll daily counters at calendar change and trim 60s windows.

        Also handles slot-LEVEL daily reset for `skip_this_run` (legacy
        fetcher-style daily caps) — but only when the key is NOT marked
        invalid (401/403 → permanently dead across days too).
        """
        today = str(date.today())

        # Slot-wide daily flag reset (e.g. NewsAPI's daily quota expires).
        if slot.get("_last_seen_day") != today:
            if not slot["_invalid_key"]:
                slot["skip_this_run"] = False
            slot["_last_seen_day"] = today

        ms = self._get_model_state(slot, model)
        if ms["day"] != today:
            ms["day"] = today
            ms["calls_today"] = 0
            ms["tokens_today"] = 0
            ms["day_dead"] = False
            ms["cooldown_until"] = 0.0
            ms["rpm_window"].clear()
            ms["tpm_window"].clear()
            return ms

        cutoff = now - 60.0
        rw = ms["rpm_window"]
        while rw and rw[0] < cutoff:
            rw.popleft()
        tw = ms["tpm_window"]
        while tw and tw[0][0] < cutoff:
            tw.popleft()
        return ms

    def _total_calls_today(self, slot: dict) -> int:
        """Cross-model sum of calls_today (used for equal-pressure tiebreak)."""
        return sum(int(ms.get("calls_today", 0)) for ms in slot["_per_model"].values())

    def _is_alive(self, slot: dict, ms: dict, rpd: int) -> bool:
        """Slot is alive for THIS model right now."""
        if not slot["key"] or slot["skip_this_run"] or slot["_invalid_key"]:
            return False
        # Auto-park slot for the rest of the day once RPD is hit on this model.
        if rpd and ms["calls_today"] >= rpd:
            ms["day_dead"] = True
        return not ms["day_dead"]

    def _slot_eligible(
        self, slot: dict, ms: dict, now: float, est_tokens: int,
        rpd: int, rpm: int, tpm: int,
    ) -> bool:
        """True when this (slot, model) can accept a request right now."""
        if not self._is_alive(slot, ms, rpd):
            return False
        if ms["cooldown_until"] > now:
            return False
        if rpd and ms["calls_today"] >= rpd:
            return False
        if rpm and len(ms["rpm_window"]) >= rpm:
            return False
        if tpm:
            used = sum(t for _, t in ms["tpm_window"])
            if used + max(0, est_tokens) > tpm:
                return False
        if self._min_delay and (now - slot["last_used_at"]) < self._min_delay:
            return False
        return True

    def _slot_wait_seconds(
        self, slot: dict, ms: dict, now: float, est_tokens: int,
        rpd: int, rpm: int, tpm: int,
    ) -> float:
        """Soonest time (seconds from now) (slot, model) becomes eligible. inf if dead."""
        if not self._is_alive(slot, ms, rpd):
            return float("inf")
        waits: list[float] = []
        if ms["cooldown_until"] > now:
            waits.append(ms["cooldown_until"] - now)
        if rpm and len(ms["rpm_window"]) >= rpm and ms["rpm_window"]:
            waits.append((ms["rpm_window"][0] + 60.0) - now)
        if tpm:
            used = sum(t for _, t in ms["tpm_window"])
            if used + max(0, est_tokens) > tpm and ms["tpm_window"]:
                waits.append((ms["tpm_window"][0][0] + 60.0) - now)
        if self._min_delay:
            delta = self._min_delay - (now - slot["last_used_at"])
            if delta > 0:
                waits.append(delta)
        if rpd and ms["calls_today"] >= rpd:
            return float("inf")  # dead until tomorrow
        return max(0.0, min(waits)) if waits else 0.0

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def has_available(self, model: str = _DEFAULT_MODEL) -> bool:
        """True if at least one key is alive for `model` (not dead-for-the-day)."""
        rpd, _rpm, _tpm = self._limits_for(model)
        with self._lock:
            now = time.time()
            for s in self._slots:
                ms = self._refresh_model_state(s, model, now)
                if self._is_alive(s, ms, rpd):
                    return True
            return False

    def pick(
        self, estimated_tokens: int = 0, model: str = _DEFAULT_MODEL
    ) -> tuple[int, str]:
        """Return (slot_index, key) of the best immediately-eligible slot for `model`.

        Walks tiers in ascending order; the first tier with an eligible slot
        wins. Within that tier, the **equal-pressure** sort key is:
            (last_used_at, total_calls_today_across_all_models, calls_today_for_model)
        which gives:
          - LRU (time-spread)
          - cross-model balance (a key heavily used by verify is less likely
            picked by writer)
          - within-model balance (tiebreak on the requested model's count)

        Raises AllKeysExhaustedError when no slot in any tier is eligible.
        The exception's `.retry_after` is the soonest re-eligibility time.
        """
        rpd, rpm, tpm = self._limits_for(model)
        with self._lock:
            now = time.time()
            for s in self._slots:
                self._refresh_model_state(s, model, now)

            # Build (idx, slot, ms) for slots alive on THIS model.
            alive: list[tuple[int, dict, dict]] = []
            for i, s in enumerate(self._slots):
                ms = self._get_model_state(s, model)
                if self._is_alive(s, ms, rpd):
                    alive.append((i, s, ms))

            if not alive:
                raise AllKeysExhaustedError(
                    f"All {self._name} keys are dead for the day on model '{model}'"
                )

            min_wait = float("inf")
            for tier in sorted({s["tier"] for _, s, _ in alive}):
                tier_slots = [(i, s, ms) for i, s, ms in alive if s["tier"] == tier]
                eligible = [
                    (i, s, ms) for i, s, ms in tier_slots
                    if self._slot_eligible(s, ms, now, estimated_tokens, rpd, rpm, tpm)
                ]
                if eligible:
                    # Equal-pressure: oldest LRU first, then lowest cross-model
                    # total, then lowest current-model count.
                    eligible.sort(
                        key=lambda x: (
                            x[1]["last_used_at"],
                            self._total_calls_today(x[1]),
                            x[2]["calls_today"],
                        )
                    )
                    idx, slot, _ = eligible[0]
                    return idx, slot["key"]
                # No eligible slot in this tier; track soonest re-eligibility.
                for _, s, ms in tier_slots:
                    w = self._slot_wait_seconds(s, ms, now, estimated_tokens, rpd, rpm, tpm)
                    if w < min_wait:
                        min_wait = w

            err = AllKeysExhaustedError(
                f"All {self._name} keys throttled on '{model}' "
                f"(next available in {min_wait:.1f}s)"
            )
            err.retry_after = 0.0 if min_wait == float("inf") else min_wait
            raise err

    # ------------------------------------------------------------------
    # Usage recording
    # ------------------------------------------------------------------

    def record_usage(
        self, idx: int, tokens: int = 0, model: str = _DEFAULT_MODEL
    ) -> None:
        """Record a successful request: bumps RPM/TPM windows + daily counters."""
        with self._lock:
            now = time.time()
            slot = self._slots[idx]
            ms = self._refresh_model_state(slot, model, now)
            ms["calls_today"] += 1
            ms["tokens_today"] += max(0, int(tokens))
            ms["rpm_window"].append(now)
            if tokens > 0:
                ms["tpm_window"].append((now, int(tokens)))
            slot["last_used_at"] = now

    def record_success(self, idx: int, model: str = _DEFAULT_MODEL) -> None:
        """Legacy alias: increments call counter without token info."""
        self.record_usage(idx, 0, model)

    def record_429(
        self, idx: int, retry_after: float = 0.0, model: str = _DEFAULT_MODEL
    ) -> None:
        """Record a 429: park (slot, model) for `retry_after` seconds."""
        with self._lock:
            slot = self._slots[idx]
            ms = self._get_model_state(slot, model)
            wait = float(retry_after) if retry_after > 0 else self.DEFAULT_COOLDOWN_FALLBACK
            ms["cooldown_until"] = max(ms["cooldown_until"], time.time() + wait)
            if wait >= self.DAY_DEAD_THRESHOLD:
                ms["day_dead"] = True

    def mark_exhausted(self, idx: int) -> None:
        """Park slot for the entire run across ALL models (legacy fetcher-style)."""
        with self._lock:
            self._slots[idx]["skip_this_run"] = True

    def mark_invalid(self, idx: int) -> None:
        """Permanently disable a slot whose key is revoked/invalid (HTTP 401/403)."""
        with self._lock:
            self._slots[idx]["skip_this_run"] = True
            self._slots[idx]["_invalid_key"] = True

    # ------------------------------------------------------------------
    # Inspection / persistence helpers
    # ------------------------------------------------------------------

    def get_stats(self, model: str = _DEFAULT_MODEL) -> list[dict]:
        """Snapshot of all slot stats for the given model, safe for logging."""
        with self._lock:
            out = []
            for i, s in enumerate(self._slots):
                ms = self._get_model_state(s, model)
                out.append({
                    "key_index": i + 1,
                    "tier": s["tier"],
                    "calls_today": ms["calls_today"],
                    "skip_this_run": s["skip_this_run"] or s["_invalid_key"],
                })
            return out

    def get_persist_stats(self) -> list[dict]:
        """Stats formatted for Supabase persistence: per-(slot, model) records."""
        today = str(date.today())
        with self._lock:
            out = []
            for i, s in enumerate(self._slots):
                for model, ms in s["_per_model"].items():
                    if model == _DEFAULT_MODEL:
                        continue  # not meaningful for cross-process restore
                    if ms.get("day") != today:
                        continue
                    out.append({
                        "index": i,
                        "model": model,
                        "calls_today": int(ms.get("calls_today", 0)),
                        "day": ms["day"],
                    })
            return out

    def restore_stats(self, persisted: list[dict]) -> None:
        """Restore daily counters from persistence; only today's entries apply."""
        today = str(date.today())
        with self._lock:
            for entry in persisted:
                idx = entry.get("index")
                model = entry.get("model")
                if not isinstance(idx, int) or not (0 <= idx < len(self._slots)):
                    continue
                if not isinstance(model, str) or not model:
                    continue
                if entry.get("day") != today:
                    continue
                slot = self._slots[idx]
                ms = self._get_model_state(slot, model)
                ms["calls_today"] = max(
                    int(ms.get("calls_today", 0)),
                    int(entry.get("calls_today", 0)),
                )

    def size(self) -> int:
        """Number of slots in the pool."""
        return len(self._slots)

    # ------------------------------------------------------------------
    # Budget shaping helpers
    # ------------------------------------------------------------------

    @staticmethod
    def seconds_until_utc_reset() -> float:
        """Seconds until 00:00 UTC (Groq's free-tier RPD reset boundary)."""
        from datetime import timedelta
        now = datetime.now(timezone.utc)
        tomorrow = now.replace(hour=0, minute=0, second=0, microsecond=0)
        return (tomorrow + timedelta(days=1) - now).total_seconds()

    def remaining_daily_budget(self, model: str = _DEFAULT_MODEL) -> int:
        """Total RPD calls remaining today across all alive slots for `model`."""
        rpd, _rpm, _tpm = self._limits_for(model)
        if not rpd:
            return 0
        with self._lock:
            now = time.time()
            total = 0
            for s in self._slots:
                if s["skip_this_run"] or s["_invalid_key"]:
                    continue
                ms = self._refresh_model_state(s, model, now)
                if ms["day_dead"]:
                    continue
                total += max(0, rpd - ms["calls_today"])
            return total

    def alive_tiers(self, model: str = _DEFAULT_MODEL) -> list[int]:
        """Tiers that still have at least one alive slot for `model`."""
        rpd, _rpm, _tpm = self._limits_for(model)
        with self._lock:
            now = time.time()
            tiers: set[int] = set()
            for s in self._slots:
                ms = self._refresh_model_state(s, model, now)
                if self._is_alive(s, ms, rpd):
                    tiers.add(s["tier"])
            return sorted(tiers)

    def target_rate_per_minute(
        self, model: str = _DEFAULT_MODEL, safety_factor: float = 0.95
    ) -> float:
        """Calls/min we can sustain for `model` to evenly spread remaining
        budget until 00:00 UTC reset. 0 when RPD shaping is disabled."""
        budget = self.remaining_daily_budget(model)
        if budget <= 0:
            return 0.0
        seconds_left = max(60.0, self.seconds_until_utc_reset())
        return (budget / seconds_left) * 60.0 * safety_factor


def load_numbered_keys(env_get, base_name: str, max_keys: int = 6) -> list[tuple[int, str]]:
    """
    Helper to load env vars like {BASE}_1..{BASE}_N plus a legacy {BASE} fallback.

    Returns list of (env_number, key) tuples preserving the original numbering.
    Empty / whitespace-only values are skipped so unset slots don't pollute the pool.
    """
    keys: list[tuple[int, str]] = []
    for i in range(1, max_keys + 1):
        raw = env_get(f"{base_name}_{i}", "") or ""
        k = raw.strip()
        if k:
            keys.append((i, k))
    if not keys:
        legacy = (env_get(base_name, "") or "").strip()
        if legacy:
            keys.append((1, legacy))
    return keys
