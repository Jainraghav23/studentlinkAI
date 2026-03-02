CREATE POLICY "Admins can update profiles"
ON public.alumni_profiles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));