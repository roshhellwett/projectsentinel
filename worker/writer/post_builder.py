

from datetime import UTC, datetime
from urllib.parse import urlparse

DOMAIN_TO_NAME: dict[str, str] = {
    "timesofindia.indiatimes.com": "Times of India",
    "economictimes.indiatimes.com": "The Economic Times",
    "hindustantimes.com": "Hindustan Times",
    "thehindu.com": "The Hindu",
    "ndtv.com": "NDTV",
    "indiatoday.in": "India Today",
    "indiatoday.intoday.in": "India Today",
    "news18.com": "News18",
    "firstpost.com": "Firstpost",
    "thequint.com": "The Quint",
    "scroll.in": "Scroll",
    "thewire.in": "The Wire",
    "theprint.in": "The Print",
    "livemint.com": "Mint",
    "businessstandard.com": "Business Standard",
    "financialexpress.com": "The Financial Express",
    "moneycontrol.com": "Moneycontrol",
    "zeenews.india.com": "Zee News",
    "aninews.in": "ANI",
    "pti.in": "PTI",
    "ptinews.com": "PTI",
    "bbc.com": "BBC",
    "bbc.co.uk": "BBC",
    "reuters.com": "Reuters",
    "apnews.com": "AP News",
    "deccanherald.com": "Deccan Herald",
    "telegraphindia.com": "The Telegraph",
    "tribuneindia.com": "Tribune India",
    "dailyexcelsior.com": "Daily Excelsior",
    "greaterkashmir.com": "Greater Kashmir",
    "wionews.com": "WION",
    "dnaindia.com": "DNA India",
    "mid-day.com": "Mid-Day",
    "bollywoodhungama.com": "Bollywood Hungama",
    "pinkvilla.com": "Pinkvilla",
    "filmfare.com": "Filmfare",
}

def _derive_source_title(source_name: str, url: str) -> str:

    if url:
        try:
            hostname = urlparse(url).netloc.lower().replace("www.", "")
            if hostname in DOMAIN_TO_NAME:
                return DOMAIN_TO_NAME[hostname]
            parts = hostname.split(".")
            if parts:
                return parts[0].replace("-", " ").title()
        except Exception:
            pass
    return source_name or "Unknown"

class PostBuilder:

    def build(
        self,
        headline: str,
        summary: str,
        category: str,
        credibility_score: int,
        credibility_reason: str,
        source_articles: list[dict],
    ) -> dict:

        if not headline or not headline.strip():
            raise ValueError("Headline cannot be empty")
        if not summary or not summary.strip():
            raise ValueError("Summary cannot be empty")

        sources = [
            {
                "title": _derive_source_title(article.get("source_name", ""), article.get("url", "")),
                "url": article.get("url", ""),
            }
            for article in source_articles
            if article.get("url")
        ]

        now = datetime.now(UTC).isoformat()

        return {
            "headline": headline.strip(),
            "summary": summary.strip(),
            "category": category,
            "credibility_score": max(0, min(100, credibility_score)),
            "credibility_reason": credibility_reason,
            "source_count": len(sources),
            "sources": sources,
            "fact_check_flags": [],
            "status": "published",
            "correction_note": None,
            "published_at": now,
            "updated_at": now,
        }
