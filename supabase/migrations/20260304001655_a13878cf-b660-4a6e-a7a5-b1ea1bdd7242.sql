
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'offering',
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  description TEXT NOT NULL,
  contact_info TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved active referrals
CREATE POLICY "Anyone can view approved referrals" ON public.referrals FOR SELECT USING (status = 'approved' AND is_active = true);

-- Users can view their own referrals
CREATE POLICY "Users can view their own referrals" ON public.referrals FOR SELECT USING (auth.uid() = user_id);

-- Users can submit referrals
CREATE POLICY "Users can submit referrals" ON public.referrals FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending referrals
CREATE POLICY "Users can update their own pending referrals" ON public.referrals FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Users can delete their own pending referrals
CREATE POLICY "Users can delete their own pending referrals" ON public.referrals FOR DELETE USING (auth.uid() = user_id AND status = 'pending');

-- Admins can view all referrals
CREATE POLICY "Admins can view all referrals" ON public.referrals FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- Admins can update referrals
CREATE POLICY "Admins can update referrals" ON public.referrals FOR UPDATE USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Admins can delete referrals
CREATE POLICY "Admins can delete referrals" ON public.referrals FOR DELETE USING (has_role(auth.uid(), 'admin'));
