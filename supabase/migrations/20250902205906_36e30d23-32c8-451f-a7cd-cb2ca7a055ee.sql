-- Add RLS policies for user_roles table
CREATE POLICY "Users can view roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (true);

-- Function to check if user has admin role (security definer to prevent RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = user_uuid AND role = 'administrador'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Only admins can manage user roles
CREATE POLICY "Admins can manage user roles" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());