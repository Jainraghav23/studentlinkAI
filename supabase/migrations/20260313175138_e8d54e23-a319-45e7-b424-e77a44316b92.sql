DROP VIEW IF EXISTS public.alumni_profiles_public;
CREATE VIEW public.alumni_profiles_public AS
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
  claimed,
  user_id,
  candidate_type,
  country,
  created_at,
  updated_at
FROM public.alumni_profiles;

GRANT SELECT ON public.alumni_profiles_public TO anon, authenticated;