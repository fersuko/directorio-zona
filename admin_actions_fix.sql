-- ==========================================
-- ADMIN ACTIONS & POLICIES FIX
-- ==========================================

-- 1. FIX DELETE POLICY FOR ADMINS ON BUSINESSES
DROP POLICY IF EXISTS "Admins can delete businesses" ON public.businesses;
CREATE POLICY "Admins can delete businesses" ON public.businesses
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- 2. FIX SELECT POLICY FOR ADMINS (Ensure they see ALL businesses, including hidden ones)
-- Drop the restrictive policy if it exists
DROP POLICY IF EXISTS "businesses_select_visible" ON public.businesses;

-- Policy for regular users: only see non-hidden businesses
CREATE POLICY "Public can view non-hidden businesses" ON public.businesses
    FOR SELECT TO public, anon, authenticated
    USING (COALESCE(is_hidden, false) = false);

-- Policy for admins: see EVERYTHING
CREATE POLICY "Admins can view ALL businesses" ON public.businesses
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Policy for owners: see their own businesses even if hidden
CREATE POLICY "Owners can view their own businesses" ON public.businesses
    FOR SELECT TO authenticated
    USING (auth.uid() = owner_id);

-- 3. ENSURE is_hidden COLUMN EXISTS AND IS DEFAULT FALSE
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT false;

-- 4. FIX OTHER MISSING POLICIES FOR ADMINS (Reviews, Promotions)
DROP POLICY IF EXISTS "Admins can manage all reviews" ON public.reviews;
CREATE POLICY "Admins can manage all reviews" ON public.reviews
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can manage all promotions" ON public.promotions;
CREATE POLICY "Admins can manage all promotions" ON public.promotions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Log the changes
SELECT 'Policies updated for Businesses, Reviews and Promotions' as status;
