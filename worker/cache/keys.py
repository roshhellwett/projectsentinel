"""Canonical cache keys and TTLs shared across all worker modules."""

# ── URL hashes for dedup (raw_articles) ──
KNOWN_HASHES = "known_hashes"
KNOWN_HASHES_TTL = 600  # reload every 10 min (matches pipeline interval)

# ── Recent post headlines for title dedup ──
RECENT_HEADLINES = "recent_headlines"
RECENT_HEADLINES_TTL = 600  # reload every 10 min

# ── Last 200 headlines for publish dedup ──
PUBLISH_HEADLINES = "publish_headlines"
PUBLISH_HEADLINES_TTL = 600  # reload every 10 min

# ── Known false claims ──
KNOWN_CLAIMS = "known_claims"
KNOWN_CLAIMS_TTL = 3600  # reload every hour

# ── Fact check fetcher last-run guard ──
FACTCHECK_LAST_RUN = "factcheck_last_run"
FACTCHECK_INTERVAL = 3600  # only update false claims every hour
