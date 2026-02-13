-- Allow admins to delete any alumni profile
CREATE POLICY "Admins can delete profiles"
ON public.alumni_profiles
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));