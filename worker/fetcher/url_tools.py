"""
URL helpers shared by fetchers and deduplication.
Keeps duplicate tracking stable across common tracking parameters.
"""

import hashlib
import re
from difflib import SequenceMatcher
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

TRACKING_PREFIXES = ("utm_",)
TRACKING_PARAMS = {
    "fbclid",
    "gclid",
    "igshid",
    "mc_cid",
    "mc_eid",
    "ref",
    "ref_src",
    "amp",
}

_AMP_PATH_SUFFIXES = re.compile(r"(/amp/?|/amp\.html?)$", re.IGNORECASE)


def normalize_url(url: str) -> str:
    """Return a canonical URL suitable for hashing and source display."""
    if not url:
        return ""

    parsed = urlparse(url.strip())
    scheme = (parsed.scheme or "https").lower()
    netloc = parsed.netloc.lower()

    # Strip AMP path suffixes (/amp, /amp/, /amp.html)
    path = _AMP_PATH_SUFFIXES.sub("", parsed.path)
    path = path.rstrip("/") or "/"

    filtered_query = []
    for key, value in parse_qsl(parsed.query, keep_blank_values=False):
        lowered = key.lower()
        if lowered in TRACKING_PARAMS or lowered.startswith(TRACKING_PREFIXES):
            continue
        filtered_query.append((key, value))

    query = urlencode(sorted(filtered_query), doseq=True)
    # Strip fragments entirely
    return urlunparse((scheme, netloc, path, "", query, ""))


def compute_url_hash(url: str) -> str:
    """Compute a stable SHA256 hash for a normalized URL."""
    return hashlib.sha256(normalize_url(url).encode()).hexdigest()


def title_similarity(a: str, b: str) -> float:
    """Return similarity ratio (0.0-1.0) between two headline strings."""
    if not a or not b:
        return 0.0
    return SequenceMatcher(None, a.lower().strip(), b.lower().strip()).ratio()


def is_duplicate_title(headline: str, recent_headlines: list[str], threshold: float = 0.80) -> bool:
    """Return True if headline is >threshold similar to any headline in recent_headlines."""
    return any(title_similarity(headline, existing) >= threshold for existing in recent_headlines)
