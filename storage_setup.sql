-- ==========================================
-- SUPABASE STORAGE SETUP FOR BUSINESS IMAGES
-- ==========================================

-- 1. Create the bucket if it doesn't exist
-- Note: In Supabase, buckets are typically created via the dashboard, 
-- but we can ensure policies are set up.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('business-images', 'business-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS for the bucket (handled by storage schema)

-- 3. DROP existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete images" ON storage.objects;

-- 4. Set up policies

-- ALLOW PUBLIC READ ACCESS
CREATE POLICY "Public Access" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id = 'business-images');

-- ALLOW AUTHENTICATED ADMINS TO INSERT/UPLOAD
CREATE POLICY "Admins can upload images" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'business-images' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- ALLOW AUTHENTICATED ADMINS TO UPDATE
CREATE POLICY "Admins can update images" ON storage.objects
    FOR UPDATE TO authenticated
    USING (
        bucket_id = 'business-images' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- ALLOW AUTHENTICATED ADMINS TO DELETE
CREATE POLICY "Admins can delete images" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'business-images' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

SELECT 'Storage bucket and policies configured' as status;
