-- First drop all policies that depend on the is_admin function
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

-- Now drop the function safely
DROP FUNCTION IF EXISTS public.is_admin(UUID);

-- Create new function to check if user is admin based on email
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.email() = 'admin@usm.edu.co';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to get user role by email  
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN CASE 
    WHEN auth.email() = 'admin@usm.edu.co' THEN 'administrador'
    WHEN auth.email() = 'rectoria@usm.edu.co' THEN 'usuario'
    ELSE 'usuario'
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update RLS policies for convocatorias to handle role-based access
DROP POLICY IF EXISTS "Authenticated users can create convocatorias" ON public.convocatorias;
DROP POLICY IF EXISTS "Authenticated users can update convocatorias" ON public.convocatorias;  
DROP POLICY IF EXISTS "Authenticated users can delete convocatorias" ON public.convocatorias;

-- Admin can do everything, users can only read
CREATE POLICY "Admins can create convocatorias" 
ON public.convocatorias 
FOR INSERT 
TO authenticated
WITH CHECK (public.is_admin_user());

CREATE POLICY "Admins can update convocatorias" 
ON public.convocatorias 
FOR UPDATE 
TO authenticated
USING (public.is_admin_user());

CREATE POLICY "Admins can delete convocatorias" 
ON public.convocatorias 
FOR DELETE 
TO authenticated
USING (public.is_admin_user());