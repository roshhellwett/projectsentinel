-- =============================================================================
-- India Verified — Database Health Check
--
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- Returns ONE result set with ~30 rows, one row per check.
-- Every row should show status='OK' and a green checkmark.
-- Any row showing 'FAIL' points at a missing/broken piece of the schema.
--
-- Read-only — this script makes no changes to the database.
-- =============================================================================

WITH

-- ---------------------------------------------------------------------------
-- 1. Extensions
-- ---------------------------------------------------------------------------
ext_check AS (
    SELECT
        'extension: ' || ext AS check_name,
        CASE WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = ext)
             THEN 'OK' ELSE 'FAIL' END AS status,
        CASE WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = ext)
             THEN 'installed'
             ELSE 'MISSING — run: CREATE EXTENSION "' || ext || '"'
        END AS detail
    FROM (VALUES ('uuid-ossp'), ('pgcrypto')) AS e(ext)
),

-- ---------------------------------------------------------------------------
-- 2. Tables exist
-- ---------------------------------------------------------------------------
table_check AS (
    SELECT
        'table: ' || tbl AS check_name,
        CASE WHEN EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = tbl
        ) THEN 'OK' ELSE 'FAIL' END AS status,
        CASE WHEN EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = tbl
        ) THEN 'exists' ELSE 'MISSING — re-run schema.sql' END AS detail
    FROM (VALUES
        ('raw_articles'),
        ('posts'),
        ('discarded_articles'),
        ('known_false_claims'),
        ('groq_usage'),
        ('pipeline_runs')
    ) AS t(tbl)
),

-- ---------------------------------------------------------------------------
-- 3. Required columns on `posts` (most schema-critical table)
-- ---------------------------------------------------------------------------
posts_cols_check AS (
    SELECT
        'posts.' || col AS check_name,
        CASE WHEN EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema='public' AND table_name='posts' AND column_name=col
        ) THEN 'OK' ELSE 'FAIL' END AS status,
        CASE WHEN EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema='public' AND table_name='posts' AND column_name=col
        ) THEN 'column present'
          ELSE 'MISSING — frontend will break'
        END AS detail
    FROM (VALUES
        ('id'), ('headline'), ('summary'), ('category'),
        ('credibility_score'), ('credibility_reason'),
        ('source_count'), ('sources'),
        ('story_fingerprint'), ('fact_check_flags'),
        ('status'), ('correction_note'),
        ('published_at'), ('updated_at')
    ) AS c(col)
),

-- ---------------------------------------------------------------------------
-- 4. Critical indexes
-- ---------------------------------------------------------------------------
index_check AS (
    SELECT
        'index: ' || idx AS check_name,
        CASE WHEN EXISTS (
            SELECT 1 FROM pg_indexes
            WHERE schemaname='public' AND indexname=idx
        ) THEN 'OK' ELSE 'FAIL' END AS status,
        CASE WHEN EXISTS (
            SELECT 1 FROM pg_indexes
            WHERE schemaname='public' AND indexname=idx
        ) THEN 'present'
          ELSE 'MISSING — queries will be slow'
        END AS detail
    FROM (VALUES
        ('idx_raw_articles_processed_fetched'),
        ('idx_raw_articles_fetched_at'),
        ('idx_posts_status_published_at'),
        ('idx_posts_category_status_published_at'),
        ('idx_posts_credibility_score'),
        ('idx_posts_story_fingerprint'),
        ('idx_posts_fts'),
        ('idx_discarded_at'),
        ('idx_discarded_reason_at'),
        ('idx_known_false_keywords'),
        ('idx_pipeline_runs_started_at')
    ) AS i(idx)
),

-- ---------------------------------------------------------------------------
-- 5. RLS enabled on all 5 protected tables
-- ---------------------------------------------------------------------------
rls_check AS (
    SELECT
        'RLS enabled on ' || c.relname AS check_name,
        CASE WHEN c.relrowsecurity THEN 'OK' ELSE 'FAIL' END AS status,
        CASE WHEN c.relrowsecurity
             THEN 'rowsecurity = true'
             ELSE 'DISABLED — anon role may access protected data'
        END AS detail
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname IN ('raw_articles','posts','discarded_articles','known_false_claims','pipeline_runs')
),

-- ---------------------------------------------------------------------------
-- 6. Expected RLS policies
-- ---------------------------------------------------------------------------
policy_check AS (
    SELECT
        'policy: ' || polname || ' on ' || tbl AS check_name,
        CASE WHEN EXISTS (
            SELECT 1 FROM pg_policies
            WHERE schemaname='public' AND tablename=tbl AND policyname=polname
        ) THEN 'OK' ELSE 'FAIL' END AS status,
        CASE WHEN EXISTS (
            SELECT 1 FROM pg_policies
            WHERE schemaname='public' AND tablename=tbl AND policyname=polname
        ) THEN 'present' ELSE 'MISSING' END AS detail
    FROM (VALUES
        ('posts',              'Posts are viewable by everyone'),
        ('posts',              'Only service role can insert posts'),
        ('posts',              'Only service role can update posts'),
        ('raw_articles',       'Raw articles service role only'),
        ('discarded_articles', 'Discarded articles service role only'),
        ('known_false_claims', 'Known false claims service role only'),
        ('pipeline_runs',      'Pipeline runs service role only')
    ) AS p(tbl, polname)
),

-- ---------------------------------------------------------------------------
-- 7. Trigger for posts.updated_at
-- ---------------------------------------------------------------------------
trigger_check AS (
    SELECT
        'trigger: update_posts_updated_at' AS check_name,
        CASE WHEN EXISTS (
            SELECT 1 FROM pg_trigger
            WHERE tgname='update_posts_updated_at' AND NOT tgisinternal
        ) THEN 'OK' ELSE 'FAIL' END AS status,
        CASE WHEN EXISTS (
            SELECT 1 FROM pg_trigger
            WHERE tgname='update_posts_updated_at' AND NOT tgisinternal
        ) THEN 'wired on posts'
          ELSE 'MISSING — updated_at will not auto-refresh'
        END AS detail
),

-- ---------------------------------------------------------------------------
-- 8. Realtime publication contains posts
-- ---------------------------------------------------------------------------
realtime_check AS (
    SELECT
        'realtime: posts in supabase_realtime publication' AS check_name,
        CASE WHEN EXISTS (
            SELECT 1 FROM pg_publication_tables
            WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='posts'
        ) THEN 'OK' ELSE 'FAIL' END AS status,
        CASE WHEN EXISTS (
            SELECT 1 FROM pg_publication_tables
            WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='posts'
        ) THEN 'frontend live push enabled'
          ELSE 'MISSING — frontend realtime subscription will silently no-op'
        END AS detail
),

-- ---------------------------------------------------------------------------
-- 9. Service role has full CRUD on every table
-- ---------------------------------------------------------------------------
service_grant_check AS (
    SELECT
        'service_role can write to ' || tbl AS check_name,
        CASE WHEN has_table_privilege('service_role', 'public.' || tbl, 'INSERT')
              AND has_table_privilege('service_role', 'public.' || tbl, 'UPDATE')
              AND has_table_privilege('service_role', 'public.' || tbl, 'SELECT')
              AND has_table_privilege('service_role', 'public.' || tbl, 'DELETE')
             THEN 'OK' ELSE 'FAIL' END AS status,
        'SELECT/INSERT/UPDATE/DELETE all granted' AS detail
    FROM (VALUES
        ('raw_articles'),
        ('posts'),
        ('discarded_articles'),
        ('known_false_claims'),
        ('groq_usage'),
        ('pipeline_runs')
    ) AS t(tbl)
),

-- ---------------------------------------------------------------------------
-- 10. Anon role can ONLY read posts (and nothing else)
-- ---------------------------------------------------------------------------
anon_grant_check AS (
    SELECT
        'anon can read posts' AS check_name,
        CASE WHEN has_table_privilege('anon', 'public.posts', 'SELECT')
             THEN 'OK' ELSE 'FAIL' END AS status,
        'public read access enabled for frontend' AS detail
    UNION ALL
    SELECT
        'anon CANNOT write posts' AS check_name,
        CASE WHEN NOT has_table_privilege('anon', 'public.posts', 'INSERT')
              AND NOT has_table_privilege('anon', 'public.posts', 'UPDATE')
              AND NOT has_table_privilege('anon', 'public.posts', 'DELETE')
             THEN 'OK' ELSE 'FAIL' END AS status,
        'anon role is correctly read-only' AS detail
    UNION ALL
    SELECT
        'anon CANNOT access ' || tbl AS check_name,
        CASE WHEN NOT has_table_privilege('anon', 'public.' || tbl, 'SELECT')
             THEN 'OK' ELSE 'FAIL' END AS status,
        'anon should never see internal tables' AS detail
    FROM (VALUES
        ('raw_articles'),
        ('discarded_articles'),
        ('known_false_claims'),
        ('groq_usage'),
        ('pipeline_runs')
    ) AS t(tbl)
),

-- ---------------------------------------------------------------------------
-- 11. Data sanity — invalid categories, score bounds, fingerprint dupes
-- ---------------------------------------------------------------------------
data_sanity_check AS (
    SELECT
        'no posts with invalid category' AS check_name,
        CASE WHEN (
            SELECT COUNT(*) FROM posts
            WHERE category NOT IN ('politics','business','sports','crime',
                                   'science','health','tech','world','entertainment','education')
        ) = 0 THEN 'OK' ELSE 'FAIL' END AS status,
        (SELECT COUNT(*) || ' invalid rows' FROM posts
         WHERE category NOT IN ('politics','business','sports','crime',
                                'science','health','tech','world','entertainment','education')
        ) AS detail
    UNION ALL
    SELECT
        'no posts with score out of [0,100]' AS check_name,
        CASE WHEN (
            SELECT COUNT(*) FROM posts WHERE credibility_score < 0 OR credibility_score > 100
        ) = 0 THEN 'OK' ELSE 'FAIL' END AS status,
        (SELECT COUNT(*) || ' invalid rows' FROM posts
         WHERE credibility_score < 0 OR credibility_score > 100) AS detail
    UNION ALL
    SELECT
        'no posts with invalid status' AS check_name,
        CASE WHEN (
            SELECT COUNT(*) FROM posts WHERE status NOT IN ('published','corrected','retracted')
        ) = 0 THEN 'OK' ELSE 'FAIL' END AS status,
        (SELECT COUNT(*) || ' invalid rows' FROM posts
         WHERE status NOT IN ('published','corrected','retracted')) AS detail
    UNION ALL
    SELECT
        'no duplicate story_fingerprints' AS check_name,
        CASE WHEN (
            SELECT COUNT(*) FROM (
                SELECT story_fingerprint FROM posts
                WHERE story_fingerprint IS NOT NULL
                GROUP BY story_fingerprint HAVING COUNT(*) > 1
            ) d
        ) = 0 THEN 'OK' ELSE 'FAIL' END AS status,
        (SELECT COUNT(*) || ' duplicate fingerprint groups' FROM (
            SELECT story_fingerprint FROM posts
            WHERE story_fingerprint IS NOT NULL
            GROUP BY story_fingerprint HAVING COUNT(*) > 1
        ) d) AS detail
    UNION ALL
    SELECT
        'no duplicate url_hash in raw_articles' AS check_name,
        CASE WHEN (
            SELECT COUNT(*) FROM (
                SELECT url_hash FROM raw_articles
                GROUP BY url_hash HAVING COUNT(*) > 1
            ) d
        ) = 0 THEN 'OK' ELSE 'FAIL' END AS status,
        (SELECT COUNT(*) || ' duplicate url_hash groups' FROM (
            SELECT url_hash FROM raw_articles
            GROUP BY url_hash HAVING COUNT(*) > 1
        ) d) AS detail
),

-- ---------------------------------------------------------------------------
-- 12. Pipeline activity — is the worker actually running?
-- ---------------------------------------------------------------------------
activity_check AS (
    SELECT
        'last pipeline run < 45 min ago' AS check_name,
        CASE WHEN (
            SELECT MAX(started_at) FROM pipeline_runs
        ) > NOW() - INTERVAL '45 minutes' THEN 'OK' ELSE 'FAIL' END AS status,
        COALESCE(
            'last run: ' || to_char(
                (SELECT MAX(started_at) FROM pipeline_runs),
                'YYYY-MM-DD HH24:MI:SS UTC'
            ),
            'NO RUNS RECORDED — worker may be down'
        ) AS detail
    UNION ALL
    SELECT
        'posts published today' AS check_name,
        CASE WHEN (
            SELECT COUNT(*) FROM posts
            WHERE published_at >= date_trunc('day', NOW())
        ) > 0 THEN 'OK' ELSE 'WARN' END AS status,
        (SELECT COUNT(*) || ' posts today' FROM posts
         WHERE published_at >= date_trunc('day', NOW())) AS detail
    UNION ALL
    SELECT
        'total published posts' AS check_name,
        'OK' AS status,
        (SELECT COUNT(*)::text || ' rows' FROM posts WHERE status = 'published') AS detail
    UNION ALL
    SELECT
        'raw_articles in last 24h' AS check_name,
        CASE WHEN (
            SELECT COUNT(*) FROM raw_articles
            WHERE fetched_at > NOW() - INTERVAL '24 hours'
        ) > 0 THEN 'OK' ELSE 'WARN' END AS status,
        (SELECT COUNT(*)::text || ' articles fetched' FROM raw_articles
         WHERE fetched_at > NOW() - INTERVAL '24 hours') AS detail
    UNION ALL
    SELECT
        'known_false_claims loaded' AS check_name,
        CASE WHEN (SELECT COUNT(*) FROM known_false_claims) > 0
             THEN 'OK' ELSE 'WARN' END AS status,
        (SELECT COUNT(*)::text || ' fact-checks indexed' FROM known_false_claims) AS detail
    UNION ALL
    SELECT
        'groq_usage rows for today' AS check_name,
        CASE WHEN EXISTS (SELECT 1 FROM groq_usage WHERE usage_date = CURRENT_DATE)
             THEN 'OK' ELSE 'WARN' END AS status,
        CASE WHEN EXISTS (SELECT 1 FROM groq_usage WHERE usage_date = CURRENT_DATE)
             THEN 'persisted (worker is alive)'
             ELSE 'no row yet — first run of the UTC day may be pending'
        END AS detail
),

-- ---------------------------------------------------------------------------
-- 13. Storage hygiene — am I about to hit the 500MB free-tier cap?
-- ---------------------------------------------------------------------------
storage_check AS (
    SELECT
        'database size' AS check_name,
        CASE WHEN pg_database_size(current_database()) < 400 * 1024 * 1024
             THEN 'OK' ELSE 'WARN' END AS status,
        pg_size_pretty(pg_database_size(current_database())) ||
            ' / 500 MB free tier' AS detail
    UNION ALL
    SELECT
        'oldest post age' AS check_name,
        CASE WHEN (
            SELECT EXTRACT(DAY FROM NOW() - MIN(published_at)) FROM posts
        ) IS NULL OR (
            SELECT EXTRACT(DAY FROM NOW() - MIN(published_at)) FROM posts
        ) < 200 THEN 'OK' ELSE 'WARN' END AS status,
        COALESCE(
            (SELECT EXTRACT(DAY FROM NOW() - MIN(published_at))::int FROM posts)::text
                || ' days (archiver deletes >180d every Monday)',
            'no posts yet'
        ) AS detail
)

-- ---------------------------------------------------------------------------
-- Final result set
-- ---------------------------------------------------------------------------
SELECT
    CASE status
        WHEN 'OK'   THEN '✅'
        WHEN 'WARN' THEN '⚠️'
        ELSE             '❌'
    END AS icon,
    status,
    check_name,
    detail
FROM (
    SELECT * FROM ext_check
    UNION ALL SELECT * FROM table_check
    UNION ALL SELECT * FROM posts_cols_check
    UNION ALL SELECT * FROM index_check
    UNION ALL SELECT * FROM rls_check
    UNION ALL SELECT * FROM policy_check
    UNION ALL SELECT * FROM trigger_check
    UNION ALL SELECT * FROM realtime_check
    UNION ALL SELECT * FROM service_grant_check
    UNION ALL SELECT * FROM anon_grant_check
    UNION ALL SELECT * FROM data_sanity_check
    UNION ALL SELECT * FROM activity_check
    UNION ALL SELECT * FROM storage_check
) all_checks
ORDER BY
    CASE status
        WHEN 'FAIL' THEN 0
        WHEN 'WARN' THEN 1
        ELSE             2
    END,
    check_name;
