-- Fix critical security vulnerability in user_roles table
-- Drop the existing vulnerable policy that allows all users to see all roles and emails
DROP POLICY IF EXISTS "Users can view roles" ON public.user_roles;

-- Create secure policies that protect user privacy
-- Policy 1: Users can only view their own role
CREATE POLICY "Users can view their own role" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (email = auth.email());

-- Policy 2: Administrators can view all roles for management purposes
CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (is_admin_user());

-- Ensure the table still has proper RLS enabled
-- (This should already be enabled, but adding for safety)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;