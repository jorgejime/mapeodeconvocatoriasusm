-- Drop all existing convocatorias policies first
DROP POLICY IF EXISTS "Admins can create convocatorias" ON public.convocatorias;
DROP POLICY IF EXISTS "Admins can update convocatorias" ON public.convocatorias;
DROP POLICY IF EXISTS "Admins can delete convocatorias" ON public.convocatorias;

-- Now create the new policies
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