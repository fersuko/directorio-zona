-- ==========================================
-- REPAIR SYSTEM SCRIPT
-- ==========================================
-- Incluye:
-- 1. Analytics Events Table & RPC (Para el Dashboard)
-- 2. Admin Access Fix (get_my_role RPC)
-- 3. Update Permissions
-- ==========================================

-- 1. ANALYTICS SCHEMA & ENHANCEMENTS
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id uuid NOT NULL, 
    event_type text NOT NULL, 
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
);

-- Settings Table (Global Toggles)
CREATE TABLE IF NOT EXISTS public.settings (
    key text PRIMARY KEY,
    value jsonb,
    updated_at timestamptz DEFAULT now()
);

-- Default moderation settings
INSERT INTO public.settings (key, value) 
VALUES ('moderation', '{"enabled": true, "filter_spam": true}') 
ON CONFLICT (key) DO NOTHING;

-- Add status to reviews
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS status text DEFAULT 'approved';

-- RPC for Analytics (Enhanced)
DROP FUNCTION IF EXISTS get_analytics_summary(text);
CREATE OR REPLACE FUNCTION get_analytics_summary(time_range text default '24h')
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    start_time timestamptz;
    result json;
BEGIN
    IF time_range = '24h' THEN start_time := now() - interval '24 hours';
    ELSIF time_range = '7d' THEN start_time := now() - interval '7 days';
    ELSIF time_range = '30d' THEN start_time := now() - interval '30 days';
    ELSE start_time := now() - interval '24 hours';
    END IF;

    SELECT json_build_object(
        'total_views', (SELECT count(*) FROM analytics_events WHERE event_type = 'page_view' AND created_at > start_time),
        'total_searches', (SELECT count(*) FROM analytics_events WHERE event_type = 'search' AND created_at > start_time),
        'business_interactions', (SELECT count(*) FROM analytics_events WHERE event_type IN ('click_call', 'click_gps', 'click_share') AND created_at > start_time),
        'total_promos_active', (SELECT count(*) FROM promotions WHERE created_at < now() AND (valid_until IS NULL OR valid_until > now())),
        'pending_reviews', (SELECT count(*) FROM reviews WHERE status = 'pending'),
        'top_businesses', (
            SELECT coalesce(json_agg(t), '[]'::json) FROM (
                SELECT metadata->>'business_name' as name, count(*) as views
                FROM analytics_events 
                WHERE event_type = 'business_view' 
                AND created_at > start_time 
                AND metadata->>'business_name' IS NOT NULL
                GROUP BY metadata->>'business_name'
                ORDER BY views DESC
                LIMIT 5
            ) t
        )
    ) INTO result;

    RETURN result;
END;
$$;

-- Grant EXECUTE to authenticated users (Dashboard calls it)
GRANT EXECUTE ON FUNCTION public.get_analytics_summary(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_analytics_summary(text) TO service_role;


-- 2. ADMIN ACCESS FIX (get_my_role)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text AS $$
DECLARE
  v_role text;
BEGIN
  SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
  RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_role() TO service_role;

-- 3. ENSURE ADMIN ROLE & PROFILE EXISTS
DO $$
DECLARE
    admin_record RECORD;
BEGIN
    FOR admin_record IN SELECT id, email FROM auth.users WHERE email IN ('fersuko@gmail.com', 'directoriozona@gmail.com')
    LOOP
        INSERT INTO public.profiles (id, email, full_name, role)
        VALUES (admin_record.id, admin_record.email, 'Admin', 'admin')
        ON CONFLICT (id) DO UPDATE 
        SET role = 'admin', email = admin_record.email;
    END LOOP;
END $$;

-- 4. FIX BUSINESSES RPC (Ensure it exists for AdminDashboard)
DROP FUNCTION IF EXISTS admin_get_all_businesses();
CREATE OR REPLACE FUNCTION admin_get_all_businesses()
RETURNS SETOF businesses
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM businesses ORDER BY created_at DESC;
$$;
GRANT EXECUTE ON FUNCTION admin_get_all_businesses() TO authenticated;
GRANT EXECUTE ON FUNCTION admin_get_all_businesses() TO service_role;

-- 5. ADMIN USERS RPC
DROP FUNCTION IF EXISTS admin_get_all_users();
CREATE OR REPLACE FUNCTION admin_get_all_users()
RETURNS TABLE (
    id uuid,
    email text,
    full_name text,
    role text,
    created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT id, email, full_name, role, created_at FROM profiles ORDER BY created_at DESC;
$$;
GRANT EXECUTE ON FUNCTION admin_get_all_users() TO authenticated;
GRANT EXECUTE ON FUNCTION admin_get_all_users() TO service_role;

-- 6. INDEXES & RLS POLICIES (Consolidated)
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_business_id ON public.analytics_events((metadata->>'business_id'));

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can insert analytics') THEN
        CREATE POLICY "Anyone can insert analytics" ON public.analytics_events FOR INSERT TO public, anon WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view analytics') THEN
        CREATE POLICY "Admins can view analytics" ON public.analytics_events FOR SELECT TO authenticated USING (
            EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
        );
    END IF;
END $$;

-- 7. ROLE SYNCHRONIZATION
-- Ensure users with businesses have the business_owner role
UPDATE public.profiles
SET role = 'business_owner'
WHERE id IN (SELECT owner_id FROM public.businesses WHERE owner_id IS NOT NULL)
AND role = 'user';

-- Ensure designated admins actually have the admin role
UPDATE public.profiles
SET role = 'admin'
WHERE email IN ('fersuko@gmail.com', 'directoriozona@gmail.com');
