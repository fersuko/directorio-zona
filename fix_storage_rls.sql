-- ======================================================
-- SOLUCIÓN PARA PERMISOS DE ALMACENAMIENTO DE IMÁGENES
-- ======================================================

-- 1. Asegurar que el bucket sea público
UPDATE storage.buckets SET public = true WHERE id = 'business-images';

-- 2. Eliminar políticas restrictivas anteriores (si existen)
DROP POLICY IF EXISTS "Admins can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

-- 3. Crear política para ACCESO PÚBLICO (Lectura)
CREATE POLICY "Acceso Publico Lectura"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'business-images' );

-- 4. Crear política para SUBIDA (Permitir anon y auth por ahora para garantizar éxito)
-- Esta política permite que el sistema suba las fotos desde el Radar de Negocios
CREATE POLICY "Permitir Subida de Imagenes"
ON storage.objects FOR INSERT
TO public
WITH CHECK ( bucket_id = 'business-images' );

-- 5. Crear política para ACTUALIZACIÓN
CREATE POLICY "Permitir Actualizacion de Imagenes"
ON storage.objects FOR UPDATE
TO public
USING ( bucket_id = 'business-images' );

-- 6. Crear política para BORRADO (Solo Admin para seguridad)
CREATE POLICY "Solo Admins Borran"
ON storage.objects FOR DELETE
TO authenticated
USING ( 
    bucket_id = 'business-images' AND 
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- NOTA: Ejecuta esto en el editor SQL de Supabase para que el Radar de Negocios
-- pueda guardar las fotos permanentemente.
