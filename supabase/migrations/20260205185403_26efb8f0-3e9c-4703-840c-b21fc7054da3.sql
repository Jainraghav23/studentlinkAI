-- Add user_id column to alumni_submissions to link auth users
ALTER TABLE public.alumni_submissions 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add index for faster lookups
CREATE INDEX idx_alumni_submissions_user_id ON public.alumni_submissions(user_id);

-- Update RLS policy to allow users to view their own submissions
CREATE POLICY "Users can view their own submissions"
ON public.alumni_submissions
FOR SELECT
USING (auth.uid() = user_id);