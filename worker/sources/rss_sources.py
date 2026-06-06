

def get_rss_sources() -> list[dict[str, str]]:

    return [
        {"name": "NDTV", "url": "https://feeds.feedburner.com/ndtvnews-top-stories", "category_hint": "general"},
        {"name": "NDTV India", "url": "https://feeds.feedburner.com/ndtvnews-india-news", "category_hint": "politics"},
        {"name": "NDTV Business", "url": "https://feeds.feedburner.com/ndtvnews-business", "category_hint": "business"},
        {"name": "NDTV Sports", "url": "https://feeds.feedburner.com/ndtvsports-latest", "category_hint": "sports"},
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
        {"name": "Mint Business", "url": "https://www.livemint.com/rss/companies", "category_hint": "business"},
        {"name": "Mint Markets", "url": "https://www.livemint.com/rss/markets", "category_hint": "business"},
        {"name": "Mint Economy", "url": "https://www.livemint.com/rss/economy", "category_hint": "business"},
        {"name": "The Wire Politics", "url": "https://thewire.in/category/politics/feed", "category_hint": "politics"},
        {"name": "The Wire Science", "url": "https://thewire.in/category/science/feed", "category_hint": "science"},
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
        {"name": "India Today", "url": "https://www.indiatoday.in/rss/home", "category_hint": "general"},
        {"name": "The Print", "url": "https://theprint.in/feed/", "category_hint": "politics"},
        {"name": "WION", "url": "https://www.wionews.com/feed", "category_hint": "world"},
        {
            "name": "ESPNCricinfo",
            "url": "https://www.espncricinfo.com/rss/content/story/feeds/0.xml",
            "category_hint": "sports",
        },
        {
            "name": "Financial Chronicle",
            "url": "https://www.financialchronicle.com/feed/",
            "category_hint": "business",
        },
        {
            "name": "Swarajya",
            "url": "https://swarajyamag.com/feed",
            "category_hint": "politics",
        },
        {
            "name": "The Quint India",
            "url": "https://www.thequint.com/feed",
            "category_hint": "general",
        },
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
        {
            "name": "Greater Kashmir",
            "url": "https://www.greaterkashmir.com/feed",
            "category_hint": "politics",
        },
        {
            "name": "Jansatta",
            "url": "https://www.jansatta.com/feed/",
            "category_hint": "politics",
        },
        {
            "name": "India Science Wire",
            "url": "https://sciencewire.org/feed/",
            "category_hint": "science",
        },
        {
            "name": "Vigil Online",
            "url": "https://vigilonline.com/feed/",
            "category_hint": "politics",
        },
        {
            "name": "India Budget",
            "url": "https://www.ibhfl.com/feed/",
            "category_hint": "business",
        },
        {
            "name": "Zee News",
            "url": "https://zeenews.india.com/rss/india.xml",
            "category_hint": "politics",
        },
        {
            "name": "NewsX India",
            "url": "https://www.newsx.com/feed/",
            "category_hint": "politics",
        },
    ]
