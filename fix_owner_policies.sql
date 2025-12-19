-- Enable RLS on businesses just in case
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Policy: Owners can update their own business
DROP POLICY IF EXISTS "Owners can update their own business" ON public.businesses;
CREATE POLICY "Owners can update their own business"
ON public.businesses
FOR UPDATE
USING (auth.uid() = owner_id);

-- Policy: Owners can view their own business (already covered by public select usually, but good to ensure)
DROP POLICY IF EXISTS "Owners can view their own business" ON public.businesses;
CREATE POLICY "Owners can view their own business"
ON public.businesses
FOR SELECT
USING (auth.uid() = owner_id OR true); -- Public select is usually just true

-- STORAGE POLICIES
-- Ensure bucket exists (this part usually requires the dashboard, but we can set policies)
-- Note: 'business-images' bucket must be Created in Supabase Storage Dashboard as Public.

-- Policy: Allow authenticated uploads to 'business-images'
-- (Adjust logic if you want strict ownership check on filename, but this is a good start)
BEGIN;
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('business-images', 'business-images', true)
  ON CONFLICT (id) DO NOTHING;
COMMIT;

DROP POLICY IF EXISTS "Give users access to own folder 1qq819_0" ON storage.objects;
DROP POLICY IF EXISTS "Images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;

-- Allow public read access to business images
CREATE POLICY "Images are publicly accessible"
ON storage.objects FOR SELECT
USING ( bucket_id = 'business-images' );

-- Allow authenticated users (owners) to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'business-images' 
  AND auth.role() = 'authenticated'
);

-- Allow users to update/delete their own images
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
USING ( auth.uid() = owner )
WITH CHECK ( bucket_id = 'business-images' );

CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING ( auth.uid() = owner AND bucket_id = 'business-images' );
