# ProjectSentinel - Agent Instructions

## Project Overview
AI-powered, fully automated Indian news aggregator. Fetches news every 30 minutes, verifies with Groq AI, and publishes verified stories with credibility scores.

## Commands

### Frontend (Next.js)
- `cd frontend && npm run dev` - Start dev server
- `cd frontend && npm run build` - Production build
- `cd frontend && npm run lint` - ESLint
- `cd frontend && npm run type-check` - TypeScript type checking

### Worker (Python/FastAPI)
- `cd worker && uvicorn main:app --reload` - Start dev server
- `cd worker && python -m pytest tests/` - Run tests
- `cd worker && ruff check .` - Lint Python code
- `cd worker && ruff format .` - Format Python code

## Key Files

### Worker Structure
- `worker/main.py` - FastAPI app with APScheduler
- `worker/scheduler/jobs.py` - Main pipeline orchestration
- `worker/verifier/groq_verifier.py` - AI verification (uses GROQ_VERIFY_MODEL)
- `worker/writer/groq_writer.py` - AI writing (uses GROQ_WRITE_MODEL)
- `worker/publisher/supabase_publisher.py` - Database operations
- `worker/fetcher/rss_fetcher.py` - RSS feed fetching

### Frontend Structure
- `frontend/app/` - Next.js App Router pages
- `frontend/components/` - React components
- `frontend/lib/supabase/` - Supabase clients

## Environment Variables
Required vars (see `.env.example` files):
- SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
- GEMINI_API_KEY
- GROQ_API_KEY_VERIFY, GROQ_VERIFY_MODEL (default: llama3-8b-8192)
- GROQ_API_KEY, GROQ_WRITE_MODEL (default: llama3-70b-8192)
- GNEWS_API_KEY, NEWSAPI_KEY
- ADMIN_PASSWORD, ADMIN_SECRET_TOKEN
