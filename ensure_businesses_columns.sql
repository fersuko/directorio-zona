-- Script para asegurar que la tabla businesses tenga todas las columnas necesarias
-- Ejecuta esto en el SQL Editor de Supabase

-- Agregar columnas faltantes si no existen
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS group_name TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Verificar que las columnas de rating existan (del script anterior)
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Asegurar que las columnas clave existan
ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS plan_id TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;

-- Mostrar el esquema final
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public' 
    AND table_name = 'businesses'
ORDER BY 
    ordinal_position;
