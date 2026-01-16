-- Create a public view that excludes sensitive fields (email, claim_token)
CREATE OR REPLACE VIEW public.alumni_profiles_public AS
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

-- Update the original table's SELECT policy to be more restrictive
-- Only profile owners and admins can see the full profile with email
DROP POLICY IF EXISTS "Anyone can view alumni profiles" ON public.alumni_profiles;

-- Admins can see all profiles with full details
CREATE POLICY "Admins can view all profiles" 
ON public.alumni_profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can see their own profile with full details
CREATE POLICY "Users can view their own profile" 
ON public.alumni_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow viewing unclaimed profiles by email for claiming (authenticated users only)
CREATE POLICY "Users can view claimable profiles by email" 
ON public.alumni_profiles 
FOR SELECT 
USING (
  claimed = false 
  AND user_id IS NULL
  AND email IS NOT NULL 
  AND lower(email) = lower((SELECT (auth.jwt() ->> 'email'::text)))
);