-- For true column-level security, we need security definer view
-- This is intentional - the view owner can access the base table,
-- but only exposes safe columns to API consumers

DROP VIEW IF EXISTS public.alumni_profiles_public;

-- Remove the public SELECT policy from base table to prevent direct access
DROP POLICY IF EXISTS "Anyone can view alumni profiles basic info" ON public.alumni_profiles;

-- Create security definer view (intentional - provides column-level security)
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
    claimed,
    user_id,
    created_at,
    updated_at
FROM public.alumni_profiles;

-- Grant access to the view
GRANT SELECT ON public.alumni_profiles_public TO anon, authenticated;