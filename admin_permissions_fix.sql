-- ==========================================
-- ADMIN PERMISSIONS FIX SCRIPT
-- ==========================================
-- Ejecutar en Supabase SQL Editor
-- Corrige permisos de Leads, Businesses, y gestión de usuarios
-- ==========================================

-- 1. FIX LEADS POLICIES FOR ADMINS
-- Asegurar que los admins pueden ver, crear, actualizar y eliminar leads

-- Drop existing policies to recreate them cleanly
DROP POLICY IF EXISTS "Admins can view leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can update leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can delete leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can insert leads" ON public.leads;

-- Recreate with proper permissions
CREATE POLICY "Admins can view leads" ON public.leads
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can update leads" ON public.leads
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can delete leads" ON public.leads
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- 2. FIX BUSINESSES UPDATE POLICY FOR ADMINS
DROP POLICY IF EXISTS "Admins can update all businesses" ON public.businesses;

CREATE POLICY "Admins can update all businesses" ON public.businesses
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- 3. FIX BUSINESSES INSERT POLICY FOR ADMINS (para crear negocios)
DROP POLICY IF EXISTS "Admins can insert businesses" ON public.businesses;

CREATE POLICY "Admins can insert businesses" ON public.businesses
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- 4. IMPROVED ADMIN GET ALL USERS FUNCTION
-- Ahora incluye información del negocio asignado (deduplicado)
DROP FUNCTION IF EXISTS admin_get_all_users();
CREATE OR REPLACE FUNCTION admin_get_all_users()
RETURNS TABLE (
    id uuid,
    email text,
    full_name text,
    role text,
    created_at timestamptz,
    business_id bigint, -- Devuelve el ID de uno de los negocios (el primero)
    business_name text -- Devuelve una lista de nombres si hay varios
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        p.id, 
        p.email, 
        p.full_name, 
        p.role, 
        p.created_at,
        MIN(b.id) as business_id,
        STRING_AGG(b.name, ', ') as business_name
    FROM profiles p
    LEFT JOIN businesses b ON b.owner_id = p.id
    GROUP BY p.id, p.email, p.full_name, p.role, p.created_at
    ORDER BY p.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION admin_get_all_users() TO authenticated;
GRANT EXECUTE ON FUNCTION admin_get_all_users() TO service_role;

-- 5. ADMIN UPDATE USER ROLE FUNCTION (más seguro)
DROP FUNCTION IF EXISTS admin_update_user_role(uuid, text);
CREATE OR REPLACE FUNCTION admin_update_user_role(target_user_id uuid, new_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verify caller is admin
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
        RAISE EXCEPTION 'Access denied: You must be an admin';
    END IF;
    
    -- Validate role value
    IF new_role NOT IN ('admin', 'business_owner', 'user') THEN
        RAISE EXCEPTION 'Invalid role: must be admin, business_owner, or user';
    END IF;
    
    -- Update the role
    UPDATE profiles SET role = new_role, updated_at = now() WHERE id = target_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_update_user_role(uuid, text) TO authenticated;

-- 6. Sync existing business owners to have the correct role
UPDATE public.profiles
SET role = 'business_owner'
WHERE id IN (SELECT DISTINCT owner_id FROM public.businesses WHERE owner_id IS NOT NULL)
AND role = 'user';

-- Verify the changes
SELECT 'Leads policies:' as check_type, count(*) as count FROM pg_policies WHERE tablename = 'leads';
SELECT 'Business policies:' as check_type, count(*) as count FROM pg_policies WHERE tablename = 'businesses';
SELECT 'Users by role:' as check_type, role, count(*) FROM profiles GROUP BY role;
