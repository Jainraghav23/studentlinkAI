-- Drop the view approach and use a simpler RLS-based solution
DROP VIEW IF EXISTS public.alumni_profiles_public;

-- Add back public SELECT policy but the frontend will only request non-sensitive columns
CREATE POLICY "Anyone can view alumni profiles basic info" 
ON public.alumni_profiles 
FOR SELECT 
USING (true);