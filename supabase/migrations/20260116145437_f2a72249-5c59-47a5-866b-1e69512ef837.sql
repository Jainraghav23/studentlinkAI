-- Fix the remaining schema changes
-- The policies were already created, now fix the constraint issue

-- Drop the constraint properly (not the index)
ALTER TABLE public.alumni_profiles DROP CONSTRAINT IF EXISTS alumni_profiles_user_id_key;

-- Add a partial unique constraint: user_id must be unique only when it's NOT NULL
CREATE UNIQUE INDEX IF NOT EXISTS alumni_profiles_user_id_unique 
ON public.alumni_profiles (user_id) 
WHERE user_id IS NOT NULL;

-- Add CHECK constraints for alumni_submissions to limit field lengths
-- This provides some protection against spam/abuse
ALTER TABLE public.alumni_submissions
ADD CONSTRAINT alumni_submissions_full_name_length CHECK (char_length(full_name) <= 200),
ADD CONSTRAINT alumni_submissions_email_length CHECK (char_length(email) <= 320),
ADD CONSTRAINT alumni_submissions_bio_length CHECK (char_length(bio) <= 2000),
ADD CONSTRAINT alumni_submissions_job_title_length CHECK (char_length(job_title) <= 200),
ADD CONSTRAINT alumni_submissions_company_length CHECK (char_length(company) <= 200),
ADD CONSTRAINT alumni_submissions_location_length CHECK (char_length(location) <= 200),
ADD CONSTRAINT alumni_submissions_linkedin_url_length CHECK (char_length(linkedin_url) <= 500);