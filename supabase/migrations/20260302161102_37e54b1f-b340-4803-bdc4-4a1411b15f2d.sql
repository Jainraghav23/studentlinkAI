
CREATE TABLE public.interview_experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  company text NOT NULL,
  role text NOT NULL,
  interview_date date,
  difficulty text NOT NULL DEFAULT 'medium',
  result text DEFAULT 'pending',
  rounds integer,
  experience text NOT NULL,
  questions text,
  tips text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.interview_experiences ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved
CREATE POLICY "Anyone can view approved interviews"
ON public.interview_experiences FOR SELECT
USING (status = 'approved');

-- Users can view their own
CREATE POLICY "Users can view their own interviews"
ON public.interview_experiences FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own
CREATE POLICY "Users can submit interviews"
ON public.interview_experiences FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending
CREATE POLICY "Users can update their own pending interviews"
ON public.interview_experiences FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

-- Users can delete their own pending
CREATE POLICY "Users can delete their own pending interviews"
ON public.interview_experiences FOR DELETE
USING (auth.uid() = user_id AND status = 'pending');

-- Admins can view all
CREATE POLICY "Admins can view all interviews"
ON public.interview_experiences FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Admins can update all
CREATE POLICY "Admins can update interviews"
ON public.interview_experiences FOR UPDATE
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Admins can delete all
CREATE POLICY "Admins can delete interviews"
ON public.interview_experiences FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Timestamp trigger
CREATE TRIGGER update_interview_experiences_updated_at
BEFORE UPDATE ON public.interview_experiences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.interview_experiences;
