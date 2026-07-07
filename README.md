![Stars](https://img.shields.io/github/stars/roshhellwett/projectsentinel?style=for-the-badge)
![Forks](https://img.shields.io/github/forks/roshhellwett/projectsentinel?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-Llama%203.3-0a84ff?style=for-the-badge)

# INDIA VERIFIED

AI-powered Indian news aggregator that cross-references stories across multiple trusted sources before publishing. The whole pipeline runs on its own — fetch, verify, write, publish.

---

## Key Features

### AI Verification Pipeline
- **Automated Fact-Checking**: Every story is verified using Groq Llama 3.3 70B before it reaches your screen
- **Multi-Source Cross-Reference**: Stories must be confirmed by 2+ independent trusted sources or they are discarded
- **Credibility Scoring**: Every article receives a 0–100 credibility score based on source authority, detail richness, and writing tone
- **Neutral AI Writing**: Verified facts are rewritten into unbiased, factual summaries — no sensationalism, no spin

### Fully Autonomous
- **Runs 24/7**: Fetches news from RSS feeds and APIs every 30 minutes — no human editors needed
- **SHA256 Deduplication**: Duplicate stories are automatically filtered out using URL hashing
- **Domain Blocklist**: Known satire, spam, and fake-news domains are blocked at the pipeline level
- **Structured Logging**: Full observability with detailed pipeline logs to stdout

### Premium Reading Experience
- **Clean, Distraction-Free**: Apple-inspired editorial design with frosted glass cards and subtle animations
- **Infinite Scroll**: Smooth auto-loading feed with no pagination
- **Real-Time Category Filtering**: Browse news by Politics, Business, Sports, Tech, and more
- **RSS Feed**: Subscribe via your favourite RSS reader for offline access

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 + TypeScript + Tailwind CSS |
| Backend | Python 3.11 + FastAPI |
| Database | Supabase (PostgreSQL) |
| AI Verification | Groq API (Llama 3.3 70B) |
| AI Writing | Groq API (Llama 3.3 70B) |
| Hosting | Vercel (frontend), Railway (worker) |

---

## Project Structure

```
projectsentinel/
├── frontend/              # Next.js application
│   ├── app/               # App router (pages, API routes)
│   ├── components/        # Reusable UI components
│   ├── lib/               # Supabase client, utilities
│   └── public/            # Static assets
├── worker/                # Python verification pipeline
│   ├── fetcher/           # RSS & API news fetching
│   ├── verifier/          # Groq AI cross-referencing
│   ├── writer/            # Neutral summary generation
│   ├── publisher/         # Database insert logic
│   └── scheduler/         # Cron-based orchestration
├── supabase/              # Database migrations & schema
└── .github/               # CI/CD workflows
```

---

## How the Pipeline Works

```
Fetch → Deduplicate → Block Check → False Claim Match
  → Cross-Source Check → AI Verification → AI Writing → Publish
```

1. **Fetch**: RSS feeds + news APIs → `raw_articles` table
2. **Deduplicate**: SHA256 URL hashing prevents duplicates
3. **Block Check**: Skip known satire and spam domains
4. **False Claim Match**: Cross-check against known false claims
5. **Cross-Source Check**: Require 2+ independent sources
6. **Groq Verification**: Score 0–100, extract key facts, headline, summary
7. **Groq Writing**: Write neutral, factual headline + summary
8. **Publish**: Insert verified story into `posts` table

---

## License

MIT — Open source and free to use.

---

## Transparency

- Full source code available on GitHub
- Credibility score displayed on every story
- All original source links visible
- Correction system for errors
- No ads, no sponsored content

---

© 2026 [Zenith Open Source Projects](https://zenithopensourceprojects.vercel.app/). All Rights Reserved.
Zenith is an Open Source Project Idea by @roshhellwett