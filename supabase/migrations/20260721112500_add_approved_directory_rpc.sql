-- Return the safe public directory only to signed-in users who have an
-- approved profile, or to admins. This avoids relying on view/RLS behavior.
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
  WHERE auth.uid() IS NOT NULL
    AND (
      public.has_role(auth.uid(), 'admin'::public.app_role)
      OR EXISTS (
        SELECT 1
        FROM public.alumni_profiles current_user_profile
        WHERE current_user_profile.user_id = auth.uid()
          OR (
            current_user_profile.user_id IS NULL
            AND current_user_profile.claimed = false
            AND current_user_profile.email IS NOT NULL
            AND lower(current_user_profile.email) = lower(auth.jwt() ->> 'email')
          )
      )
    )
  ORDER BY p.graduation_year DESC, p.full_name ASC;
$$;

REVOKE ALL ON FUNCTION public.get_approved_alumni_directory() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_approved_alumni_directory() TO authenticated;
