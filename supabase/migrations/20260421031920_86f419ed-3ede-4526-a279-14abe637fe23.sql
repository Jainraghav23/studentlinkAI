-- Event photos table
CREATE TABLE public.event_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  photo_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_event_photos_event_id ON public.event_photos(event_id);

ALTER TABLE public.event_photos ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view photos for approved events
CREATE POLICY "Authenticated users can view photos for approved events"
ON public.event_photos
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = event_photos.event_id AND e.status = 'approved'
  )
);

-- Authenticated users can upload photos to approved events
CREATE POLICY "Authenticated users can upload photos to approved events"
ON public.event_photos
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = event_photos.event_id AND e.status = 'approved'
  )
);

-- Users can delete their own photos
CREATE POLICY "Users can delete their own photos"
ON public.event_photos
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Admins can delete any photo
CREATE POLICY "Admins can delete any photo"
ON public.event_photos
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Storage policies for event-images bucket (gallery folder)
CREATE POLICY "Authenticated users can upload to event-images gallery"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'event-images'
  AND (storage.foldername(name))[1] = 'gallery'
);

CREATE POLICY "Anyone can view event-images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'event-images');

CREATE POLICY "Users can delete their own event-images uploads"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'event-images'
  AND owner = auth.uid()
);