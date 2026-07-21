-- Let approved users read the directory from alumni_profiles while keeping
-- pending/unapproved accounts blocked by RLS.
CREATE OR REPLACE FUNCTION public.can_view_alumni_directory()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL
    AND (
      EXISTS (
        SELECT 1
        FROM public.user_roles roles
        WHERE roles.user_id = auth.uid()
          AND roles.role = 'admin'::public.app_role
      )
      OR EXISTS (
        SELECT 1
        FROM public.alumni_profiles viewer_profile
        WHERE viewer_profile.user_id = auth.uid()
          OR (
            viewer_profile.user_id IS NULL
            AND viewer_profile.email IS NOT NULL
            AND lower(viewer_profile.email) = lower(auth.jwt() ->> 'email')
          )
      )
    );
$$;

REVOKE ALL ON FUNCTION public.can_view_alumni_directory() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_view_alumni_directory() TO authenticated;

DROP POLICY IF EXISTS "Approved users can view directory profiles" ON public.alumni_profiles;

CREATE POLICY "Approved users can view directory profiles"
ON public.alumni_profiles
FOR SELECT
USING (public.can_view_alumni_directory());
