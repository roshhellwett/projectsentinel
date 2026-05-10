-- Migration 004: backfill pipeline_runs columns that 001 did not include.
-- Migration 003 used CREATE TABLE IF NOT EXISTS, so if the table already existed
-- from 001, the stats/duration_seconds columns were never added.
-- This migration is fully idempotent and safe to run at any time.

ALTER TABLE pipeline_runs ADD COLUMN IF NOT EXISTS duration_seconds NUMERIC;
ALTER TABLE pipeline_runs ADD COLUMN IF NOT EXISTS stats             JSONB;

-- Ensure the RLS policy exists regardless of which migration created the table.
ALTER TABLE pipeline_runs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename  = 'pipeline_runs'
          AND policyname = 'Pipeline runs service role only'
    ) THEN
        CREATE POLICY "Pipeline runs service role only"
            ON pipeline_runs FOR ALL USING (false);
    END IF;
END $$;
