-- Allow authenticated users to view all submissions (for admin purposes)
DROP POLICY IF EXISTS "Users can view their own submissions" ON public.alumni_submissions;

CREATE POLICY "Authenticated users can view all submissions" 
ON public.alumni_submissions 
FOR SELECT 
TO authenticated
USING (true);

-- Allow authenticated users to update submission status
CREATE POLICY "Authenticated users can update submissions" 
ON public.alumni_submissions 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);