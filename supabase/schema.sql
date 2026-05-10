-- =============================================================================
-- India Verified — Master Schema
-- Combines migrations 001–004 into one clean, idempotent script.
-- Safe to run on a completely fresh Supabase project.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ---------------------------------------------------------------------------
-- 1. Tables
-- ---------------------------------------------------------------------------

-- Staging table: raw articles fetched from RSS / APIs before AI processing.
CREATE TABLE IF NOT EXISTS raw_articles (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    url_hash      TEXT        UNIQUE NOT NULL,
    url           TEXT        NOT NULL,
    headline      TEXT        NOT NULL CHECK (length(trim(headline)) > 0),
    excerpt       TEXT,
    source_name   TEXT        NOT NULL,
    source_url    TEXT,
    category_hint TEXT,
    fetched_at    TIMESTAMPTZ DEFAULT NOW(),
    processed     BOOLEAN     DEFAULT FALSE
);

-- Published posts — only AI-verified stories reach this table.
CREATE TABLE IF NOT EXISTS posts (
    id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    headline           TEXT        NOT NULL CHECK (length(trim(headline)) > 0),
    summary            TEXT        NOT NULL CHECK (length(trim(summary)) > 0),
    category           TEXT        NOT NULL CHECK (category IN (
                           'politics','business','sports','crime',
                           'science','health','tech','world','entertainment'
                       )),
    credibility_score  INTEGER     NOT NULL CHECK (credibility_score BETWEEN 0 AND 100),
    credibility_reason TEXT        NOT NULL DEFAULT '',
    source_count       INTEGER     NOT NULL DEFAULT 1,
    sources            JSONB       NOT NULL DEFAULT '[]'::jsonb
                           CHECK (jsonb_typeof(sources) = 'array'),
    story_fingerprint  TEXT,
    fact_check_flags   JSONB       NOT NULL DEFAULT '[]'::jsonb
                           CHECK (jsonb_typeof(fact_check_flags) = 'array'),
    status             TEXT        NOT NULL DEFAULT 'published'
                           CHECK (status IN ('published','corrected','retracted')),
    correction_note    TEXT,
    published_at       TIMESTAMPTZ DEFAULT NOW(),
    updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log: articles that failed verification or were filtered out.
CREATE TABLE IF NOT EXISTS discarded_articles (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    url              TEXT,
    source_name      TEXT,
    headline         TEXT,
    discard_reason   TEXT        NOT NULL,
    credibility_score INTEGER,
    discarded_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Known false claims sourced from fact-checkers (e.g. AltNews, BOOM).
CREATE TABLE IF NOT EXISTS known_false_claims (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_summary  TEXT        NOT NULL,
    source         TEXT        NOT NULL,
    fact_check_url TEXT        NOT NULL UNIQUE,
    keywords       TEXT[]      DEFAULT '{}',
    added_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Pipeline monitoring: one row per pipeline execution.
CREATE TABLE IF NOT EXISTS pipeline_runs (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    started_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at     TIMESTAMPTZ,
    mode             TEXT        NOT NULL DEFAULT 'full',
    duration_seconds NUMERIC,
    stats            JSONB
);


-- ---------------------------------------------------------------------------
-- 2. Indexes
-- ---------------------------------------------------------------------------

-- raw_articles
-- url_hash is already indexed via the UNIQUE constraint.
-- Composite covers the cross-source checker's query: processed=false, fetched within 12 h.
CREATE INDEX IF NOT EXISTS idx_raw_articles_processed_fetched
    ON raw_articles (processed, fetched_at DESC);
-- Needed by _load_known_hashes: range scan on fetched_at alone.
CREATE INDEX IF NOT EXISTS idx_raw_articles_fetched_at
    ON raw_articles (fetched_at DESC);

-- posts
-- Primary feed query: WHERE status='published' ORDER BY published_at DESC
CREATE INDEX IF NOT EXISTS idx_posts_status_published_at
    ON posts (status, published_at DESC);
-- Category page query: WHERE status='published' AND category=? ORDER BY published_at DESC
CREATE INDEX IF NOT EXISTS idx_posts_category_status_published_at
    ON posts (category, status, published_at DESC);
-- Trending query: ORDER BY credibility_score DESC
CREATE INDEX IF NOT EXISTS idx_posts_credibility_score
    ON posts (credibility_score DESC);
-- Publisher dedup: unique story fingerprint (partial — only non-null rows).
CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_story_fingerprint
    ON posts (story_fingerprint)
    WHERE story_fingerprint IS NOT NULL;
-- Full-text search on headline + summary.
CREATE INDEX IF NOT EXISTS idx_posts_fts
    ON posts USING GIN (to_tsvector('english', headline || ' ' || coalesce(summary, '')));

-- discarded_articles
CREATE INDEX IF NOT EXISTS idx_discarded_at
    ON discarded_articles (discarded_at DESC);
CREATE INDEX IF NOT EXISTS idx_discarded_reason_at
    ON discarded_articles (discard_reason, discarded_at DESC);

-- known_false_claims
-- GIN for fast keyword-array lookups by the fact-check matcher.
CREATE INDEX IF NOT EXISTS idx_known_false_keywords
    ON known_false_claims USING GIN (keywords);

-- pipeline_runs
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_started_at
    ON pipeline_runs (started_at DESC);


-- ---------------------------------------------------------------------------
-- 3. Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE raw_articles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts               ENABLE ROW LEVEL SECURITY;
ALTER TABLE discarded_articles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE known_false_claims  ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_runs       ENABLE ROW LEVEL SECURITY;

-- posts: public SELECT (anon key can read), all writes restricted to service role.
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname='public' AND tablename='posts'
          AND policyname='Posts are viewable by everyone'
    ) THEN
        CREATE POLICY "Posts are viewable by everyone"
            ON posts FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname='public' AND tablename='posts'
          AND policyname='Only service role can insert posts'
    ) THEN
        CREATE POLICY "Only service role can insert posts"
            ON posts FOR INSERT WITH CHECK (false);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname='public' AND tablename='posts'
          AND policyname='Only service role can update posts'
    ) THEN
        CREATE POLICY "Only service role can update posts"
            ON posts FOR UPDATE USING (false);
    END IF;
END $$;

-- All other tables: service role only (no public access).
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname='public' AND tablename='raw_articles'
          AND policyname='Raw articles service role only'
    ) THEN
        CREATE POLICY "Raw articles service role only"
            ON raw_articles FOR ALL USING (false);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname='public' AND tablename='discarded_articles'
          AND policyname='Discarded articles service role only'
    ) THEN
        CREATE POLICY "Discarded articles service role only"
            ON discarded_articles FOR ALL USING (false);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname='public' AND tablename='known_false_claims'
          AND policyname='Known false claims service role only'
    ) THEN
        CREATE POLICY "Known false claims service role only"
            ON known_false_claims FOR ALL USING (false);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname='public' AND tablename='pipeline_runs'
          AND policyname='Pipeline runs service role only'
    ) THEN
        CREATE POLICY "Pipeline runs service role only"
            ON pipeline_runs FOR ALL USING (false);
    END IF;
END $$;


-- ---------------------------------------------------------------------------
-- 4. Functions & Triggers
-- ---------------------------------------------------------------------------

-- Auto-update posts.updated_at on every UPDATE.
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- ---------------------------------------------------------------------------
-- 5. Grants
-- ---------------------------------------------------------------------------
-- When tables are created via raw SQL (not Supabase dashboard migrations),
-- the service_role must be granted access explicitly.
GRANT USAGE ON SCHEMA public TO service_role, anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON raw_articles      TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON posts             TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON discarded_articles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON known_false_claims TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON pipeline_runs     TO service_role;

-- anon key: public read on posts only (mirrors RLS policy).
GRANT SELECT ON posts TO anon, authenticated;


-- ---------------------------------------------------------------------------
-- 6. Realtime
-- ---------------------------------------------------------------------------
-- Add the posts table to Supabase's realtime publication so the frontend
-- receives live INSERT events via the browser Supabase client.
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname    = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename  = 'posts'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE posts;
    END IF;
END $$;
