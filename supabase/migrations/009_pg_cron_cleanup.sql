-- 009: pg_cron daily cleanup fallback (in-database safety net)
--
-- Belt-and-braces for storage: even if the worker sleeps, crashes, or is
-- redeployed mid-cycle, this job purges stale rows daily so the database
-- can never silently inflate toward the Supabase free-tier 500MB cap again.
--
-- Retention matches the worker (worker/archiver/old_post_archiver.py):
--   posts > 60d, raw_articles > 14d, discarded_articles > 7d, pipeline_runs > 3d
--   plus groq_usage > 90d (quota history table, worker-managed).
--
-- Deletes are ctid-bounded (20k rows/table/day) so the job can never hit a
-- statement timeout on a large backlog — it simply continues the next day.
-- A mode='cleanup' marker row (source='pg_cron') is inserted so /status and
-- health_check.sql see cleanups even when the worker is down.
--
-- Apply once via the Supabase SQL editor or MCP (DDL cannot go through PostgREST).
-- Verify afterwards:
--   SELECT jobname, schedule, active FROM cron.job WHERE jobname = 'iv-daily-cleanup';
--   SELECT status, start_time, return_message FROM cron.job_run_details ORDER BY start_time DESC LIMIT 3;
--   SELECT mode, started_at, stats FROM pipeline_runs WHERE mode = 'cleanup' ORDER BY started_at DESC LIMIT 3;

CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $outer$
BEGIN
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'iv-daily-cleanup') THEN
        PERFORM cron.unschedule('iv-daily-cleanup');
    END IF;
END
$outer$;

SELECT cron.schedule('iv-daily-cleanup', '30 3 * * *', $job$
DO $inner$
DECLARE
    posts_deleted int;
    raw_deleted int;
    discarded_deleted int;
    runs_deleted int;
    usage_deleted int;
BEGIN
    DELETE FROM posts WHERE ctid IN (
        SELECT ctid FROM posts WHERE published_at < NOW() - INTERVAL '60 days' LIMIT 20000
    );
    GET DIAGNOSTICS posts_deleted = ROW_COUNT;

    DELETE FROM raw_articles WHERE ctid IN (
        SELECT ctid FROM raw_articles WHERE fetched_at < NOW() - INTERVAL '14 days' LIMIT 20000
    );
    GET DIAGNOSTICS raw_deleted = ROW_COUNT;

    DELETE FROM discarded_articles WHERE ctid IN (
        SELECT ctid FROM discarded_articles WHERE discarded_at < NOW() - INTERVAL '7 days' LIMIT 20000
    );
    GET DIAGNOSTICS discarded_deleted = ROW_COUNT;

    DELETE FROM pipeline_runs WHERE ctid IN (
        SELECT ctid FROM pipeline_runs WHERE started_at < NOW() - INTERVAL '3 days' LIMIT 20000
    );
    GET DIAGNOSTICS runs_deleted = ROW_COUNT;

    DELETE FROM groq_usage WHERE usage_date < CURRENT_DATE - INTERVAL '90 days';
    GET DIAGNOSTICS usage_deleted = ROW_COUNT;

    INSERT INTO pipeline_runs (started_at, completed_at, mode, duration_seconds, stats)
    VALUES (NOW(), NOW(), 'cleanup', 0, jsonb_build_object(
        'source', 'pg_cron',
        'posts_deleted', posts_deleted,
        'raw_articles_deleted', raw_deleted,
        'discarded_articles_deleted', discarded_deleted,
        'pipeline_runs_deleted', runs_deleted,
        'groq_usage_deleted', usage_deleted
    ));
END
$inner$;
$job$);
