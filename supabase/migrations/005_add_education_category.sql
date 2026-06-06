
DO $$
DECLARE
    con_name TEXT;
BEGIN
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
