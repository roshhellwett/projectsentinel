-- Migration 005: add `education` to the posts.category CHECK constraint.
--
-- Migration 003 introduced `entertainment` but stopped at 9 categories. The
-- master schema.sql, the worker's valid_categories whitelist, the frontend
-- TypeScript Category union, and the frontend VALID_CATEGORIES set all expect
-- 10 categories — `education` is the missing one. Without this migration,
-- any post the worker tries to publish with category='education' is rejected
-- by Postgres and silently dropped, breaking the rhythm between the
-- verification pipeline and the published feed.
--
-- Fully idempotent: drops the existing constraint (under any of its known
-- names) and recreates it with the full 10-category list.

DO $$
DECLARE
    con_name TEXT;
BEGIN
    -- Find any existing category-check constraint regardless of its generated name.
    SELECT conname INTO con_name
    FROM pg_constraint
    WHERE conrelid = 'public.posts'::regclass
      AND contype  = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%category%IN%(%';

    IF con_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE posts DROP CONSTRAINT ' || quote_ident(con_name);
    END IF;

    ALTER TABLE posts ADD CONSTRAINT posts_category_check
        CHECK (category IN (
            'politics', 'business', 'sports', 'crime',
            'science',  'health',   'tech',   'world',
            'entertainment', 'education'
        ));
END $$;
