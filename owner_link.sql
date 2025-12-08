-- Add owner_id to businesses table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'owner_id') THEN
        ALTER TABLE public.businesses ADD COLUMN owner_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Policy: Owners can update their own business
CREATE POLICY "Owners can update their own business" ON public.businesses
    FOR UPDATE USING (
        auth.uid() = owner_id
    );

-- Policy: Owners can view their own business (already covered by public select, but good for RLS if we restrict it later)
