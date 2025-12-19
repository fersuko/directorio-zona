-- Script para habilitar CRUD completo en Admin Dashboard
-- Políticas RLS para que los admins puedan eliminar y ocultar negocios/leads

-- 1. Verificar y agregar columna is_hidden si no existe
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT false;

-- 2. Política para que admins puedan ELIMINAR negocios
DROP POLICY IF EXISTS "Admins can delete businesses" ON public.businesses;
CREATE POLICY "Admins can delete businesses" ON public.businesses
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 3. Política para que admins puedan ELIMINAR leads
DROP POLICY IF EXISTS "Admins can delete leads" ON public.leads;
CREATE POLICY "Admins can delete leads" ON public.leads
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 4. Asegurar que admins puedan ACTUALIZAR cualquier negocio (para edición)
-- Esta política probablemente ya existe, pero la recreamos para asegurar
DROP POLICY IF EXISTS "Admins can update all businesses" ON public.businesses;
CREATE POLICY "Admins can update all businesses" ON public.businesses
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 5. Asegurar que admins puedan ACTUALIZAR leads (para marcar como cerrado/resuelto)
DROP POLICY IF EXISTS "Admins can update leads" ON public.leads;
CREATE POLICY "Admins can update leads" ON public.leads
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Verificar que is_hidden se agregó correctamente
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'businesses' AND column_name = 'is_hidden';
