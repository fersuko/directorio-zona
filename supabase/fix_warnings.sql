-- Fix for "function_search_path_mutable" warning
-- We explicitly set the search_path to 'public' to prevent malicious search_path manipulation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 'user');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Regarding "extension_in_public":
-- It is generally safe to ignore this for this stage of the project. 
-- Moving PostGIS to another schema requires changing the database search_path configuration, 
-- which can complicate the setup.

-- Regarding "auth_leaked_password_protection":
-- This must be enabled in the Supabase Dashboard:
-- Go to Authentication -> Security -> Password protection -> Enable "Leaked password protection"
