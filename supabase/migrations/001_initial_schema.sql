-- Initial schema for ProjectSentinel
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: raw_articles
-- Temporary staging table for articles before AI processing
CREATE TABLE raw_articles (
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

-- Index for deduplication lookups
CREATE INDEX idx_raw_articles_url_hash ON raw_articles(url_hash);
CREATE INDEX idx_raw_articles_processed ON raw_articles(processed);
CREATE INDEX idx_raw_articles_fetched_at ON raw_articles(fetched_at);

-- Table: posts
-- Final published posts, only verified stories
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    headline TEXT NOT NULL,
    summary TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('politics', 'business', 'sports', 'crime', 'science', 'health', 'tech', 'world')),
    credibility_score INTEGER NOT NULL CHECK (credibility_score >= 0 AND credibility_score <= 100),
    credibility_reason TEXT,
    source_count INTEGER NOT NULL DEFAULT 1,
    sources JSONB NOT NULL DEFAULT '[]'::jsonb,
    fact_check_flags JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'corrected', 'retracted')),
    correction_note TEXT,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for posts
CREATE INDEX idx_posts_category ON posts(category);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX idx_posts_score ON posts(credibility_score DESC);

-- Table: discarded_articles
-- Log of articles that failed verification
CREATE TABLE discarded_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT,
    source_name TEXT,
    headline TEXT,
    discard_reason TEXT NOT NULL,
    credibility_score INTEGER,
    discarded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_discarded_at ON discarded_articles(discarded_at DESC);

-- Table: known_false_claims
-- Database of fact-checked false claims
CREATE TABLE known_false_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_summary TEXT NOT NULL,
    source TEXT NOT NULL,
    fact_check_url TEXT NOT NULL,
    keywords TEXT[] DEFAULT '{}',
    added_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_known_false_keywords ON known_false_claims USING GIN(keywords);

-- Enable Row Level Security on all tables
ALTER TABLE raw_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE discarded_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE known_false_claims ENABLE ROW LEVEL SECURITY;

-- RLS Policies for posts table (public read)
CREATE POLICY "Posts are viewable by everyone" 
    ON posts FOR SELECT 
    USING (true);

CREATE POLICY "Only service role can insert posts" 
    ON posts FOR INSERT 
    WITH CHECK (false);  -- Service role bypasses RLS

CREATE POLICY "Only service role can update posts" 
    ON posts FOR UPDATE 
    USING (false);  -- Service role bypasses RLS

-- RLS Policies for other tables (service role only)
CREATE POLICY "Raw articles service role only" 
    ON raw_articles FOR ALL 
    USING (false);

CREATE POLICY "Discarded articles service role only" 
    ON discarded_articles FOR ALL 
    USING (false);

CREATE POLICY "Known false claims service role only" 
    ON known_false_claims FOR ALL 
    USING (false);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for posts table
CREATE TRIGGER update_posts_updated_at 
    BEFORE UPDATE ON posts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Realtime for posts table
-- This allows the frontend to auto-refresh when new posts are published
BEGIN;
  -- Drop the publication if it exists
  DROP PUBLICATION IF EXISTS supabase_realtime;
  -- Create a new publication
  CREATE PUBLICATION supabase_realtime;
COMMIT;

-- Add posts table to the publication
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
