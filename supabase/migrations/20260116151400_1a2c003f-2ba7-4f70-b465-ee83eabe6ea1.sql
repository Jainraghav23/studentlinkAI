-- Update RLS policy for alumni_profiles to allow admins to insert with NULL user_id
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.alumni_profiles;

CREATE POLICY "Admins can insert profiles" 
ON public.alumni_profiles 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
);

-- Update the claim policy to work with NULL user_id
DROP POLICY IF EXISTS "Users can claim unclaimed profiles by email" ON public.alumni_profiles;

CREATE POLICY "Users can claim unclaimed profiles by email" 
ON public.alumni_profiles 
FOR UPDATE 
USING (
  (claimed = false) 
  AND (user_id IS NULL)
  AND (email IS NOT NULL) 
  AND (lower(email) = lower((SELECT (auth.jwt() ->> 'email'::text))))
)
WITH CHECK (
  (auth.uid() = user_id) 
  AND (claimed = true)
);