
ALTER TABLE public.alumni_profiles ADD COLUMN candidate_type text DEFAULT 'domestic';
ALTER TABLE public.alumni_profiles ADD COLUMN country text;

ALTER TABLE public.alumni_submissions ADD COLUMN candidate_type text DEFAULT 'domestic';
ALTER TABLE public.alumni_submissions ADD COLUMN country text;
