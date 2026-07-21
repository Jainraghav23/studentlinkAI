-- Treat approved profiles that match the signed-in email as access-granting
-- even if older approval flows left claimed=true and user_id=NULL.
CREATE OR REPLACE FUNCTION public.get_approved_alumni_directory()
RETURNS TABLE (
  id uuid,
  full_name text,
  graduation_year integer,
  job_title text,
  company text,
  location text,
  specialization text,
  linkedin_url text,
  bio text,
  avatar_url text,
  candidate_type text,
  country text,
  claimed boolean,
  user_id uuid,
  created_at timestamptz,
  updated_at timestamptz,
  is_distinguished boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH viewer AS (
    SELECT
      auth.uid() AS id,
      lower(auth.jwt() ->> 'email') AS email
  ),
  viewer_access AS (
    SELECT EXISTS (
      SELECT 1
      FROM public.user_roles roles
      JOIN viewer ON viewer.id = roles.user_id
      WHERE roles.role = 'admin'::public.app_role
    ) OR EXISTS (
      SELECT 1
      FROM public.alumni_profiles current_user_profile
      JOIN viewer ON true
      WHERE current_user_profile.user_id = viewer.id
        OR (
          current_user_profile.user_id IS NULL
          AND current_user_profile.email IS NOT NULL
          AND lower(current_user_profile.email) = viewer.email
        )
    ) AS can_view
  )
  SELECT
    p.id,
    p.full_name,
    p.graduation_year,
    p.job_title,
    p.company,
    p.location,
    p.specialization,
    p.linkedin_url,
    p.bio,
    p.avatar_url,
    p.candidate_type,
    p.country,
    p.claimed,
    p.user_id,
    p.created_at,
    p.updated_at,
    p.is_distinguished
  FROM public.alumni_profiles p
  CROSS JOIN viewer
  CROSS JOIN viewer_access
  WHERE viewer.id IS NOT NULL
    AND viewer_access.can_view
  ORDER BY p.graduation_year DESC, p.full_name ASC;
$$;

REVOKE ALL ON FUNCTION public.get_approved_alumni_directory() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_approved_alumni_directory() TO authenticated;
