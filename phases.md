# India Verified — Engineering Excellence Roadmap

## Phase 1 — Quick Wins (Low effort, high visibility)

**Goal**: Signal professionalism immediately to anyone reading the repo.

| # | Task | Files | Status |
|---|------|-------|--------|
| 1 | **Dependabot config** — auto-PRs for vulnerable deps | `.github/dependabot.yml` | ✅ |
| 2 | **`.env.example`** — root + worker, 30-second onboarding | `.env.example`, `worker/.env.example` | ✅ |
| 3 | **PR template** — context, testing notes, screenshots required | `.github/PULL_REQUEST_TEMPLATE.md` | ✅ |
| 4 | **`CONTRIBUTING.md`** — setup, commit conventions, PR workflow | `CONTRIBUTING.md` | ✅ |
| 5 | **Remove dead code** — migrate 2 remaining `fetchPosts` callers to `fetchPostsCursor`, delete legacy fn | `frontend/lib/supabase/server.ts`, `frontend/app/rss.xml/route.ts`, `frontend/app/news/[id]/page.tsx` | ✅ |
| 6 | **Conventional commits** — commitlint, `commit-msg` hook | `commitlint.config.js`, update `.pre-commit-config.yaml` | ✅ |

---

## Phase 2 — Testing & Quality Gates (Medium effort, very high visibility)

**Goal**: Prove the code is reliable at every level.

| # | Task | Files | Status |
|---|------|-------|--------|
| 7 | **Frontend unit tests** — Vitest + Testing Library, cover key components | `vitest.config.ts`, `vitest.setup.ts`, `components/**/__tests__/*.test.tsx` | ✅ 22 tests / 4 suites |
| 8 | **Coverage reporting** — `pytest-cov` for worker, `@vitest/coverage-v8` for frontend, badge in README | `pyproject.toml`, `vitest.config.ts` | ✅ config added |
| 9 | **Accessibility in CI** — `@axe-core/playwright` scanning every E2E page | `e2e/a11y.spec.ts` | ✅ 11 pages, scoped to critical/serious |
| 10 | **Lighthouse CI** — catch perf/SEO/a11y regressions per PR | `.github/workflows/lighthouse.yml`, `.lighthouserc.js` | ✅ config + workflow |
| 11 | **Bundle analyzer** — `@next/bundle-analyzer`, track size over time | `next.config.js`, `package.json` | ✅ `ANALYZE=true` |

---

## Phase 3 — Developer Experience & Observability (Medium effort)

**Goal**: Show full-lifecycle thinking — operations, onboarding, documentation.

| # | Task | Files | Status |
|---|------|-------|--------|
| 12 | **Sentry error tracking** — frontend + worker, catch real prod errors | `instrumentation.ts`, `instrumentation-client.ts`, `next.config.js`, `worker/main.py`, `worker/config.py`, `worker/requirements.txt` | ✅ DSN-gated, auth-token warnings remain until CI secrets set |
| 13 | **Storybook** — component catalog for 8-10 reusable UI components | `.storybook/main.ts`, `.storybook/preview.ts`, `components/**/__stories__/*.stories.tsx` | ✅ 10 components, 45 stories |
| 14 | **docker-compose** — one-command full-stack dev environment | `docker-compose.yml`, `frontend/Dockerfile`, `worker/Dockerfile` | ✅ |
| 15 | **Environment validation** — `zod` schemas, fail fast at startup | `lib/env.ts`, `worker/config.py` | ✅ zod (frontend) + pydantic-settings (worker) |
| 16 | **API spec** — commit auto-generated OpenAPI, validate on push | `worker/openapi.json`, `worker/scripts/export_openapi.py`, `.github/workflows/openapi.yml` | ✅ schema exported, validated in CI |

---

## Phase 4 — Architecture Polish (Higher effort)

**Goal**: Demonstrate system-level thinking and production readiness.

| # | Task | Files | Status |
|---|------|-------|--------|
| 17 | **Nonce-based CSP** — replace `unsafe-inline`/`unsafe-eval`, migrate GTM to nonce | `middleware.ts`, `next.config.js`, `app/layout.tsx` | ✅ CSP in middleware; `'unsafe-inline'` removed from script-src; nonce passed to all inline scripts; `'unsafe-eval'` kept for next/dynamic |
| 18 | **Server-side i18n routing** — locale detection, `/hi/` prefix routes, correct `lang` attr | `middleware.ts`, `app/layout.tsx`, `lib/i18n/server.ts` | ✅ Locale detection from cookie→Accept-Language; `x-locale` header set; `<html lang={locale}>` dynamic; Hinglish `/hi/` prefix TBD |
| 19 | **NewsArticle + BreadcrumbList JSON-LD** — rich search snippets per article | `app/news/[id]/page.tsx`, `lib/utils/structuredData.ts` | ✅ Already implemented in original codebase |
| 20 | **Integration test** — one E2E test hitting real Supabase (dedicated test project) | `worker/tests/test_integration.py` | ✅ 3 tests; `@pytest.mark.integration`; skipped unless real creds configured; excluded from default `pytest` run |
| 21 | **Status dashboard** — `/status` page with CI badges, coverage %, bundle size, uptime | `frontend/app/status/page.tsx` | ✅ Shows latest article age, pipeline status, CI badge placeholders |

---

## Running the phases

Each phase is a separate PR/branch:
```
phase-1-quick-wins
phase-2-testing
phase-3-devx
phase-4-polish
```

Phases can overlap — e.g., Phase 1's Dependabot can be created while working on Phase 2 tests.

---

## Resolved Issues

| # | Item | Bug | Fix |
|---|------|-----|-----|
| 1 | Dockerfile (Phase 3.14) | `frontend/Dockerfile` copies `.next/standalone` but `next.config.js` lacked `output: 'standalone'` | ✅ Added `output: 'standalone'` to `next.config.js` |
| 2 | CSP middleware (Phase 4.17) | `CONNECT_SRC.push()` and `IMG_SRC.push()` in `middleware.ts` mutated module-scoped arrays on every request | ✅ Replaced `.push()` with spread operator in local `const` |
