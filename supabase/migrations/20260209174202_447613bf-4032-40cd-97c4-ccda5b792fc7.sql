-- Create a public view that excludes sensitive columns (email, claim_token)
-- This view runs as the definer (owner), bypassing base table RLS
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
    created_at,
    updated_at
FROM public.alumni_profiles;

-- Grant access to the view for anonymous and authenticated users
GRANT SELECT ON public.alumni_profiles_public TO anon, authenticated;

-- Remove the overly permissive public SELECT policy from the base table
-- This prevents direct API access to sensitive columns (email, claim_token)
DROP POLICY IF EXISTS "Anyone can view alumni profiles basic info" ON public.alumni_profiles;