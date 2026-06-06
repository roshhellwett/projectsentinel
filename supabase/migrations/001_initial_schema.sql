
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS raw_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url_hash TEXT UNIQUE NOT NULL,
    url TEXT NOT NULL,
    headline TEXT NOT NULL,
    excerpt TEXT,
    source_name TEXT NOT NULL,
    source_url TEXT,
    category_hint TEXT,
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    processed BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_raw_articles_url_hash ON raw_articles(url_hash);
CREATE INDEX IF NOT EXISTS idx_raw_articles_processed ON raw_articles(processed);
CREATE INDEX IF NOT EXISTS idx_raw_articles_fetched_at ON raw_articles(fetched_at);

CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    headline TEXT NOT NULL,
    summary TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('politics', 'business', 'sports', 'crime', 'science', 'health', 'tech', 'world', 'entertainment')),
    credibility_score INTEGER NOT NULL CHECK (credibility_score >= 0 AND credibility_score <= 100),
    credibility_reason TEXT,
    source_count INTEGER NOT NULL DEFAULT 1,
    sources JSONB NOT NULL DEFAULT '[]'::jsonb,
    story_fingerprint TEXT,
    fact_check_flags JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'corrected', 'retracted')),
    correction_note TEXT,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_score ON posts(credibility_score DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_story_fingerprint
    ON posts(story_fingerprint)
    WHERE story_fingerprint IS NOT NULL;

CREATE TABLE IF NOT EXISTS discarded_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT,
    source_name TEXT,
    headline TEXT,
    discard_reason TEXT NOT NULL,
    credibility_score INTEGER,
    discarded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_discarded_at ON discarded_articles(discarded_at DESC);

CREATE TABLE IF NOT EXISTS known_false_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_summary TEXT NOT NULL,
    source TEXT NOT NULL,
    fact_check_url TEXT NOT NULL,
    keywords TEXT[] DEFAULT '{}',
    added_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_known_false_keywords ON known_false_claims USING GIN(keywords);

CREATE TABLE IF NOT EXISTS pipeline_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    mode TEXT NOT NULL DEFAULT 'full',
    fetched INTEGER DEFAULT 0,
    duplicates INTEGER DEFAULT 0,
    published INTEGER DEFAULT 0,
    low_score INTEGER DEFAULT 0,
    single_source INTEGER DEFAULT 0,
    error TEXT
);

CREATE INDEX IF NOT EXISTS idx_pipeline_runs_started_at ON pipeline_runs(started_at DESC);

ALTER TABLE raw_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE discarded_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE known_false_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_runs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'posts' AND policyname = 'Posts are viewable by everyone') THEN
        CREATE POLICY "Posts are viewable by everyone" ON posts FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'posts' AND policyname = 'Only service role can insert posts') THEN
        CREATE POLICY "Only service role can insert posts" ON posts FOR INSERT WITH CHECK (false);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'posts' AND policyname = 'Only service role can update posts') THEN
        CREATE POLICY "Only service role can update posts" ON posts FOR UPDATE USING (false);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'raw_articles' AND policyname = 'Raw articles service role only') THEN
        CREATE POLICY "Raw articles service role only" ON raw_articles FOR ALL USING (false);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'discarded_articles' AND policyname = 'Discarded articles service role only') THEN
        CREATE POLICY "Discarded articles service role only" ON discarded_articles FOR ALL USING (false);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'known_false_claims' AND policyname = 'Known false claims service role only') THEN
        CREATE POLICY "Known false claims service role only" ON known_false_claims FOR ALL USING (false);
    END IF;
END $$;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

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
