-- Script para agregar las columnas que faltan en la tabla businesses
-- Esto arreglará el error al crear negocios desde el Admin

-- Agregar columnas faltantes
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS group_name TEXT,
ADD COLUMN IF NOT EXISTS lat NUMERIC,
ADD COLUMN IF NOT EXISTS lng NUMERIC;

-- Verificar que se agregaron correctamente
SELECT 
    column_name,
    data_type
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public' 
    AND table_name = 'businesses'
    AND column_name IN ('phone', 'website', 'group_name', 'lat', 'lng')
ORDER BY 
    column_name;
