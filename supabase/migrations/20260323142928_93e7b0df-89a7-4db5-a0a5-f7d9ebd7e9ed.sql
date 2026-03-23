
-- Add is_distinguished column to alumni_profiles
ALTER TABLE public.alumni_profiles ADD COLUMN is_distinguished boolean NOT NULL DEFAULT false;

-- Recreate the public view to include is_distinguished
DROP VIEW IF EXISTS public.alumni_profiles_public;
CREATE VIEW public.alumni_profiles_public WITH (security_barrier = true) AS
SELECT
  id, full_name, graduation_year, job_title, company, location,
  specialization, linkedin_url, bio, avatar_url, candidate_type,
  country, claimed, user_id, created_at, updated_at, is_distinguished
FROM public.alumni_profiles;
