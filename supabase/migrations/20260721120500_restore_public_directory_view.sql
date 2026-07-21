-- The app gates directory access before rendering it. This view exposes only
-- safe directory fields and intentionally does not use security_invoker, so it
-- does not inherit the base table's "own profile only" RLS behavior.
DROP VIEW IF EXISTS public.alumni_profiles_public;

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
