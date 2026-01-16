-- ==========================================================
-- AUTOMATIC BUSINESS OWNER ROLE PROMOTION
-- ==========================================================

-- Function to promote a user to business_owner when assigned a business
CREATE OR REPLACE FUNCTION public.handle_business_owner_promotion()
RETURNS TRIGGER AS $$
BEGIN
    -- If a new owner is assigned (INSERT or UPDATE)
    IF NEW.owner_id IS NOT NULL THEN
        -- Promote the user to 'business_owner' if they are currently a 'user'
        -- We don't demote 'admin' roles.
        UPDATE public.profiles
        SET role = 'business_owner',
            updated_at = now()
        WHERE id = NEW.owner_id
          AND role = 'user';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run on every business insert or update
DROP TRIGGER IF EXISTS on_business_owner_change ON public.businesses;
CREATE TRIGGER on_business_owner_change
    AFTER INSERT OR UPDATE OF owner_id ON public.businesses
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_business_owner_promotion();

-- ONE-TIME SYNC: Fix all existing business owners who are still marked as 'user'
-- This addresses users like 'fracty' and the owner of 'Black Cafe'
UPDATE public.profiles
SET role = 'business_owner',
    updated_at = now()
WHERE id IN (
    SELECT DISTINCT owner_id 
    FROM public.businesses 
    WHERE owner_id IS NOT NULL
)
AND role = 'user';

-- VERIFICATION
SELECT email, full_name, role 
FROM profiles 
WHERE id IN (SELECT owner_id FROM businesses);
