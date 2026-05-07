"""
Blocked domains list - satire, spam, and unreliable sources.
Optimized: set-based lookups, proper domain suffix matching.
"""

from typing import Set, FrozenSet
from urllib.parse import urlparse


BLOCKED_DOMAINS: FrozenSet[str] = frozenset({
    "fakingnews.firstpost.com",
    "theunrealtimes.com",
    "thefauxy.com",
    "thesatireindia.com",

    "opindia.com",
    "hindi.opindia.com",
    "tfipost.com",
    "goachronicle.com",
    "satyavijayi.com",
    "viralinindia.net",
    "bhaskarlive.in",
    "newsbred.com",

    "bollywoodlife.com",
    "pinkvilla.com",
    "filmibeat.com",
    "masala.com",

    "reddit.com",
    "twitter.com",
    "x.com",
    "facebook.com",
    "youtube.com",
    "instagram.com",
    "tiktok.com",

    "wordpress.com",
    "blogspot.com",
    "tumblr.com",
})


def is_blocked_domain(url: str) -> bool:
    """
    Check if a URL is from a blocked domain.
    Uses set-based lookups and proper suffix matching.

    Args:
        url: Article URL to check

    Returns:
        True if domain is blocked, False otherwise
    """
    if not url:
        return False

    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower().lstrip("www.")

        if domain in BLOCKED_DOMAINS:
            return True

        for blocked in BLOCKED_DOMAINS:
            if blocked.startswith("www."):
                blocked = blocked[4:]
            if domain == blocked:
                return True
            blocked_parts = blocked.split(".")
            domain_parts = domain.split(".")
            if len(domain_parts) >= len(blocked_parts):
                if domain_parts[-len(blocked_parts):] == blocked_parts:
                    return True

        return False
    except Exception:
        return False
