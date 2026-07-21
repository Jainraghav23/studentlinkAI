-- Directory data source used after the app has already confirmed the viewer is
-- signed in and approved. Returns only safe public profile fields.
CREATE OR REPLACE FUNCTION public.get_directory_profiles()
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
  country text
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
    p.country
  FROM public.alumni_profiles p
  ORDER BY p.graduation_year DESC, p.full_name ASC;
$$;

REVOKE ALL ON FUNCTION public.get_directory_profiles() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_directory_profiles() TO authenticated;
