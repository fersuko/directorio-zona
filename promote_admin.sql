-- ==========================================
-- SCRIPT PARA PROMOVER USUARIO A SUPER ADMIN
-- ==========================================

-- Instrucciones:
-- 1. Reemplaza 'TU_EMAIL_AQUI' con el correo del usuario que quieres hacer admin.
-- 2. Ejecuta este script en el SQL Editor de Supabase.

UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'TU_EMAIL_AQUI' -- <--- PON EL EMAIL AQUÍ
);

-- Verificación (Opcional)
SELECT * FROM public.profiles WHERE role = 'admin';
