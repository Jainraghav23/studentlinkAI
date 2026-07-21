-- Keep the public directory view readable by approved users without exposing
-- private profile fields from the base alumni_profiles table.
DROP VIEW IF EXISTS public.alumni_profiles_public;

DROP POLICY IF EXISTS "Anyone can view alumni profiles basic info" ON public.alumni_profiles;

CREATE VIEW public.alumni_profiles_public
WITH (security_barrier = true) AS
SELECT
  id,
  full_name,
  graduation_year,
  job_title,
  company,
  location,
  specialization,
  linkedin_url,
  bio,
  avatar_url,
  candidate_type,
  country,
  claimed,
  user_id,
  created_at,
  updated_at,
  is_distinguished
FROM public.alumni_profiles;

GRANT SELECT ON public.alumni_profiles_public TO anon, authenticated;
