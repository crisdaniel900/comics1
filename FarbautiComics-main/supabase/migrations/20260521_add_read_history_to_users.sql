-- Add missing read_history column to users table if it is absent in the live DB.
-- This keeps the library/read flow compatible with the backend.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'read_history'
  ) THEN
    ALTER TABLE public.users
    ADD COLUMN read_history uuid[] NOT NULL DEFAULT '{}';
  END IF;
END
$$;

-- Backfill from a legacy variant if one exists.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'readhistory'
  ) THEN
    EXECUTE 'UPDATE public.users SET read_history = COALESCE(read_history, readhistory)';
  END IF;
END
$$;