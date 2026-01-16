-- Check the 10 most recently created businesses
SELECT id, name, created_at, owner_id, is_hidden, category 
FROM public.businesses 
ORDER BY created_at DESC 
LIMIT 10;

-- Check total count
SELECT count(*) FROM public.businesses;

-- Check if any businesses exist with the expected names (e.g. from the user's search)
SELECT * FROM public.businesses WHERE name ILIKE '%Taquería%' OR name ILIKE '%Cafetería%' OR name ILIKE '%MALA HIERBA%';
