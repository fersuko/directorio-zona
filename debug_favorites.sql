-- Check count of favorites
SELECT count(*) FROM public.favorites;

-- Check favorites for the specific user (if we can identify them, otherwise list top users)
SELECT user_id, count(*) FROM public.favorites GROUP BY user_id;

-- Show a few raw rows to verify structure
SELECT * FROM public.favorites LIMIT 5;
