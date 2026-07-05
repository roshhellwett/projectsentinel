-- Enable pg_trgm extension for ILIKE search fallback
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN trigram index on headline for fast ILIKE fallback queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_headline_trgm
  ON posts USING gin (headline gin_trgm_ops)
  WHERE status = 'published';

-- Covering index for feed queries: allows index-only scans for the common feed query.
-- The INCLUDE columns cover everything feed lists need without touching the heap.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_feed_covering
  ON posts (status, published_at DESC)
  INCLUDE (id, headline, summary, category, credibility_score, credibility_reason, source_count, updated_at)
  WHERE status = 'published';

-- Covering index for category-filtered feed queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_category_feed_covering
  ON posts (category, status, published_at DESC)
  INCLUDE (id, headline, summary, credibility_score, credibility_reason, source_count, updated_at)
  WHERE status = 'published';
