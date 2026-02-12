
-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'in-person',
  max_attendees INTEGER,
  contact_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved events
CREATE POLICY "Anyone can view approved events"
ON public.events FOR SELECT
USING (status = 'approved');

-- Users can view their own submissions regardless of status
CREATE POLICY "Users can view their own event submissions"
ON public.events FOR SELECT
USING (auth.uid() = user_id);

-- Authenticated users can submit events
CREATE POLICY "Authenticated users can submit events"
ON public.events FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all events
CREATE POLICY "Admins can view all events"
ON public.events FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update events (approve/reject)
CREATE POLICY "Admins can update events"
ON public.events FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Users can update their own pending events
CREATE POLICY "Users can update their own pending events"
ON public.events FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

-- Users can delete their own pending events
CREATE POLICY "Users can delete their own pending events"
ON public.events FOR DELETE
USING (auth.uid() = user_id AND status = 'pending');

-- Trigger for updated_at
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
