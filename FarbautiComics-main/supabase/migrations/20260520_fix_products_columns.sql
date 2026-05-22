-- Migration: normalize product column names (rename legacy camelCase -> snake_case)
-- Ejecuta en Supabase SQL editor.

DO $$
BEGIN
  -- For each legacy column: if legacy exists and new does NOT, rename it.
  -- If both exist, copy values non-destructively (new = COALESCE(new, legacy)) and drop legacy.

  -- artistwriter -> artist_writer
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='artistwriter') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='artist_writer') THEN
      EXECUTE 'ALTER TABLE products RENAME COLUMN artistwriter TO artist_writer';
    ELSE
      EXECUTE 'UPDATE products SET artist_writer = COALESCE(artist_writer, artistwriter)';
      EXECUTE 'ALTER TABLE products DROP COLUMN IF EXISTS artistwriter';
    END IF;
  END IF;

  -- coverartist -> cover_artist
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='coverartist') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='cover_artist') THEN
      EXECUTE 'ALTER TABLE products RENAME COLUMN coverartist TO cover_artist';
    ELSE
      EXECUTE 'UPDATE products SET cover_artist = COALESCE(cover_artist, coverartist)';
      EXECUTE 'ALTER TABLE products DROP COLUMN IF EXISTS coverartist';
    END IF;
  END IF;

  -- countrymanufacture -> country_manufacture
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='countrymanufacture') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='country_manufacture') THEN
      EXECUTE 'ALTER TABLE products RENAME COLUMN countrymanufacture TO country_manufacture';
    ELSE
      EXECUTE 'UPDATE products SET country_manufacture = COALESCE(country_manufacture, countrymanufacture)';
      EXECUTE 'ALTER TABLE products DROP COLUMN IF EXISTS countrymanufacture';
    END IF;
  END IF;

  -- imagepublicid -> image_public_id
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='imagepublicid') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='image_public_id') THEN
      EXECUTE 'ALTER TABLE products RENAME COLUMN imagepublicid TO image_public_id';
    ELSE
      EXECUTE 'UPDATE products SET image_public_id = COALESCE(image_public_id, imagepublicid)';
      EXECUTE 'ALTER TABLE products DROP COLUMN IF EXISTS imagepublicid';
    END IF;
  END IF;

  -- externalid -> external_id
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='externalid') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='external_id') THEN
      EXECUTE 'ALTER TABLE products RENAME COLUMN externalid TO external_id';
    ELSE
      EXECUTE 'UPDATE products SET external_id = COALESCE(external_id, externalid)';
      EXECUTE 'ALTER TABLE products DROP COLUMN IF EXISTS externalid';
    END IF;
  END IF;

  -- productmodelid -> product_model_id
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='productmodelid') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='product_model_id') THEN
      EXECUTE 'ALTER TABLE products RENAME COLUMN productmodelid TO product_model_id';
    ELSE
      EXECUTE 'UPDATE products SET product_model_id = COALESCE(product_model_id, productmodelid)';
      EXECUTE 'ALTER TABLE products DROP COLUMN IF EXISTS productmodelid';
    END IF;
  END IF;

  -- Ensure snake_case columns exist with safe defaults where appropriate
  ALTER TABLE products ADD COLUMN IF NOT EXISTS artist_writer text NOT NULL DEFAULT 'unknown';
  ALTER TABLE products ADD COLUMN IF NOT EXISTS cover_artist text NOT NULL DEFAULT 'unknown';
  ALTER TABLE products ADD COLUMN IF NOT EXISTS country_manufacture text NOT NULL DEFAULT 'unknown';
  ALTER TABLE products ADD COLUMN IF NOT EXISTS image_public_id text;
  ALTER TABLE products ADD COLUMN IF NOT EXISTS external_id text;
  ALTER TABLE products ADD COLUMN IF NOT EXISTS product_model_id integer;

  -- Backfill external_id from id if empty (non-destructive)
  UPDATE products SET external_id = id::text WHERE external_id IS NULL OR external_id = '';

END;
$$;

-- Note: if you need uniqueness constraints (external_id/product_model_id) add them after verifying data.
