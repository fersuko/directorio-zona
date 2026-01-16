-- RPC: Obtener mi rol de forma segura
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text AS $$
DECLARE
  v_role text;
BEGIN
  SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
  RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Asegurar permisos
GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_role() TO service_role;

-- Re-verificar admin (just in case)
UPDATE public.profiles 
SET role = 'admin' 
WHERE email IN ('fersuko@gmail.com', 'directoriozona@gmail.com');

-- Confirmar éxito
DO $$
DECLARE
  v_role text;
BEGIN
  SELECT role INTO v_role FROM public.profiles WHERE email = 'fersuko@gmail.com';
  RAISE NOTICE 'Rol actual de fersuko@gmail.com: %', v_role;
END $$;
