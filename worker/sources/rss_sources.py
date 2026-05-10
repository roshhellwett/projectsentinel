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
        # Economic Times (India's #1 financial paper)
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
        # Business Standard
        {
            "name": "Business Standard",
            "url": "https://www.business-standard.com/rss/home_page_top_stories.rss",
            "category_hint": "business",
        },
        # Moneycontrol
        {
            "name": "Moneycontrol Latest",
            "url": "https://www.moneycontrol.com/rss/latestnews.xml",
            "category_hint": "business",
        },
        # India Today
        {"name": "India Today", "url": "https://www.indiatoday.in/rss/home", "category_hint": "general"},
        # News18
        {"name": "News18 India", "url": "https://www.news18.com/rss/india.xml", "category_hint": "politics"},
        {"name": "News18 Business", "url": "https://www.news18.com/rss/business.xml", "category_hint": "business"},
        # The Print
        {"name": "The Print", "url": "https://theprint.in/feed/", "category_hint": "politics"},
        # Firstpost
        {"name": "Firstpost India", "url": "https://www.firstpost.com/rss/india.xml", "category_hint": "politics"},
        # WION (international news from Indian perspective)
        {"name": "WION", "url": "https://www.wionews.com/feed", "category_hint": "world"},
        # Entertainment / Bollywood (high demand from Indian audience)
        {
            "name": "NDTV Entertainment",
            "url": "https://feeds.feedburner.com/ndtvnews-entertainment-news",
            "category_hint": "entertainment",
        },
        {
            "name": "TOI Entertainment",
            "url": "https://timesofindia.indiatimes.com/rssfeeds/1081479906.cms",
            "category_hint": "entertainment",
        },
        {
            "name": "HT Entertainment",
            "url": "https://www.hindustantimes.com/rss/entertainment/rssfeed.xml",
            "category_hint": "entertainment",
        },
        # Cricket (ESPNCricinfo — most trusted cricket source globally)
        {
            "name": "ESPNCricinfo",
            "url": "https://www.espncricinfo.com/rss/content/story/feeds/0.xml",
            "category_hint": "sports",
        },
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
        # ===== NEW SOURCES ADDED (Premium & Trusted Indian Publications) =====
        # Financial Chronicle (leading business news)
        {
            "name": "Financial Chronicle",
            "url": "https://www.financialchronicle.com/feed/",
            "category_hint": "business",
        },
        # Outlook India (established weekly)
        {
            "name": "Outlook India",
            "url": "https://www.outlookindia.com/feed",
            "category_hint": "general",
        },
        # Rediff (veteran news portal)
        {
            "name": "Rediff India",
            "url": "https://www.rediff.com/rss/indiachannel.xml",
            "category_hint": "politics",
        },
        {
            "name": "Rediff Business",
            "url": "https://www.rediff.com/rss/business.xml",
            "category_hint": "business",
        },
        # Thehindubusinessline (business focus from The Hindu group)
        {
            "name": "Hindu Business Line",
            "url": "https://www.thehindubusinessline.com/feed/",
            "category_hint": "business",
        },
        # Indian Business Journal (emerging business media)
        {
            "name": "Indian Business Journal",
            "url": "https://www.ibjournal.com/feed/",
            "category_hint": "business",
        },
        # Frontline (news magazine from The Hindu group)
        {
            "name": "Frontline India",
            "url": "https://frontline.thehindu.com/feed/",
            "category_hint": "politics",
        },
        # Swarajya (news and opinion)
        {
            "name": "Swarajya",
            "url": "https://swarajyamag.com/feed",
            "category_hint": "politics",
        },
        # Quint (digital news platform)
        {
            "name": "The Quint India",
            "url": "https://www.thequint.com/feed",
            "category_hint": "general",
        },
        # DNA India (newspaper)
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
        # Webdunia (regional & national news)
        {
            "name": "Webdunia Hindi",
            "url": "https://hindi.webdunia.com/feed/latest-news.xml",
            "category_hint": "general",
        },
        # Greaterkashmir (Jammu & Kashmir focus)
        {
            "name": "Greater Kashmir",
            "url": "https://www.greaterkashmir.com/feed",
            "category_hint": "politics",
        },
        # Bhaskar (Hindi media)
        {
            "name": "Dainik Bhaskar",
            "url": "https://www.bhaskar.com/rss-feed/national.xml",
            "category_hint": "politics",
        },
        # Jansatta (Hindi newspaper)
        {
            "name": "Jansatta",
            "url": "https://www.jansatta.com/feed/",
            "category_hint": "politics",
        },
        # Tribune (independent newspaper from Punjab)
        {
            "name": "Tribune India",
            "url": "https://www.tribuneindia.com/feed/",
            "category_hint": "politics",
        },
        # Shiv Telegram (sports & entertainment aggregator)
        {
            "name": "Shiv Telegram Sports",
            "url": "https://www.shivtelegram.com/feed/sports.xml",
            "category_hint": "sports",
        },
        # Outlook Sports
        {
            "name": "Outlook Sports",
            "url": "https://www.outlookindia.com/sports/feed",
            "category_hint": "sports",
        },
        # India Science Wire (science & technology news)
        {
            "name": "India Science Wire",
            "url": "https://sciencewire.org/feed/",
            "category_hint": "science",
        },
        # Vigil Online (independent news)
        {
            "name": "Vigil Online",
            "url": "https://vigilonline.com/feed/",
            "category_hint": "politics",
        },
        # Observer Research Foundation (think tank content)
        {
            "name": "ORF Observer",
            "url": "https://www.orfonline.org/feed/",
            "category_hint": "politics",
        },
        # Careers 360 (education & career news)
        {
            "name": "Careers 360",
            "url": "https://www.careers360.com/feed",
            "category_hint": "education",
        },
        # India Budget Analysis (financial news)
        {
            "name": "India Budget",
            "url": "https://www.ibhfl.com/feed/",
            "category_hint": "business",
        },
        # Times Network (entertainment & general)
        {
            "name": "Times Now",
            "url": "https://www.timesnownews.com/rss/homepage.xml",
            "category_hint": "general",
        },
        # Zee News
        {
            "name": "Zee News",
            "url": "https://zeenews.india.com/rss/india.xml",
            "category_hint": "politics",
        },
        {
            "name": "Zee Business",
            "url": "https://zeebiz.indiatimes.com/rss/home.xml",
            "category_hint": "business",
        },
        # TV9 Network
        {
            "name": "TV9 Kannada",
            "url": "https://www.tv9.com/feed/latest",
            "category_hint": "general",
        },
        # Republic Media (English news channel)
        {
            "name": "Republic World",
            "url": "https://www.republicworld.com/feed/",
            "category_hint": "general",
        },
        # News X
        {
            "name": "NewsX India",
            "url": "https://www.newsx.com/feed/",
            "category_hint": "politics",
        },
    ]
