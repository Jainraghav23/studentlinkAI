-- Allow admins to view all user roles
CREATE POLICY "Admins can view all user roles"
ON public.user_roles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to insert new admin roles
CREATE POLICY "Admins can grant admin roles"
ON public.user_roles
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete admin roles (but not their own)
CREATE POLICY "Admins can revoke admin roles"
ON public.user_roles
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role) AND user_id != auth.uid());