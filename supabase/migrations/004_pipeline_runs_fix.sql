
ALTER TABLE pipeline_runs ADD COLUMN IF NOT EXISTS duration_seconds NUMERIC;
ALTER TABLE pipeline_runs ADD COLUMN IF NOT EXISTS stats             JSONB;

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
