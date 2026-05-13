"""
Shared Groq API key pool — single 9-key, 3-tier pool used by BOTH the
verifier and the writer.

Why one pool
------------
Groq enforces RPD/RPM/TPM per `(account, model)`. Verify on llama-3.3-70b
and write on llama-3.1-8b consume completely independent budgets on the
same physical key. So we keep ONE pool of keys, but track per-(slot, model)
counters in the underlying `KeyPool`. Both subsystems benefit from:

  - 3-tier rotation (keys 1-3 primary, 4-6 secondary, 7-9 reserve)
  - Equal-pressure pick algorithm (LRU + cross-model load balancing)
  - Per-(slot, model) cooldowns and RPD/RPM/TPM admission control
  - Model fallback chains: verify cascades 70B → scout → qwen → gpt-oss
    → 8B-instant; write cascades 8B-instant → allam → 70B → ...

Daily ceiling on free tier with 6 keys:
  - Verify cascade: 5 models × 6 keys × ~1000 RPD ≈ 30k verifies (or
    +86k if the 8B safety net is reached) → effectively unlimited.
  - Write cascade:  similar headroom.

Keys are loaded from `GROQ_API_KEY_VERIFY_1..9` (preferred) or
`GROQ_API_KEY_1..9` or the legacy `GROQ_API_KEY` single-var fallback.
"""

from __future__ import annotations

import os
import threading
from typing import Optional

from utils.key_pool import KeyPool, load_numbered_keys


_pool: Optional[KeyPool] = None
_lock = threading.Lock()


MAX_GROQ_KEYS = 9  # 3 tiers × 3 keys

# Safety factor under Groq's hard caps so unexpected bursts don't trip 429.
RPD_SAFETY_FACTOR = 0.95
TPM_SAFETY_FACTOR = 0.95
RPM_HEADROOM = 2  # subtract from listed RPM (gives a small burst margin)


# ---------------------------------------------------------------------------
# Per-model limits (sourced from the user's Groq dashboard, free tier)
# Format: model_id -> (RPD, RPM, TPM)
# ---------------------------------------------------------------------------
GROQ_MODEL_LIMITS: dict[str, tuple[int, int, int]] = {
    "llama-3.3-70b-versatile":                       (1000,  30, 12000),
    "meta-llama/llama-4-scout-17b-16e-instruct":     (1000,  30, 30000),
    "qwen/qwen3-32b":                                (1000,  60,  6000),
    "openai/gpt-oss-20b":                            (1000,  30,  8000),
    "openai/gpt-oss-120b":                           (1000,  30,  8000),
    "groq/compound":                                 ( 250,  30, 70000),
    "groq/compound-mini":                            ( 250,  30, 70000),
    "allam-2-7b":                                    (7000,  30,  6000),
    "llama-3.1-8b-instant":                         (14400,  30,  6000),
}


# Verifier wants the highest-quality model first; cascade saves the
# huge-RPD 8B as the last-resort safety net.
VERIFY_MODEL_CHAIN: list[str] = [
    "llama-3.3-70b-versatile",
    "meta-llama/llama-4-scout-17b-16e-instruct",
    "qwen/qwen3-32b",
    "openai/gpt-oss-20b",
    "llama-3.1-8b-instant",
]

# Writer just needs to rephrase verified facts into 3 sentences. 8B-instant
# is the strongly preferred choice (14.4K RPD/key); fallbacks exist purely
# in case 8B somehow exhausts on every key.
WRITE_MODEL_CHAIN: list[str] = [
    "llama-3.1-8b-instant",
    "allam-2-7b",
    "openai/gpt-oss-20b",
    "llama-3.3-70b-versatile",
]


def model_limits(model: str) -> tuple[int, int, int]:
    """Raw (rpd, rpm, tpm) for `model`, with sensible fallback for unknowns."""
    return GROQ_MODEL_LIMITS.get(model, (1000, 30, 6000))


def safe_model_limits(model: str) -> tuple[int, int, int]:
    """(rpd, rpm, tpm) with safety margins applied to give burst headroom."""
    rpd, rpm, tpm = model_limits(model)
    rpd = max(1, int(rpd * RPD_SAFETY_FACTOR))
    rpm = max(1, rpm - RPM_HEADROOM)
    tpm = max(1, int(tpm * TPM_SAFETY_FACTOR))
    return rpd, rpm, tpm


def _build_model_limits_map() -> dict[str, tuple[int, int, int]]:
    """Pre-compute safe per-model limits for every model in either chain."""
    used = set(VERIFY_MODEL_CHAIN) | set(WRITE_MODEL_CHAIN) | set(GROQ_MODEL_LIMITS)
    return {m: safe_model_limits(m) for m in used}


def _load_groq_keys() -> list[tuple[int, str]]:
    """Load Groq keys: prefer GROQ_API_KEY_VERIFY_*, fall back to GROQ_API_KEY_*."""
    keys = load_numbered_keys(os.getenv, "GROQ_API_KEY_VERIFY", max_keys=MAX_GROQ_KEYS)
    if not keys:
        keys = load_numbered_keys(os.getenv, "GROQ_API_KEY", max_keys=MAX_GROQ_KEYS)
    return keys


def _env_float(name: str, default: float) -> float:
    try:
        return float(os.getenv(name, str(default)))
    except (ValueError, TypeError):
        return default


def get_verify_model_chain() -> list[str]:
    """Build the verify model fallback chain.

    Honors `GROQ_VERIFY_MODEL` as head if set (rest of default chain
    follows, deduped), or `GROQ_VERIFY_MODEL_CHAIN` (comma-separated)
    for full overrides.
    """
    return _env_chain("GROQ_VERIFY_MODEL_CHAIN", "GROQ_VERIFY_MODEL", VERIFY_MODEL_CHAIN)


def get_write_model_chain() -> list[str]:
    """Build the write model fallback chain.

    Honors `GROQ_WRITE_MODEL` as head if set, or `GROQ_WRITE_MODEL_CHAIN`
    (comma-separated) for full overrides.
    """
    return _env_chain("GROQ_WRITE_MODEL_CHAIN", "GROQ_WRITE_MODEL", WRITE_MODEL_CHAIN)


def _env_chain(chain_var: str, head_var: str, default: list[str]) -> list[str]:
    """Internal: parse a chain from env or default. Full override > head override."""
    raw = (os.getenv(chain_var) or "").strip()
    if raw:
        chain = [m.strip() for m in raw.split(",") if m.strip()]
        if chain:
            return chain
    head = (os.getenv(head_var) or "").strip()
    if not head:
        return list(default)
    out = [head]
    for m in default:
        if m != head:
            out.append(m)
    return out


def get_groq_pool() -> Optional[KeyPool]:
    """Return the shared Groq pool used by BOTH verifier and writer.

    Returns None when no Groq keys are configured.
    """
    global _pool
    with _lock:
        if _pool is None:
            keys = _load_groq_keys()
            if not keys:
                return None
            _pool = KeyPool(
                keys,
                name="Groq",
                # Defaults are only used for the hidden `_default` model
                # bucket (never picked by verifier/writer); set to a
                # generous value so any accidental no-model call still
                # works.
                rpm_limit=28,
                tpm_limit=5500,
                rpd_limit=900,
                min_delay=_env_float("GROQ_MIN_DELAY", 1.0),
                model_limits=_build_model_limits_map(),
            )
            _restore_persisted(_pool)
        return _pool


def reset_pool() -> None:
    """Reset the shared pool. For tests only."""
    global _pool
    with _lock:
        _pool = None


# Backwards-compat shims so older imports keep working ----------------------

def get_verify_pool() -> Optional[KeyPool]:
    """Deprecated alias for `get_groq_pool()` — kept for backward compat."""
    return get_groq_pool()


def get_write_pool() -> Optional[KeyPool]:
    """Deprecated alias for `get_groq_pool()` — kept for backward compat."""
    return get_groq_pool()


def reset_pools() -> None:
    """Deprecated alias for `reset_pool()` — kept for backward compat."""
    reset_pool()


# Persistence ---------------------------------------------------------------


def save_verify_pool_stats() -> None:
    """Persist per-(slot, model) counters to Supabase. Non-fatal on error."""
    with _lock:
        pool = _pool
    if pool is None:
        return
    try:
        from persistence.groq_usage import save_key_stats

        save_key_stats(pool.get_persist_stats())
    except Exception:
        pass  # Non-fatal


def _restore_persisted(pool: KeyPool) -> None:
    try:
        from persistence.groq_usage import load_key_stats

        persisted = load_key_stats()
        if persisted:
            pool.restore_stats(persisted)
    except Exception:
        pass  # Non-fatal — fresh counters are safe
