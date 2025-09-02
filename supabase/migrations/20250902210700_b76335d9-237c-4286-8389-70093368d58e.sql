-- Drop the existing is_admin function and recreate it properly
DROP FUNCTION IF EXISTS public.is_admin(UUID);
DROP FUNCTION IF EXISTS public.is_admin(TEXT);
DROP FUNCTION IF EXISTS public.is_admin();

-- Create function to get user role by email  
CREATE OR REPLACE FUNCTION public.get_user_role(user_email TEXT DEFAULT auth.email())
RETURNS TEXT AS $$
BEGIN
  RETURN CASE 
    WHEN user_email = 'admin@usm.edu.co' THEN 'administrador'
    WHEN user_email = 'rectoria@usm.edu.co' THEN 'usuario'
    ELSE 'usuario'
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin_user(user_email TEXT DEFAULT auth.email())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN user_email = 'admin@usm.edu.co';
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

-- Update the handle_new_user function to assign roles based on email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'),
    public.get_user_role(NEW.email)
  )
  ON CONFLICT (email) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;