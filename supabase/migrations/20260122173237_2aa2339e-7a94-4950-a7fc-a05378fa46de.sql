-- Allow user_id to be nullable for unclaimed profiles
ALTER TABLE public.alumni_profiles 
ALTER COLUMN user_id DROP NOT NULL;