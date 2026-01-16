-- Script para permitir que los dueños vean sus propias analíticas

-- Política para permitir a los dueños ver sus eventos de analíticas
DROP POLICY IF EXISTS "Owners can view their own business analytics" ON public.analytics_events;
CREATE POLICY "Owners can view their own business analytics" 
ON public.analytics_events 
FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.businesses 
        WHERE businesses.owner_id = auth.uid() 
        AND businesses.id::text = (analytics_events.metadata->>'business_id')
    )
);

-- Asegurar que los dueños puedan ver sus propias reseñas (ya existe, pero por si acaso)
-- La política global ya permite ver reseñas (true), pero esto es para claridad
DROP POLICY IF EXISTS "Owners can view reviews of their businesses" ON public.reviews;
CREATE POLICY "Owners can view reviews of their businesses"
ON public.reviews
FOR SELECT
TO authenticated
USING (true);
