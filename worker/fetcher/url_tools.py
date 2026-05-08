"""
URL helpers shared by fetchers and deduplication.
Keeps duplicate tracking stable across common tracking parameters.
"""

import hashlib
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
}


def normalize_url(url: str) -> str:
    """Return a canonical URL suitable for hashing and source display."""
    if not url:
        return ""

    parsed = urlparse(url.strip())
    scheme = (parsed.scheme or "https").lower()
    netloc = parsed.netloc.lower()
    path = parsed.path.rstrip("/") or "/"

    filtered_query = []
    for key, value in parse_qsl(parsed.query, keep_blank_values=False):
        lowered = key.lower()
        if lowered in TRACKING_PARAMS or lowered.startswith(TRACKING_PREFIXES):
            continue
        filtered_query.append((key, value))

    query = urlencode(sorted(filtered_query), doseq=True)
    return urlunparse((scheme, netloc, path, "", query, ""))


def compute_url_hash(url: str) -> str:
    """Compute a stable SHA256 hash for a normalized URL."""
    return hashlib.sha256(normalize_url(url).encode()).hexdigest()
