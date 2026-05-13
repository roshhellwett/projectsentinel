"""
Trusted Indian news RSS feed sources.

Each entry has: name, RSS URL, category hint.

The list is curated against feeds that respond with HTTP 200 in production.
Feeds that consistently return 4xx / 5xx / timeouts have been pruned. The
runtime auto-disable in `fetcher/rss_fetcher.py` will park any feed that
fails 3 runs in a row for 24 hours, so this list stays clean even when a
publisher temporarily breaks their RSS endpoint.
"""


def get_rss_sources() -> list[dict[str, str]]:
    """
    Returns list of trusted Indian news RSS feeds.

    Returns:
        List of dicts with keys: name, url, category_hint
    """
    return [
        # ── NDTV ──
        {"name": "NDTV", "url": "https://feeds.feedburner.com/ndtvnews-top-stories", "category_hint": "general"},
        {"name": "NDTV India", "url": "https://feeds.feedburner.com/ndtvnews-india-news", "category_hint": "politics"},
        {"name": "NDTV Business", "url": "https://feeds.feedburner.com/ndtvnews-business", "category_hint": "business"},
        {"name": "NDTV Sports", "url": "https://feeds.feedburner.com/ndtvsports-latest", "category_hint": "sports"},
        # ── The Hindu ──
        {
            "name": "The Hindu National",
            "url": "https://www.thehindu.com/news/national/?service=rss",
            "category_hint": "politics",
        },
        {
            "name": "The Hindu Business",
            "url": "https://www.thehindu.com/business/?service=rss",
            "category_hint": "business",
        },
        {"name": "The Hindu Sport", "url": "https://www.thehindu.com/sport/?service=rss", "category_hint": "sports"},
        {
            "name": "The Hindu Sci-Tech",
            "url": "https://www.thehindu.com/sci-tech/?service=rss",
            "category_hint": "science",
        },
        # ── Times of India ──
        {
            "name": "TOI Top Stories",
            "url": "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
            "category_hint": "general",
        },
        {
            "name": "TOI India",
            "url": "https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms",
            "category_hint": "politics",
        },
        {
            "name": "TOI Business",
            "url": "https://timesofindia.indiatimes.com/rssfeeds/1898055.cms",
            "category_hint": "business",
        },
        {
            "name": "TOI Sports",
            "url": "https://timesofindia.indiatimes.com/rssfeeds/4719148.cms",
            "category_hint": "sports",
        },
        {
            "name": "TOI Tech",
            "url": "https://timesofindia.indiatimes.com/rssfeeds/66949542.cms",
            "category_hint": "tech",
        },
        {
            "name": "TOI Entertainment",
            "url": "https://timesofindia.indiatimes.com/rssfeeds/1081479906.cms",
            "category_hint": "entertainment",
        },
        # ── Indian Express ──
        {
            "name": "Indian Express India",
            "url": "https://indianexpress.com/section/india/feed/",
            "category_hint": "politics",
        },
        {
            "name": "Indian Express World",
            "url": "https://indianexpress.com/section/world/feed/",
            "category_hint": "world",
        },
        {
            "name": "Indian Express Business",
            "url": "https://indianexpress.com/section/business/feed/",
            "category_hint": "business",
        },
        {
            "name": "Indian Express Sports",
            "url": "https://indianexpress.com/section/sports/feed/",
            "category_hint": "sports",
        },
        {
            "name": "Indian Express Tech",
            "url": "https://indianexpress.com/section/technology/feed/",
            "category_hint": "tech",
        },
        # ── Hindustan Times ── (HT feeds intermittently return empty — auto-disable handles it)
        {
            "name": "HT India",
            "url": "https://www.hindustantimes.com/rss/india/rssfeed.xml",
            "category_hint": "politics",
        },
        {
            "name": "HT Business",
            "url": "https://www.hindustantimes.com/rss/business/rssfeed.xml",
            "category_hint": "business",
        },
        {
            "name": "HT Sports",
            "url": "https://www.hindustantimes.com/rss/sports/rssfeed.xml",
            "category_hint": "sports",
        },
        {
            "name": "HT Entertainment",
            "url": "https://www.hindustantimes.com/rss/entertainment/rssfeed.xml",
            "category_hint": "entertainment",
        },
        # ── Mint ──
        {"name": "Mint Business", "url": "https://www.livemint.com/rss/companies", "category_hint": "business"},
        {"name": "Mint Markets", "url": "https://www.livemint.com/rss/markets", "category_hint": "business"},
        {"name": "Mint Economy", "url": "https://www.livemint.com/rss/economy", "category_hint": "business"},
        # ── The Wire ──
        {"name": "The Wire Politics", "url": "https://thewire.in/category/politics/feed", "category_hint": "politics"},
        {"name": "The Wire Science", "url": "https://thewire.in/category/science/feed", "category_hint": "science"},
        # ── Economic Times ──
        {
            "name": "Economic Times Top",
            "url": "https://economictimes.indiatimes.com/rssfeedstopstories.cms",
            "category_hint": "business",
        },
        {
            "name": "Economic Times Markets",
            "url": "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms",
            "category_hint": "business",
        },
        {
            "name": "Economic Times Tech",
            "url": "https://economictimes.indiatimes.com/news/tech/rssfeeds/13357270.cms",
            "category_hint": "tech",
        },
        {
            "name": "Economic Times Politics",
            "url": "https://economictimes.indiatimes.com/news/politics-and-nation/rssfeeds/1052732854.cms",
            "category_hint": "politics",
        },
        # ── India Today ──
        {"name": "India Today", "url": "https://www.indiatoday.in/rss/home", "category_hint": "general"},
        # ── The Print ──
        {"name": "The Print", "url": "https://theprint.in/feed/", "category_hint": "politics"},
        # ── WION (international news from Indian perspective) ──
        {"name": "WION", "url": "https://www.wionews.com/feed", "category_hint": "world"},
        # ── Cricket (ESPNCricinfo) ──
        {
            "name": "ESPNCricinfo",
            "url": "https://www.espncricinfo.com/rss/content/story/feeds/0.xml",
            "category_hint": "sports",
        },
        # ── Financial Chronicle ──
        {
            "name": "Financial Chronicle",
            "url": "https://www.financialchronicle.com/feed/",
            "category_hint": "business",
        },
        # ── Swarajya ──
        {
            "name": "Swarajya",
            "url": "https://swarajyamag.com/feed",
            "category_hint": "politics",
        },
        # ── The Quint ──
        {
            "name": "The Quint India",
            "url": "https://www.thequint.com/feed",
            "category_hint": "general",
        },
        # ── DNA India ──
        {
            "name": "DNA India",
            "url": "https://www.dnaindia.com/feeds/india.xml",
            "category_hint": "politics",
        },
        {
            "name": "DNA Business",
            "url": "https://www.dnaindia.com/feeds/business.xml",
            "category_hint": "business",
        },
        # ── Greater Kashmir (J&K focus) ──
        {
            "name": "Greater Kashmir",
            "url": "https://www.greaterkashmir.com/feed",
            "category_hint": "politics",
        },
        # ── Jansatta (Hindi) ──
        {
            "name": "Jansatta",
            "url": "https://www.jansatta.com/feed/",
            "category_hint": "politics",
        },
        # ── India Science Wire ──
        {
            "name": "India Science Wire",
            "url": "https://sciencewire.org/feed/",
            "category_hint": "science",
        },
        # ── Vigil Online (independent news) ──
        {
            "name": "Vigil Online",
            "url": "https://vigilonline.com/feed/",
            "category_hint": "politics",
        },
        # ── India Budget (financial) ──
        {
            "name": "India Budget",
            "url": "https://www.ibhfl.com/feed/",
            "category_hint": "business",
        },
        # ── Zee News ──
        {
            "name": "Zee News",
            "url": "https://zeenews.india.com/rss/india.xml",
            "category_hint": "politics",
        },
        # ── News X ──
        {
            "name": "NewsX India",
            "url": "https://www.newsx.com/feed/",
            "category_hint": "politics",
        },
    ]
