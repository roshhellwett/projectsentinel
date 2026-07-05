def get_rss_sources() -> list[dict[str, str]]:

    return [
        # ── English: Major Nationals ──────────────────────────
        {"name": "NDTV", "url": "https://feeds.feedburner.com/ndtvnews-top-stories", "category_hint": "general", "language": "en"},
        {"name": "NDTV India", "url": "https://feeds.feedburner.com/ndtvnews-india-news", "category_hint": "politics", "language": "en"},
        {"name": "NDTV Business", "url": "https://feeds.feedburner.com/ndtvnews-business", "category_hint": "business", "language": "en"},
        {"name": "NDTV Sports", "url": "https://feeds.feedburner.com/ndtvsports-latest", "category_hint": "sports", "language": "en"},
        {"name": "The Hindu National", "url": "https://www.thehindu.com/news/national/?service=rss", "category_hint": "politics", "language": "en"},
        {"name": "The Hindu Business", "url": "https://www.thehindu.com/business/?service=rss", "category_hint": "business", "language": "en"},
        {"name": "The Hindu Sport", "url": "https://www.thehindu.com/sport/?service=rss", "category_hint": "sports", "language": "en"},
        {"name": "The Hindu Sci-Tech", "url": "https://www.thehindu.com/sci-tech/?service=rss", "category_hint": "science", "language": "en"},
        {"name": "TOI Top Stories", "url": "https://timesofindia.indiatimes.com/rssfeedstopstories.cms", "category_hint": "general", "language": "en"},
        {"name": "TOI India", "url": "https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms", "category_hint": "politics", "language": "en"},
        {"name": "TOI Business", "url": "https://timesofindia.indiatimes.com/rssfeeds/1898055.cms", "category_hint": "business", "language": "en"},
        {"name": "TOI Sports", "url": "https://timesofindia.indiatimes.com/rssfeeds/4719148.cms", "category_hint": "sports", "language": "en"},
        {"name": "TOI Tech", "url": "https://timesofindia.indiatimes.com/rssfeeds/66949542.cms", "category_hint": "tech", "language": "en"},
        {"name": "TOI Entertainment", "url": "https://timesofindia.indiatimes.com/rssfeeds/1081479906.cms", "category_hint": "entertainment", "language": "en"},
        {"name": "Indian Express India", "url": "https://indianexpress.com/section/india/feed/", "category_hint": "politics", "language": "en"},
        {"name": "Indian Express World", "url": "https://indianexpress.com/section/world/feed/", "category_hint": "world", "language": "en"},
        {"name": "Indian Express Business", "url": "https://indianexpress.com/section/business/feed/", "category_hint": "business", "language": "en"},
        {"name": "Indian Express Sports", "url": "https://indianexpress.com/section/sports/feed/", "category_hint": "sports", "language": "en"},
        {"name": "Indian Express Tech", "url": "https://indianexpress.com/section/technology/feed/", "category_hint": "tech", "language": "en"},
        {"name": "HT India", "url": "https://www.hindustantimes.com/rss/india/rssfeed.xml", "category_hint": "politics", "language": "en"},
        {"name": "HT Business", "url": "https://www.hindustantimes.com/rss/business/rssfeed.xml", "category_hint": "business", "language": "en"},
        {"name": "HT Sports", "url": "https://www.hindustantimes.com/rss/sports/rssfeed.xml", "category_hint": "sports", "language": "en"},
        {"name": "HT Entertainment", "url": "https://www.hindustantimes.com/rss/entertainment/rssfeed.xml", "category_hint": "entertainment", "language": "en"},
        {"name": "Mint Business", "url": "https://www.livemint.com/rss/companies", "category_hint": "business", "language": "en"},
        {"name": "Mint Markets", "url": "https://www.livemint.com/rss/markets", "category_hint": "business", "language": "en"},
        {"name": "Mint Economy", "url": "https://www.livemint.com/rss/economy", "category_hint": "business", "language": "en"},
        {"name": "The Wire Politics", "url": "https://thewire.in/category/politics/feed", "category_hint": "politics", "language": "en"},
        {"name": "The Wire Science", "url": "https://thewire.in/category/science/feed", "category_hint": "science", "language": "en"},
        {"name": "Economic Times Top", "url": "https://economictimes.indiatimes.com/rssfeedstopstories.cms", "category_hint": "business", "language": "en"},
        {"name": "Economic Times Markets", "url": "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms", "category_hint": "business", "language": "en"},
        {"name": "Economic Times Tech", "url": "https://economictimes.indiatimes.com/news/tech/rssfeeds/13357270.cms", "category_hint": "tech", "language": "en"},
        {"name": "Economic Times Politics", "url": "https://economictimes.indiatimes.com/news/politics-and-nation/rssfeeds/1052732854.cms", "category_hint": "politics", "language": "en"},
        {"name": "India Today", "url": "https://www.indiatoday.in/rss/home", "category_hint": "general", "language": "en"},
        {"name": "The Print", "url": "https://theprint.in/feed/", "category_hint": "politics", "language": "en"},
        {"name": "WION", "url": "https://www.wionews.com/feed", "category_hint": "world", "language": "en"},
        {"name": "ESPNCricinfo", "url": "https://www.espncricinfo.com/rss/content/story/feeds/0.xml", "category_hint": "sports", "language": "en"},
        {"name": "Financial Chronicle", "url": "https://www.financialchronicle.com/feed/", "category_hint": "business", "language": "en"},
        {"name": "Swarajya", "url": "https://swarajyamag.com/feed", "category_hint": "politics", "language": "en"},
        {"name": "The Quint India", "url": "https://www.thequint.com/feed", "category_hint": "general", "language": "en"},
        {"name": "DNA India", "url": "https://www.dnaindia.com/feeds/india.xml", "category_hint": "politics", "language": "en"},
        {"name": "DNA Business", "url": "https://www.dnaindia.com/feeds/business.xml", "category_hint": "business", "language": "en"},
        {"name": "Greater Kashmir", "url": "https://www.greaterkashmir.com/feed", "category_hint": "politics", "language": "en"},
        {"name": "India Science Wire", "url": "https://sciencewire.org/feed/", "category_hint": "science", "language": "en"},
        {"name": "Zee News", "url": "https://zeenews.india.com/rss/india.xml", "category_hint": "politics", "language": "en"},
        {"name": "NewsX India", "url": "https://www.newsx.com/feed/", "category_hint": "politics", "language": "en"},

        # ── English: Regional & Niche ────────────────────────
        {"name": "Deccan Herald", "url": "https://www.deccanherald.com/feed", "category_hint": "general", "language": "en"},
        {"name": "The Telegraph", "url": "https://www.telegraphindia.com/feed", "category_hint": "general", "language": "en"},
        {"name": "The Assam Tribune", "url": "https://assamtribune.com/feed", "category_hint": "general", "language": "en"},
        {"name": "Scroll.in", "url": "https://scroll.in/feed", "category_hint": "general", "language": "en"},
        {"name": "Firstpost", "url": "https://www.firstpost.com/feed", "category_hint": "general", "language": "en"},
        {"name": "The News Minute", "url": "https://www.thenewsminute.com/feed", "category_hint": "general", "language": "en"},
        {"name": "PIB India", "url": "https://pib.gov.in/RssMain.aspx", "category_hint": "politics", "language": "en"},
        {"name": "The Better India", "url": "https://www.thebetterindia.com/feed", "category_hint": "general", "language": "en"},
        {"name": "YourStory", "url": "https://yourstory.com/feed", "category_hint": "tech", "language": "en"},
        {"name": "Analytics India Mag", "url": "https://analyticsindiamag.com/feed/", "category_hint": "tech", "language": "en"},

        # ── Hindi ────────────────────────────────────────────
        {"name": "BBC Hindi", "url": "https://www.bbc.com/hindi/index.xml", "category_hint": "general", "language": "hi"},
        {"name": "Dainik Jagran", "url": "https://www.jagran.com/rss/news/national.xml", "category_hint": "politics", "language": "hi"},
        {"name": "Amar Ujala", "url": "https://www.amarujala.com/rss/india.xml", "category_hint": "politics", "language": "hi"},
        {"name": "Aaj Tak", "url": "https://www.aajtak.in/rss/india.xml", "category_hint": "general", "language": "hi"},
        {"name": "Navbharat Times", "url": "https://navbharattimes.indiatimes.com/rssfeeds/341252276.cms", "category_hint": "general", "language": "hi"},
        {"name": "Patrika", "url": "https://www.patrika.com/rss/india-news/", "category_hint": "general", "language": "hi"},

        # ── Tamil ────────────────────────────────────────────
        {"name": "The Hindu Tamil", "url": "https://www.hindutamil.in/rss/", "category_hint": "general", "language": "ta"},
        {"name": "Dinamalar", "url": "https://www.dinamalar.com/rss.asp", "category_hint": "general", "language": "ta"},

        # ── Telugu ───────────────────────────────────────────
        {"name": "Eenadu", "url": "https://www.eenadu.net/rss/rssfeed.aspx", "category_hint": "general", "language": "te"},
        {"name": "Sakshi", "url": "https://www.sakshi.com/rss.xml", "category_hint": "general", "language": "te"},

        # ── Bengali ──────────────────────────────────────────
        {"name": "Anandabazar Patrika", "url": "https://www.anandabazar.com/feed", "category_hint": "general", "language": "bn"},
        {"name": "Bangla Hunt", "url": "https://www.banglahunt.com/feed/", "category_hint": "general", "language": "bn"},

        # ── Marathi ──────────────────────────────────────────
        {"name": "Maharashtra Times", "url": "https://maharashtratimes.com/rssfeeds/2099601.cms", "category_hint": "general", "language": "mr"},
        {"name": "Loksatta", "url": "https://www.loksatta.com/feed", "category_hint": "general", "language": "mr"},

        # ── Malayalam ────────────────────────────────────────
        {"name": "Mathrubhumi", "url": "https://www.mathrubhumi.com/rss/feed.xml", "category_hint": "general", "language": "ml"},
        {"name": "Manorama Online", "url": "https://www.manoramaonline.com/feed.xml", "category_hint": "general", "language": "ml"},

        # ── Gujarati ─────────────────────────────────────────
        {"name": "Gujarat Samachar", "url": "https://www.gujaratsamachar.com/feed", "category_hint": "general", "language": "gu"},
        {"name": "Divya Bhaskar", "url": "https://www.divyabhaskar.com/rss/india.xml", "category_hint": "general", "language": "gu"},

        # ── Kannada ──────────────────────────────────────────
        {"name": "Prajavani", "url": "https://www.prajavani.net/rss/feed.xml", "category_hint": "general", "language": "kn"},
        {"name": "Vijaya Karnataka", "url": "https://vijaykarnataka.com/rssfeeds/59311060.cms", "category_hint": "general", "language": "kn"},

        # ── Urdu ─────────────────────────────────────────────
        {"name": "Inquilab", "url": "https://www.inquilab.com/feed/", "category_hint": "general", "language": "ur"},
    ]


def get_video_sources() -> list[dict[str, str]]:

    return [
        {"name": "NDTV Videos", "url": "https://www.youtube.com/feeds/videos.xml?channel_id=UCZFMm1mMw0F81Z37aaEzTUA", "category_hint": "general", "language": "en"},
        {"name": "India Today Videos", "url": "https://www.youtube.com/feeds/videos.xml?channel_id=UCY1iJwUCEEhNIGg2VYJL80Q", "category_hint": "general", "language": "en"},
        {"name": "The Hindu Videos", "url": "https://www.youtube.com/feeds/videos.xml?channel_id=UC8D-zCYWf2cSqBRwDJ1L23g", "category_hint": "general", "language": "en"},
        {"name": "BBC Hindi Videos", "url": "https://www.youtube.com/feeds/videos.xml?channel_id=UCV5m1FW8WFYCPLmI3-8IFWg", "category_hint": "general", "language": "hi"},
        {"name": "Aaj Tak Videos", "url": "https://www.youtube.com/feeds/videos.xml?channel_id=UCJjR22cVxFivM5vo6Jfrp_g", "category_hint": "general", "language": "hi"},
        {"name": "ABP News Videos", "url": "https://www.youtube.com/feeds/videos.xml?channel_id=UC1j7gr2FCkXLPEBh-ZrtQOA", "category_hint": "general", "language": "hi"},
    ]
