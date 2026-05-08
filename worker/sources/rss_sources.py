"""
Trusted Indian news RSS feed sources.
Each entry has: name, RSS URL, category hint.
"""


def get_rss_sources() -> list[dict[str, str]]:
    """
    Returns list of trusted Indian news RSS feeds.

    Returns:
        List of dicts with keys: name, url, category_hint
    """
    return [
        # NDTV
        {"name": "NDTV", "url": "https://feeds.feedburner.com/ndtvnews-top-stories", "category_hint": "general"},
        {"name": "NDTV India", "url": "https://feeds.feedburner.com/ndtvnews-india-news", "category_hint": "politics"},
        {"name": "NDTV Business", "url": "https://feeds.feedburner.com/ndtvnews-business", "category_hint": "business"},
        {"name": "NDTV Sports", "url": "https://feeds.feedburner.com/ndtvsports-latest", "category_hint": "sports"},
        # The Hindu
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
        # Times of India
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
        # Indian Express
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
        # Hindustan Times
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
        # Mint
        {"name": "Mint Business", "url": "https://www.livemint.com/rss/companies", "category_hint": "business"},
        {"name": "Mint Markets", "url": "https://www.livemint.com/rss/markets", "category_hint": "business"},
        {"name": "Mint Economy", "url": "https://www.livemint.com/rss/economy", "category_hint": "business"},
        # The Wire
        {"name": "The Wire Politics", "url": "https://thewire.in/category/politics/feed", "category_hint": "politics"},
        {"name": "The Wire Science", "url": "https://thewire.in/category/science/feed", "category_hint": "science"},
        # Scroll.in
        {"name": "Scroll India", "url": "https://scroll.in/category/politics/feed", "category_hint": "politics"},
        {"name": "Scroll World", "url": "https://scroll.in/category/world/feed", "category_hint": "world"},
        # Deccan Herald
        {
            "name": "Deccan Herald National",
            "url": "https://www.deccanherald.com/rss/national.rss",
            "category_hint": "politics",
        },
        {
            "name": "Deccan Herald Sports",
            "url": "https://www.deccanherald.com/rss/sports.rss",
            "category_hint": "sports",
        },
        # ANI News
        {"name": "ANI News", "url": "https://aninews.in/rss/feed.xml", "category_hint": "general"},
        # Google News (India topics)
        {
            "name": "GNews India",
            "url": "https://news.google.com/rss/topics/CAAqJQgKIh9DQkFTRVFvSUwyMHZNRE55YXpBU0FtVnVHZ0pWVXlnQVAB?hl=en-IN&gl=IN&ceid=IN:en",
            "category_hint": "general",
        },
        {
            "name": "GNews Politics",
            "url": "https://news.google.com/rss/topics/CAAqJQgKIh9DQkFTRVFvSUwyMHZNRFZ4ZERJU0FtVnVHZ0pWVXlnQVAB?hl=en-IN&gl=IN&ceid=IN:en",
            "category_hint": "politics",
        },
        {
            "name": "GNews Business",
            "url": "https://news.google.com/rss/topics/CAAqJQgKIh9DQkFTRVFvSUwyMHZNREpxYkd3U0FtVnVHZ0pWVXlnQVAB?hl=en-IN&gl=IN&ceid=IN:en",
            "category_hint": "business",
        },
        {
            "name": "GNews Sports",
            "url": "https://news.google.com/rss/topics/CAAqJQgKIh9DQkFTRVFvSUwyMHZNREp0YkdVU0FtVnVHZ0pWVXlnQVAB?hl=en-IN&gl=IN&ceid=IN:en",
            "category_hint": "sports",
        },
        {
            "name": "GNews Science",
            "url": "https://news.google.com/rss/topics/CAAqJQgKIh9DQkFTRVFvSUwyMHZNRFp0Y1RjU0FtVnVHZ0pWVXlnQVAB?hl=en-IN&gl=IN&ceid=IN:en",
            "category_hint": "science",
        },
    ]
