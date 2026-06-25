-- =========================================================
-- Security hardening migration
-- =========================================================

-- 1) Prevent group creators from self-approving pending groups.
--    Add a WITH CHECK so the status cannot be changed away from 'pending'.
DROP POLICY IF EXISTS "Creators update own pending groups" ON public.groups;
CREATE POLICY "Creators update own pending groups" ON public.groups
  FOR UPDATE
  USING (auth.uid() = creator_id AND status = 'pending')
  WITH CHECK (auth.uid() = creator_id AND status = 'pending');

-- 2) Stop the "always true" insert policy on alumni_submissions.
--    Guest submissions are still allowed, but only as 'pending'.
DROP POLICY IF EXISTS "Anyone can submit alumni profile" ON public.alumni_submissions;
CREATE POLICY "Anyone can submit alumni profile" ON public.alumni_submissions
  FOR INSERT
  WITH CHECK (status = 'pending');

-- 3) Remove interview experiences from the Realtime publication.
--    Nothing in the app subscribes to it, and this guarantees pending /
--    other users' rows can never be broadcast.
ALTER PUBLICATION supabase_realtime DROP TABLE public.interview_experiences;

-- 4) Storage: remove broad public-listing SELECT policies on public buckets.
--    Files stay reachable through their public URLs (buckets remain public),
--    but clients can no longer enumerate/list every object in a bucket.
DROP POLICY IF EXISTS "Anyone can view event images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view event-images" ON storage.objects;
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Group covers are publicly accessible" ON storage.objects;

-- 5) Storage: restrict gallery uploads to event-images.
--    Require the upload to be tied to an approved event and owned by the user.
DROP POLICY IF EXISTS "Authenticated users can upload to event-images gallery" ON storage.objects;
CREATE POLICY "Authenticated users can upload to event-images gallery" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'event-images'
    AND (storage.foldername(name))[1] = 'gallery'
    AND storage.filename(name) LIKE (auth.uid()::text || '-%')
    AND EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id::text = (storage.foldername(name))[2]
        AND e.status = 'approved'
    )
  );

-- 6) Storage: add a missing UPDATE policy on event-images so files can only
--    be replaced by their owner.
DROP POLICY IF EXISTS "Users can update their own event-images uploads" ON storage.objects;
CREATE POLICY "Users can update their own event-images uploads" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'event-images' AND owner = auth.uid())
  WITH CHECK (bucket_id = 'event-images' AND owner = auth.uid());

-- 7) Move SECURITY DEFINER helper functions out of the API-exposed public
--    schema into a private schema. They keep working inside RLS policies
--    (dependencies are by object id) but can no longer be invoked directly
--    through the REST/GraphQL API.
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO anon, authenticated, service_role;

ALTER FUNCTION public.get_group_privacy(uuid) SET SCHEMA private;
ALTER FUNCTION public.get_group_status(uuid) SET SCHEMA private;
ALTER FUNCTION public.is_group_member(uuid, uuid) SET SCHEMA private;
ALTER FUNCTION public.has_role(uuid, public.app_role) SET SCHEMA private;