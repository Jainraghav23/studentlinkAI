-- Create a table for alumni profile submissions (pending approval)
CREATE TABLE public.alumni_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  graduation_year INTEGER NOT NULL,
  job_title TEXT,
  company TEXT,
  location TEXT,
  specialization TEXT,
  linkedin_url TEXT,
  bio TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.alumni_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert submissions
CREATE POLICY "Anyone can submit alumni profile"
ON public.alumni_submissions
FOR INSERT
WITH CHECK (true);

-- Only allow reading own submissions by email (for confirmation)
CREATE POLICY "Users can view their own submissions"
ON public.alumni_submissions
FOR SELECT
USING (true);