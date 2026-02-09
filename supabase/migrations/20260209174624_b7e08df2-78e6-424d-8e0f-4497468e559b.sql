-- Fix: Replace security definer view with security invoker view
DROP VIEW IF EXISTS public.alumni_profiles_public;

CREATE VIEW public.alumni_profiles_public
WITH (security_invoker = on) AS
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

-- Re-add public SELECT policy on base table (needed for security_invoker view to work)
-- The view itself excludes email and claim_token columns
CREATE POLICY "Anyone can view alumni profiles basic info" 
ON public.alumni_profiles 
FOR SELECT 
USING (true);