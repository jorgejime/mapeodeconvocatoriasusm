-- CRITICAL SECURITY FIX: Enable RLS on convocatorias table
ALTER TABLE public.convocatorias ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies for convocatorias
-- Allow authenticated users to view all convocatorias
CREATE POLICY "Authenticated users can view convocatorias" 
ON public.convocatorias 
FOR SELECT 
TO authenticated
USING (true);

-- Allow authenticated users to create convocatorias
CREATE POLICY "Authenticated users can create convocatorias" 
ON public.convocatorias 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update convocatorias
CREATE POLICY "Authenticated users can update convocatorias" 
ON public.convocatorias 
FOR UPDATE 
TO authenticated
USING (true);

-- Allow authenticated users to delete convocatorias
CREATE POLICY "Authenticated users can delete convocatorias" 
ON public.convocatorias 
FOR DELETE 
TO authenticated
USING (true);

-- Fix function search path security issue
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public;