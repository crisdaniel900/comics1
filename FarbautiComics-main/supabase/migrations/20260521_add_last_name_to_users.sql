-- Add missing last_name column to users table if it is absent in the live DB.
-- This keeps the registration flow compatible with the existing backend payload.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'last_name'
  ) THEN
    ALTER TABLE public.users
    ADD COLUMN last_name text;
  END IF;
END
$$;

-- Backfill from a legacy variant if one exists, otherwise keep the column nullable.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'lastname'
  ) THEN
    EXECUTE 'UPDATE public.users SET last_name = COALESCE(last_name, lastname)';
  END IF;
END
$$;