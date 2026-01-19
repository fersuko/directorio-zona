-- Añadir columna de metadatos si no existe
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Comentario para documentación
COMMENT ON COLUMN public.businesses.metadata IS 'Datos adicionales como google_photo_ref para reparaciones de imágenes.';
