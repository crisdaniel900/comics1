-- Migration: add/normalize product_model_id on products
-- Ejecuta esto en Supabase SQL editor o con psql contra tu DB.

-- 1) Renombrar columna legacy si existe (productmodelid -> product_model_id)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='products' AND column_name='productmodelid'
  ) THEN
    EXECUTE 'ALTER TABLE products RENAME COLUMN productmodelid TO product_model_id';
  END IF;
END;
$$;

-- 2) Añadir columna product_model_id si no existe
ALTER TABLE products
ADD COLUMN IF NOT EXISTS product_model_id integer;

-- 3) Poblar product_model_id para filas existentes con una secuencia basada en created_at
WITH seq AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) AS rn
  FROM products
)
UPDATE products p
SET product_model_id = s.rn
FROM seq s
WHERE p.id = s.id AND (p.product_model_id IS NULL OR p.product_model_id = 0);

-- 4) Crear índice/constraint único si no existe (intenta hacerlo de forma segura)
DO $$
BEGIN
  PERFORM 1 FROM pg_index WHERE indexrelid = 'idx_products_product_model_id'::regclass;
EXCEPTION WHEN undefined_table THEN
  -- index does not exist, create it
  BEGIN
    EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS idx_products_product_model_id ON products(product_model_id)';
  EXCEPTION WHEN others THEN
    RAISE NOTICE 'No se pudo crear índice único en product_model_id: %', SQLERRM;
  END;
END;
$$;

-- Nota: si tienes filas duplicadas en product_model_id (antes de la migración), la creación de índice único puede fallar.
-- Si sucede, revisa manualmente las filas duplicadas y decide cómo resolverlas (p.ej. reasignar o eliminar duplicados).
