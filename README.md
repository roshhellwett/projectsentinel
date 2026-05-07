# ProjectSentinel

An AI-powered, fully automated Indian news aggregator that verifies stories through cross-referencing before publishing. Zero human intervention required.

## What It Does

- **Fetches** news from trusted Indian sources every 30 minutes
- **Verifies** stories by cross-referencing multiple sources using Gemini AI
- **Writes** neutral summaries using Groq AI (Llama 3.3 70B)
- **Publishes** only verified stories with credibility scores and source links
- **Operates** 24/7 without any human editors

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 + TypeScript + Tailwind CSS |
| Backend | Python 3.11 + FastAPI |
| Database | Supabase (PostgreSQL) |
| AI Verification | Google Gemini 1.5 Flash |
| AI Writing | Groq API (Llama 3.3 70B) |
| Hosting | Vercel (frontend), Railway (backend) |

## Project Structure

```
projectsentinel/
├── frontend/          # Next.js application
├── worker/            # Python pipeline
├── supabase/          # Database migrations
└── .github/           # CI/CD workflows
```

## Quick Start

### 1. Clone and Setup

```bash
git clone https://github.com/yourusername/projectsentinel.git
cd projectsentinel
```

### 2. Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Open the SQL Editor
3. Run the migration file: `supabase/migrations/001_initial_schema.sql`
4. Enable real-time for the `posts` table in the dashboard
5. Copy your project URL and keys

### 3. Setup Backend (Worker)

```bash
cd worker
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file from example
cp .env.example .env
# Edit .env with your actual values

# Run locally
python main.py
```

### 4. Setup Frontend

```bash
cd frontend
npm install

# Create .env.local file from example
cp .env.example .env.local
# Edit .env.local with your actual values

# Run locally
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env` and fill in all values:

- **Supabase**: URL, anon key, service role key
- **AI**: Gemini API key, Groq API key
- **News APIs**: GNews API key, NewsAPI key
- **Admin**: Password, secret token
- **App**: Site URL, Supabase public config

## Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Import repo at [vercel.com](https://vercel.com)
3. Set root directory to `frontend/`
4. Add environment variables
5. Deploy (auto-deploys on push)

### Backend (Railway)

1. Create project at [railway.app](https://railway.app)
2. Connect GitHub repo, set root to `worker/`
3. Add environment variables
4. Deploy
5. Set up [cron-job.org](https://cron-job.org) to ping `/health` every 10 minutes

## How the Pipeline Works

1. **Fetch**: RSS feeds + news APIs → `raw_articles` table
2. **Deduplicate**: SHA256 URL hashing
3. **Block check**: Skip blocked/satire domains
4. **False claim match**: Check against known false claims
5. **Cross-source check**: Require 2+ sources
6. **Gemini verification**: Score 0-100, extract key facts
7. **Groq writing**: Write neutral headline + summary
8. **Publish**: Insert to `posts` table
9. **Log**: Structured logging to stdout

## License

MIT — Open source and free to use.

## Transparency

- Full source code on GitHub
- Credibility scores on every story
- All source links visible
- Correction system for errors
- No ads, no sponsored content
