-- Add claim_token and claimed columns to alumni_profiles
ALTER TABLE public.alumni_profiles 
ADD COLUMN IF NOT EXISTS claim_token uuid DEFAULT NULL,
ADD COLUMN IF NOT EXISTS claimed boolean DEFAULT true;

-- Create index on claim_token for faster lookups
CREATE INDEX IF NOT EXISTS idx_alumni_profiles_claim_token ON public.alumni_profiles(claim_token);

-- Create index on email for profile claiming by email matching
CREATE INDEX IF NOT EXISTS idx_alumni_profiles_email ON public.alumni_profiles(email);

-- Update RLS policy to allow users to claim unclaimed profiles
CREATE POLICY "Users can claim unclaimed profiles by email" 
ON public.alumni_profiles 
FOR UPDATE 
USING (
  claimed = false 
  AND email IS NOT NULL 
  AND LOWER(email) = LOWER((SELECT auth.jwt() ->> 'email')::text)
)
WITH CHECK (
  auth.uid() = user_id
  AND claimed = true
);

-- Policy to allow admins to insert unclaimed profiles (without needing to match user_id)
CREATE POLICY "Admins can insert profiles" 
ON public.alumni_profiles 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));