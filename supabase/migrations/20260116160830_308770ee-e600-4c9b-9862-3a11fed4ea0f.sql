-- Fix the security definer view by explicitly setting SECURITY INVOKER
DROP VIEW IF EXISTS public.alumni_profiles_public;

CREATE VIEW public.alumni_profiles_public 
WITH (security_invoker = true) AS
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
  created_at,
  updated_at,
  claimed
FROM public.alumni_profiles
WHERE claimed = true OR claimed IS NULL;

-- Grant access to the view for anon and authenticated roles
GRANT SELECT ON public.alumni_profiles_public TO anon, authenticated;