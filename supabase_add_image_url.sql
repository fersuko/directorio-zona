-- Add image_url column to businesses table
-- This SQL should be run in your Supabase SQL Editor

-- Add the image_url column
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add a comment explaining the column
COMMENT ON COLUMN public.businesses.image_url IS 'URL of the business image uploaded to Supabase Storage';
