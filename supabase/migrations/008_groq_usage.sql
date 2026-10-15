-- 008: Groq API key usage persistence (per UTC day)
--
-- The worker persists daily per-key call/token counts here so that Groq quota
-- budgets survive worker restarts. The table was missing from earlier
-- migrations, so save_key_stats/load_key_stats silently no-opped (returning [])
-- and every deploy reset all quota counters.

CREATE TABLE IF NOT EXISTS groq_usage (
    usage_date DATE PRIMARY KEY,
    key_stats JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE groq_usage ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'groq_usage' AND policyname = 'Groq usage service role only') THEN
        CREATE POLICY "Groq usage service role only" ON groq_usage FOR ALL USING (false);
    END IF;
END
$$;
