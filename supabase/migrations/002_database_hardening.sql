-- Database hardening for ProjectSentinel
-- Safe to run after the initial schema.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Keep duplicate fact-check feed entries out of the database.
CREATE UNIQUE INDEX IF NOT EXISTS idx_known_false_claims_url
    ON known_false_claims(fact_check_url);

-- Query shapes used by the frontend and worker.
CREATE INDEX IF NOT EXISTS idx_posts_status_published_at
    ON posts(status, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_posts_category_status_published_at
    ON posts(category, status, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_raw_articles_processed_fetched_at
    ON raw_articles(processed, fetched_at DESC);

CREATE INDEX IF NOT EXISTS idx_discarded_reason_at
    ON discarded_articles(discard_reason, discarded_at DESC);

-- Guard rails for user-facing data.
ALTER TABLE posts
    ALTER COLUMN credibility_reason SET DEFAULT '',
    ALTER COLUMN fact_check_flags SET DEFAULT '[]'::jsonb;

ALTER TABLE posts
    ADD COLUMN IF NOT EXISTS story_fingerprint TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_story_fingerprint
    ON posts(story_fingerprint)
    WHERE story_fingerprint IS NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'posts_headline_not_blank') THEN
        ALTER TABLE posts ADD CONSTRAINT posts_headline_not_blank
            CHECK (length(trim(headline)) > 0) NOT VALID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'posts_summary_not_blank') THEN
        ALTER TABLE posts ADD CONSTRAINT posts_summary_not_blank
            CHECK (length(trim(summary)) > 0) NOT VALID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'posts_sources_is_array') THEN
        ALTER TABLE posts ADD CONSTRAINT posts_sources_is_array
            CHECK (jsonb_typeof(sources) = 'array') NOT VALID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'posts_fact_flags_is_array') THEN
        ALTER TABLE posts ADD CONSTRAINT posts_fact_flags_is_array
            CHECK (jsonb_typeof(fact_check_flags) = 'array') NOT VALID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'raw_articles_headline_not_blank') THEN
        ALTER TABLE raw_articles ADD CONSTRAINT raw_articles_headline_not_blank
            CHECK (length(trim(headline)) > 0) NOT VALID;
    END IF;
END $$;

-- Realtime: add posts to the existing Supabase publication without dropping it.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
       AND NOT EXISTS (
            SELECT 1
            FROM pg_publication_tables
            WHERE pubname = 'supabase_realtime'
              AND schemaname = 'public'
              AND tablename = 'posts'
       ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE posts;
    END IF;
END $$;
