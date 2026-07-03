-- ============================================================
-- INDIA VERIFIED - Complete Database Schema
-- Run this on a fresh Supabase project to initialize everything
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- CUSTOM TYPES (Enums)
-- ============================================================

DO $$ BEGIN
    CREATE TYPE public.telegram_delivery_kind AS ENUM (
        'channel', 'user_alert', 'digest', 'external_chat'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE public.telegram_notif_mode AS ENUM (
        'instant', 'digest', 'breaking_only', 'silent'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- TABLES
-- ============================================================

-- Raw fetched articles
CREATE TABLE IF NOT EXISTS public.raw_articles (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    url_hash         TEXT        NOT NULL,
    url              TEXT        NOT NULL,
    headline         TEXT        NOT NULL CHECK (length(trim(headline)) > 0),
    excerpt          TEXT,
    source_name      TEXT        NOT NULL,
    source_url       TEXT,
    category_hint    TEXT,
    fetched_at       TIMESTAMPTZ DEFAULT NOW(),
    processed        BOOLEAN     DEFAULT FALSE,
    CONSTRAINT raw_articles_url_hash_key UNIQUE (url_hash)
);

-- Verified/Published posts
CREATE TABLE IF NOT EXISTS public.posts (
    id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    headline           TEXT        NOT NULL CHECK (length(trim(headline)) > 0),
    summary            TEXT        NOT NULL CHECK (length(trim(summary)) > 0),
    category           TEXT        NOT NULL CHECK (category IN (
                           'politics','business','sports','crime',
                           'science','health','tech','world','entertainment','education'
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
    published_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- Discarded low-quality / duplicate articles
CREATE TABLE IF NOT EXISTS public.discarded_articles (
    id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    url               TEXT,
    source_name       TEXT,
    headline          TEXT,
    discard_reason    TEXT        NOT NULL,
    credibility_score INTEGER,
    discarded_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Known false claims database
CREATE TABLE IF NOT EXISTS public.known_false_claims (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_summary   TEXT        NOT NULL,
    source          TEXT        NOT NULL,
    fact_check_url  TEXT        NOT NULL UNIQUE,
    keywords        TEXT[]      DEFAULT '{}',
    added_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Groq AI usage tracking
CREATE TABLE IF NOT EXISTS public.groq_usage (
    usage_date  DATE        PRIMARY KEY,
    key_stats   JSONB       NOT NULL DEFAULT '[]'::jsonb,
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Pipeline execution logs
CREATE TABLE IF NOT EXISTS public.pipeline_runs (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    started_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at     TIMESTAMPTZ,
    mode             TEXT        NOT NULL DEFAULT 'full',
    duration_seconds NUMERIC,
    stats            JSONB
);

-- Telegram users
CREATE TABLE IF NOT EXISTS public.telegram_users (
    tg_user_id          BIGINT                   NOT NULL PRIMARY KEY,
    tg_chat_id          BIGINT                   NOT NULL,
    username            TEXT,
    first_name          TEXT,
    language_code       TEXT                     NOT NULL DEFAULT 'en',
    timezone            TEXT                     NOT NULL DEFAULT 'Asia/Kolkata',
    subscribed_categories TEXT[]                 NOT NULL DEFAULT '{}',
    muted_categories    TEXT[]                   NOT NULL DEFAULT '{}',
    notif_mode          public.telegram_notif_mode NOT NULL DEFAULT 'instant',
    quiet_start         TIME WITHOUT TIME ZONE   NOT NULL DEFAULT '23:00:00',
    quiet_end           TIME WITHOUT TIME ZONE   NOT NULL DEFAULT '07:00:00',
    is_blocked          BOOLEAN                  NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ              NOT NULL DEFAULT NOW(),
    last_active_at      TIMESTAMPTZ              NOT NULL DEFAULT NOW()
);

-- Subscribed Telegram channels/groups
CREATE TABLE IF NOT EXISTS public.telegram_subscribed_chats (
    id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tg_chat_id        BIGINT      NOT NULL UNIQUE,
    chat_type         TEXT        NOT NULL,
    title             TEXT,
    username          TEXT,
    added_by_user_id  BIGINT,
    muted_categories  TEXT[]      NOT NULL DEFAULT '{}',
    min_score         INTEGER     NOT NULL DEFAULT 0,
    is_active         BOOLEAN     NOT NULL DEFAULT TRUE,
    added_at          TIMESTAMPTZ DEFAULT NOW(),
    removed_at        TIMESTAMPTZ,
    last_post_at      TIMESTAMPTZ,
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Telegram post deliveries (tracking which posts sent where)
CREATE SEQUENCE IF NOT EXISTS public.telegram_deliveries_id_seq
    START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807;

CREATE TABLE IF NOT EXISTS public.telegram_deliveries (
    id           BIGINT                      NOT NULL PRIMARY KEY DEFAULT nextval('public.telegram_deliveries_id_seq'),
    post_id      UUID                        NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    chat_id      BIGINT                      NOT NULL,
    topic_id     BIGINT,
    message_id   BIGINT                      NOT NULL,
    kind         public.telegram_delivery_kind NOT NULL,
    sent_at      TIMESTAMPTZ                 NOT NULL DEFAULT NOW(),
    CONSTRAINT telegram_deliveries_post_id_chat_id_kind_key UNIQUE (post_id, chat_id, kind)
);

-- Telegram user reactions on posts
CREATE TABLE IF NOT EXISTS public.telegram_reactions (
    post_id    UUID        NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    tg_user_id BIGINT      NOT NULL,
    reaction   TEXT        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (post_id, tg_user_id, reaction)
);

-- Telegram user bookmarks
CREATE TABLE IF NOT EXISTS public.telegram_bookmarks (
    tg_user_id BIGINT      NOT NULL REFERENCES public.telegram_users(tg_user_id) ON DELETE CASCADE,
    post_id    UUID        NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    saved_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (tg_user_id, post_id)
);

-- ============================================================
-- VIEWS
-- ============================================================

CREATE OR REPLACE VIEW public.posts_pending_channel_delivery AS
SELECT p.id, p.headline, p.summary, p.category,
       p.credibility_score, p.credibility_reason, p.source_count,
       p.sources, p.story_fingerprint, p.fact_check_flags,
       p.status, p.correction_note, p.published_at, p.updated_at
FROM public.posts p
LEFT JOIN public.telegram_deliveries d
    ON d.post_id = p.id AND d.kind = 'channel'::telegram_delivery_kind
WHERE p.status = 'published' AND d.id IS NULL
ORDER BY p.published_at DESC;

-- ============================================================
-- INDEXES
-- ============================================================

-- raw_articles
CREATE INDEX IF NOT EXISTS idx_raw_articles_processed_fetched
    ON public.raw_articles (processed, fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_raw_articles_fetched_at
    ON public.raw_articles (fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_raw_articles_processed_fetched_at
    ON public.raw_articles (processed, fetched_at DESC);

-- posts
CREATE INDEX IF NOT EXISTS idx_posts_status_published_at
    ON public.posts (status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category_status_published_at
    ON public.posts (category, status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_credibility_score
    ON public.posts (credibility_score DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_story_fingerprint
    ON public.posts (story_fingerprint)
    WHERE story_fingerprint IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_fts
    ON public.posts USING GIN (to_tsvector('english', headline || ' ' || coalesce(summary, '')));
CREATE INDEX IF NOT EXISTS posts_category_published_idx
    ON public.posts (category, published_at DESC);

-- discarded_articles
CREATE INDEX IF NOT EXISTS idx_discarded_at
    ON public.discarded_articles (discarded_at DESC);
CREATE INDEX IF NOT EXISTS idx_discarded_reason_at
    ON public.discarded_articles (discard_reason, discarded_at DESC);

-- known_false_claims
CREATE INDEX IF NOT EXISTS idx_known_false_keywords
    ON public.known_false_claims USING GIN (keywords);
CREATE UNIQUE INDEX IF NOT EXISTS idx_known_false_claims_url
    ON public.known_false_claims (fact_check_url);

-- pipeline_runs
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_started_at
    ON public.pipeline_runs (started_at DESC);

-- telegram_deliveries
CREATE INDEX IF NOT EXISTS idx_tg_deliveries_chat
    ON public.telegram_deliveries (chat_id);
CREATE INDEX IF NOT EXISTS idx_tg_deliveries_post
    ON public.telegram_deliveries (post_id);
CREATE INDEX IF NOT EXISTS idx_tg_deliveries_sent_at
    ON public.telegram_deliveries (sent_at DESC);

-- telegram_reactions
CREATE INDEX IF NOT EXISTS idx_tg_reactions_post
    ON public.telegram_reactions (post_id);
CREATE INDEX IF NOT EXISTS idx_tg_reactions_recent
    ON public.telegram_reactions (created_at DESC);

-- telegram_bookmarks
CREATE INDEX IF NOT EXISTS idx_tg_bookmarks_user
    ON public.telegram_bookmarks (tg_user_id, saved_at DESC);
CREATE INDEX IF NOT EXISTS idx_tg_bookmarks_post
    ON public.telegram_bookmarks (post_id);

-- telegram_subscribed_chats
CREATE INDEX IF NOT EXISTS idx_tg_chats_active
    ON public.telegram_subscribed_chats (is_active)
    WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_tg_chats_added_at
    ON public.telegram_subscribed_chats (added_at DESC);
CREATE INDEX IF NOT EXISTS idx_tg_chats_type
    ON public.telegram_subscribed_chats (chat_type);

-- telegram_users
CREATE INDEX IF NOT EXISTS idx_tg_users_last_active
    ON public.telegram_users (last_active_at DESC);
CREATE INDEX IF NOT EXISTS idx_tg_users_not_blocked
    ON public.telegram_users (is_blocked)
    WHERE is_blocked = FALSE;
CREATE INDEX IF NOT EXISTS idx_tg_users_notif_mode
    ON public.telegram_users (notif_mode);

-- ============================================================
-- TRIGGER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TRIGGERS
-- ============================================================

DROP TRIGGER IF EXISTS update_posts_updated_at ON public.posts;
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.raw_articles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discarded_articles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.known_false_claims        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groq_usage               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_runs             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_users            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_subscribed_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_deliveries       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_reactions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_bookmarks        ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES (idempotent)
-- ============================================================

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname='public' AND tablename='posts'
          AND policyname='Posts are viewable by everyone'
    ) THEN
        CREATE POLICY "Posts are viewable by everyone"
            ON public.posts FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname='public' AND tablename='posts'
          AND policyname='Only service role can insert posts'
    ) THEN
        CREATE POLICY "Only service role can insert posts"
            ON public.posts FOR INSERT WITH CHECK (false);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname='public' AND tablename='posts'
          AND policyname='Only service role can update posts'
    ) THEN
        CREATE POLICY "Only service role can update posts"
            ON public.posts FOR UPDATE USING (false);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname='public' AND tablename='raw_articles'
          AND policyname='Raw articles service role only'
    ) THEN
        CREATE POLICY "Raw articles service role only"
            ON public.raw_articles FOR ALL USING (false);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname='public' AND tablename='discarded_articles'
          AND policyname='Discarded articles service role only'
    ) THEN
        CREATE POLICY "Discarded articles service role only"
            ON public.discarded_articles FOR ALL USING (false);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname='public' AND tablename='known_false_claims'
          AND policyname='Known false claims service role only'
    ) THEN
        CREATE POLICY "Known false claims service role only"
            ON public.known_false_claims FOR ALL USING (false);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname='public' AND tablename='groq_usage'
          AND policyname='groq_usage service role only'
    ) THEN
        CREATE POLICY "groq_usage service role only"
            ON public.groq_usage FOR ALL USING (false);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname='public' AND tablename='pipeline_runs'
          AND policyname='Pipeline runs service role only'
    ) THEN
        CREATE POLICY "Pipeline runs service role only"
            ON public.pipeline_runs FOR ALL USING (false);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname='public' AND tablename='telegram_users'
          AND policyname='Telegram users service role only'
    ) THEN
        CREATE POLICY "Telegram users service role only"
            ON public.telegram_users FOR ALL USING (false);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname='public' AND tablename='telegram_subscribed_chats'
          AND policyname='Telegram subscribed chats service role only'
    ) THEN
        CREATE POLICY "Telegram subscribed chats service role only"
            ON public.telegram_subscribed_chats FOR ALL USING (false);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname='public' AND tablename='telegram_deliveries'
          AND policyname='Telegram deliveries service role only'
    ) THEN
        CREATE POLICY "Telegram deliveries service role only"
            ON public.telegram_deliveries FOR ALL USING (false);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname='public' AND tablename='telegram_reactions'
          AND policyname='Telegram reactions service role only'
    ) THEN
        CREATE POLICY "Telegram reactions service role only"
            ON public.telegram_reactions FOR ALL USING (false);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname='public' AND tablename='telegram_bookmarks'
          AND policyname='Telegram bookmarks service role only'
    ) THEN
        CREATE POLICY "Telegram bookmarks service role only"
            ON public.telegram_bookmarks FOR ALL USING (false);
    END IF;
END $$;

-- ============================================================
-- GRANTS
-- ============================================================

GRANT USAGE ON SCHEMA public TO service_role, anon, authenticated;

-- Full access for service_role on all tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Public read-only access to posts
GRANT SELECT ON public.posts TO anon, authenticated;

-- ============================================================
-- REALTIME PUBLICATION
-- ============================================================

DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables
            WHERE pubname = 'supabase_realtime'
              AND schemaname = 'public' AND tablename = 'posts'
        ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
        END IF;
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables
            WHERE pubname = 'supabase_realtime'
              AND schemaname = 'public' AND tablename = 'telegram_deliveries'
        ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.telegram_deliveries;
        END IF;
    END IF;
END $$;
