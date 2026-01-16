SELECT p.id, p.email, p.role, u.id as auth_id 
FROM public.profiles p 
FULL OUTER JOIN auth.users u ON p.id = u.id 
WHERE p.email = 'fersuko@gmail.com' OR u.email = 'fersuko@gmail.com';
