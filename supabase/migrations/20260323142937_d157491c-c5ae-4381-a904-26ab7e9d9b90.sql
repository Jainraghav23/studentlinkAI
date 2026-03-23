
-- Recreate view with SECURITY INVOKER to respect caller's RLS
DROP VIEW IF EXISTS public.alumni_profiles_public;
CREATE VIEW public.alumni_profiles_public WITH (security_barrier = true, security_invoker = true) AS
SELECT
  id, full_name, graduation_year, job_title, company, location,
  specialization, linkedin_url, bio, avatar_url, candidate_type,
  country, claimed, user_id, created_at, updated_at, is_distinguished
FROM public.alumni_profiles;
