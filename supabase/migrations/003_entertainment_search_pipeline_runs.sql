
DO $$
BEGIN
    ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_category_check;
    ALTER TABLE posts ADD CONSTRAINT posts_category_check
        CHECK (category IN (
            'politics', 'business', 'sports', 'crime',
            'science', 'health', 'tech', 'world', 'entertainment'
        ));
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$
DECLARE
    con_name TEXT;
BEGIN
    SELECT conname INTO con_name
    FROM pg_constraint
    WHERE conrelid = 'posts'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%politics%business%';

    IF con_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE posts DROP CONSTRAINT ' || quote_ident(con_name);
        ALTER TABLE posts ADD CONSTRAINT posts_category_check
            CHECK (category IN (
                'politics', 'business', 'sports', 'crime',
                'science', 'health', 'tech', 'world', 'entertainment'
            ));
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS posts_category_published_idx
    ON posts(category, published_at DESC);

CREATE INDEX IF NOT EXISTS posts_published_idx
    ON posts(published_at DESC);

CREATE INDEX IF NOT EXISTS posts_credibility_idx
    ON posts(credibility_score DESC);

CREATE INDEX IF NOT EXISTS posts_fts_idx
    ON posts USING GIN(to_tsvector('english', headline || ' ' || coalesce(summary, '')));

CREATE TABLE IF NOT EXISTS pipeline_runs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    started_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    mode        TEXT NOT NULL DEFAULT 'full',
    duration_seconds NUMERIC,
    stats       JSONB
);

CREATE INDEX IF NOT EXISTS idx_pipeline_runs_started_at
    ON pipeline_runs(started_at DESC);

ALTER TABLE pipeline_runs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'pipeline_runs'
          AND policyname = 'Pipeline runs service role only'
    ) THEN
        CREATE POLICY "Pipeline runs service role only"
            ON pipeline_runs FOR ALL USING (false);
    END IF;
END $$;

UPDATE posts
SET sources = (
    SELECT jsonb_agg(
        CASE
            WHEN (elem->>'title') IS NOT NULL THEN elem
            WHEN (elem->>'name') IS NOT NULL THEN
                jsonb_build_object('title', elem->>'name', 'url', coalesce(elem->>'url', ''))
            WHEN (elem->>'url') IS NOT NULL THEN
                jsonb_build_object(
                    'title',
                    regexp_replace(
                        regexp_replace(elem->>'url', '^https?://(www\.)?', ''),
                        '/.*$', ''
                    ),
                    'url', elem->>'url'
                )
            ELSE elem
        END
    )
    FROM jsonb_array_elements(sources) AS elem
)
WHERE sources IS NOT NULL
  AND jsonb_array_length(sources) > 0
  AND sources::text NOT LIKE '%"title"%';

UPDATE posts
SET category = 'entertainment'
WHERE category IN ('business', 'world', 'politics')
  AND (
    lower(headline) SIMILAR TO '%(film|movie|cinema|release|box office|actor|actress|director|bollywood|tollywood|kollywood|ott|netflix|amazon prime|hotstar|zee5|music|album|song|celebrity|award|filmfare|iifa|oscar|star|serial|web series|trailer|teaser|debut)%'
  );
