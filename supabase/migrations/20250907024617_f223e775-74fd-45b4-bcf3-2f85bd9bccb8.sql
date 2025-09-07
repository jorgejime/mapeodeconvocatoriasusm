-- FASE 1: CORRECCIONES CRÍTICAS DE SEGURIDAD

-- 1. Arreglar políticas RLS de user_roles para prevenir exposición de emails
-- Eliminar la política actual que permite ver emails de otros usuarios
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;

-- Crear nuevas políticas más restrictivas
-- Los usuarios solo pueden ver su propio rol (sin email de otros)
CREATE POLICY "Users can view their own role only" 
ON public.user_roles 
FOR SELECT 
USING (auth.email() = email);

-- Solo administradores pueden ver todos los roles
CREATE POLICY "Admins can view all user roles" 
ON public.user_roles 
FOR SELECT 
USING (is_admin_user());

-- Solo administradores pueden insertar nuevos roles
CREATE POLICY "Admins can insert user roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (is_admin_user());

-- Solo administradores pueden actualizar roles
CREATE POLICY "Admins can update user roles" 
ON public.user_roles 
FOR UPDATE 
USING (is_admin_user());

-- Solo administradores pueden eliminar roles
CREATE POLICY "Admins can delete user roles" 
ON public.user_roles 
FOR DELETE 
USING (is_admin_user());

-- 2. Fortalecer políticas RLS de profiles para mayor seguridad
-- Eliminar política existente y recrear con mejor validación
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Nueva política más restrictiva para ver perfiles
CREATE POLICY "Users can view only their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id AND auth.email() = email);

-- Los administradores pueden ver todos los perfiles para gestión
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (is_admin_user());

-- 3. Crear función para validar que solo el usuario correcto acceda a sus datos
CREATE OR REPLACE FUNCTION public.validate_user_access(target_user_id uuid, target_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar que el usuario autenticado coincida con los datos solicitados
  RETURN (auth.uid() = target_user_id AND auth.email() = target_email);
END;
$$;