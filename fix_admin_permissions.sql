-- Política para permitir a los admins actualizar CUALQUIER perfil
-- Esto es necesario para promover usuarios a 'business_owner' desde el dashboard

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Verificación
SELECT * FROM pg_policies WHERE tablename = 'profiles';
