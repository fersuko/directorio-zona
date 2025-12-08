-- Enable RLS on businesses if not already enabled
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can do everything on businesses
CREATE POLICY "Admins can do everything on businesses" ON public.businesses
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Policy: Admins can insert businesses
-- (The above FOR ALL covers insert, update, delete, select)

-- Ensure profiles table has RLS enabled and is readable by authenticated users
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

-- Ensure leads table is accessible to admins
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage leads" ON public.leads
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Allow public to insert leads (for Join form)
CREATE POLICY "Public can insert leads" ON public.leads
    FOR INSERT WITH CHECK (true);
