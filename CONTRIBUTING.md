# Contributing to India Verified

Thanks for your interest! This project is built with a focus on quality, security, and maintainability.

## Getting Started

1. **Clone the repo**
   ```bash
   git clone https://github.com/roshhellwett/projectsentinel.git
   cd projectsentinel
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example frontend/.env.local
   cp worker/.env.example worker/.env.local
   # Edit both files with your credentials
   ```

3. **Install dependencies**
   ```bash
   cd frontend && npm ci
   cd ../worker && pip install -r requirements.txt
   ```

4. **Install pre-commit hooks**
   ```bash
   pip install pre-commit
   pre-commit install
   ```

5. **Run the dev servers**
   ```bash
   # Terminal 1: Frontend
   cd frontend && npm run dev

   # Terminal 2: Worker
   cd worker && uvicorn main:app --reload
   ```

## Project Structure

```
frontend/    Next.js 15 App Router + TypeScript + Tailwind
worker/      Python 3.11 FastAPI + APScheduler background jobs
supabase/    DB schema + migrations
```

## Commit Conventions

This project uses **Conventional Commits**.

```
<type>(<scope>): <description>

Examples:
  feat(frontend): add bookmark button to news cards
  fix(worker): handle empty RSS feed gracefully
  chore(deps): bump next to 15.6.0
  docs(root): update README with deployment guide
```

**Types**: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `test`, `ci`, `build`, `revert`

**Scopes**: `frontend`, `worker`, `supabase`, `ci`, `deps`, `docs`, `root`

## Pull Request Process

1. Create a branch from `main`:
   ```bash
   git checkout -b type/description
   # e.g., fix/rss-feed-timeout
   ```
2. Make your changes and commit using conventional commits.
3. Push and open a PR against `main`.
4. Ensure all CI checks pass (lint, type-check, tests, build).
5. Request review from a maintainer.

## Code Standards

### Frontend
- TypeScript strict mode enabled — no `any` unless absolutely necessary
- React Server Components by default; use `'use client'` only when needed
- Tailwind CSS for styling (no CSS modules, no inline styles for layout)
- Imports sorted: React → Next.js → Libraries → Internal

### Worker
- Python 3.11+ with type hints on all functions
- Ruff for linting (line-length 120, double quotes)
- Async/await for all I/O operations
- Tests for every module (pytest with mocking for external services)

## Testing

```bash
# Frontend
cd frontend
npm run lint          # ESLint
npx tsc --noEmit      # Type-check
npm test              # Playwright E2E
npm run test:smoke    # Quick smoke test

# Worker
cd worker
ruff check .          # Lint
pytest                # Unit + integration tests
```

## Questions?

Open a [discussion](https://github.com/roshhellwett/projectsentinel/discussions) or an issue.
