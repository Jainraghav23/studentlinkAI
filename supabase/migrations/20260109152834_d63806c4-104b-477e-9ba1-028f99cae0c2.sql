-- Create alumni_profiles table
CREATE TABLE public.alumni_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  graduation_year INTEGER NOT NULL CHECK (graduation_year >= 2015 AND graduation_year <= 2025),
  job_title TEXT,
  company TEXT,
  location TEXT,
  specialization TEXT,
  linkedin_url TEXT,
  email TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.alumni_profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can view alumni profiles
CREATE POLICY "Anyone can view alumni profiles"
ON public.alumni_profiles
FOR SELECT
USING (true);

-- Users can create their own profile
CREATE POLICY "Users can create their own profile"
ON public.alumni_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.alumni_profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own profile
CREATE POLICY "Users can delete their own profile"
ON public.alumni_profiles
FOR DELETE
USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_alumni_profiles_updated_at
BEFORE UPDATE ON public.alumni_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);