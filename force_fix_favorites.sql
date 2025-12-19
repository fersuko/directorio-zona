-- FORCE CLEANUP: Drop table to ensure fresh schema
DROP TABLE IF EXISTS public.favorites CASCADE;

-- 2. Create Favorites Table (Correct UUID Types)
CREATE TABLE public.favorites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL, 
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, business_id)
);

-- Enable RLS for Favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Favorites Policies
CREATE POLICY "Users can view own favorites" 
ON public.favorites FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" 
ON public.favorites FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" 
ON public.favorites FOR DELETE 
USING (auth.uid() = user_id);
