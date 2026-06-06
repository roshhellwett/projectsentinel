

from urllib.parse import urlparse

BLOCKED_DOMAINS: frozenset[str] = frozenset(
    {
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
    }
)

def is_blocked_domain(url: str) -> bool:

    if not url:
        return False

    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower().removeprefix("www.")

        if not domain:
            return False

        if domain in BLOCKED_DOMAINS:
            return True

        domain_parts = domain.split(".")
        for blocked in BLOCKED_DOMAINS:
            blocked_parts = blocked.split(".")
            if len(domain_parts) > len(blocked_parts) and domain_parts[-len(blocked_parts) :] == blocked_parts:
                return True

        return False
    except Exception:
        return False
