-- Script para verificar el esquema de la tabla businesses
-- Ejecuta esto en el SQL Editor de Supabase para ver qué columnas existen

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
