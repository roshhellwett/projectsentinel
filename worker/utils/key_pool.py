"""
Generic two-tier API key pool used by Groq, GNews, NewsAPI, etc.

Behavior:
- Keys are loaded with their original env-var number (1..N).
- Slots are grouped into tiers of TIER_SIZE (default 3): keys 1-3 = tier 1,
  4-6 = tier 2, etc. `pick()` only returns a slot from the lowest tier that
  still has at least one non-exhausted key, so secondary tiers stay dormant
  until their predecessor tier is fully 429-skipped for the current run.
- Within an active tier, the lowest-`calls_today` slot wins (load-equalizing).
- 429-skipped slots are reset automatically at calendar-date change.
- All operations are thread-safe.
"""

from __future__ import annotations

import threading
from datetime import date


class AllKeysExhaustedError(Exception):
    """Raised when every key in the pool is rate-limited for the current run."""


class KeyPool:
    """Thread-safe pool of API keys with per-key daily usage tracking and tiers."""

    TIER_SIZE = 3

    def __init__(
        self,
        keys: list[str] | list[tuple[int, str]],
        *,
        tier_size: int | None = None,
        name: str = "key_pool",
    ) -> None:
        """
        Args:
            keys: Either a flat list of API key strings (numbered by position)
                  or a list of (env_number, api_key) tuples so tier can be
                  derived from the caller's numbering.
            tier_size: Override the default tier size (3).
            name: Human-readable label used in error messages / logs.
        """
        self._lock = threading.Lock()
        self._name = name
        self._tier_size = tier_size or self.TIER_SIZE

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
                "calls_today": 0,
                "day": str(date.today()),
                "skip_this_run": False,
            }
            for num, k in normalized
        ]

    # ------------------------------------------------------------------
    # Slot management
    # ------------------------------------------------------------------

    def _refresh_slot(self, slot: dict) -> None:
        """Reset counter if the calendar date changed. Must hold the lock."""
        today = str(date.today())
        if slot["day"] != today:
            slot["calls_today"] = 0
            slot["day"] = today
            slot["skip_this_run"] = False

    def has_available(self) -> bool:
        """True if at least one key is usable right now (any tier)."""
        with self._lock:
            for slot in self._slots:
                self._refresh_slot(slot)
                if not slot["skip_this_run"] and slot["key"]:
                    return True
            return False

    def pick(self) -> tuple[int, str]:
        """Return (slot_index, key) for the best key to use next."""
        with self._lock:
            for slot in self._slots:
                self._refresh_slot(slot)

            available = [
                (i, s)
                for i, s in enumerate(self._slots)
                if not s["skip_this_run"] and s["key"]
            ]
            if not available:
                raise AllKeysExhaustedError(
                    f"All {self._name} keys are rate-limited for this run"
                )

            # Tier fallback: only consider the lowest-tier slots that still
            # have any non-exhausted key. Higher tiers stay dormant.
            min_tier = min(s["tier"] for _, s in available)
            in_tier = [(i, s) for i, s in available if s["tier"] == min_tier]
            idx, _ = min(in_tier, key=lambda x: x[1]["calls_today"])
            return idx, self._slots[idx]["key"]

    def record_success(self, idx: int) -> None:
        """Increment today's counter for the slot."""
        with self._lock:
            self._slots[idx]["calls_today"] += 1

    def mark_exhausted(self, idx: int) -> None:
        """Mark slot unusable for the rest of this run (429 received)."""
        with self._lock:
            self._slots[idx]["skip_this_run"] = True

    # ------------------------------------------------------------------
    # Inspection / persistence helpers
    # ------------------------------------------------------------------

    def get_stats(self) -> list[dict]:
        """Snapshot of all slot stats, safe for logging."""
        with self._lock:
            return [
                {
                    "key_index": i + 1,
                    "tier": s["tier"],
                    "calls_today": s["calls_today"],
                    "skip_this_run": s["skip_this_run"],
                }
                for i, s in enumerate(self._slots)
            ]

    def get_persist_stats(self) -> list[dict]:
        """Stats formatted for Supabase persistence (0-based index + day)."""
        with self._lock:
            return [
                {"index": i, "calls_today": s["calls_today"], "day": s["day"]}
                for i, s in enumerate(self._slots)
            ]

    def restore_stats(self, persisted: list[dict]) -> None:
        """Restore daily counters from persistence; only today's entries apply."""
        today = str(date.today())
        with self._lock:
            for entry in persisted:
                idx = entry.get("index")
                if not isinstance(idx, int) or not (0 <= idx < len(self._slots)):
                    continue
                if entry.get("day") != today:
                    continue
                self._slots[idx]["calls_today"] = max(
                    self._slots[idx]["calls_today"],
                    int(entry.get("calls_today", 0)),
                )

    def size(self) -> int:
        """Number of slots in the pool."""
        return len(self._slots)


def load_numbered_keys(env_get, base_name: str, max_keys: int = 6) -> list[tuple[int, str]]:
    """
    Helper to load env vars like {BASE}_1..{BASE}_N plus a legacy {BASE} fallback.

    Args:
        env_get: Callable taking (name, default) → value. Usually os.getenv.
        base_name: Prefix (e.g. 'GNEWS_API_KEY').
        max_keys: Highest suffix to consider.

    Returns:
        List of (env_number, key) tuples preserving the original numbering.
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
