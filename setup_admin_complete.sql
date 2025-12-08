-- Asegurar que los Admins tengan acceso TOTAL a todo, independientemente de las reglas de privacidad.

-- 1. Políticas de Admin para Negocios (Businesses)
-- Permite a los admins hacer TODO (Select, Insert, Update, Delete)
CREATE POLICY "Admins can do everything on businesses" ON public.businesses
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- 2. Políticas de Admin para Reseñas (Reviews)
-- Permite a los admins moderar reseñas (borrar, editar)
CREATE POLICY "Admins can manage all reviews" ON public.reviews
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- 3. Políticas de Admin para Leads (Solicitudes)
-- Asegurar que los admins puedan ver y gestionar leads
CREATE POLICY "Admins can manage leads" ON public.leads
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );
