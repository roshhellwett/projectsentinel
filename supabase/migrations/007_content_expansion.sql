-- Content expansion: language support + video content type

ALTER TABLE posts ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'en';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS content_type TEXT NOT NULL DEFAULT 'article' CHECK (content_type IN ('article', 'video'));
ALTER TABLE posts ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS video_thumbnail TEXT;

CREATE INDEX IF NOT EXISTS idx_posts_language ON posts (language) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_posts_content_type ON posts (content_type) WHERE status = 'published';
