
-- Posts: change "Anyone can view posts" to require auth
DROP POLICY "Anyone can view posts" ON public.posts;
CREATE POLICY "Authenticated users can view posts" ON public.posts
  FOR SELECT TO public
  USING (auth.uid() IS NOT NULL);

-- Comments: change "Anyone can view comments" to require auth
DROP POLICY "Anyone can view comments" ON public.comments;
CREATE POLICY "Authenticated users can view comments" ON public.comments
  FOR SELECT TO public
  USING (auth.uid() IS NOT NULL);

-- Events: change "Anyone can view approved events" to require auth
DROP POLICY "Anyone can view approved events" ON public.events;
CREATE POLICY "Authenticated users can view approved events" ON public.events
  FOR SELECT TO public
  USING (auth.uid() IS NOT NULL AND status = 'approved');

-- Interviews: change "Anyone can view approved interviews" to require auth
DROP POLICY "Anyone can view approved interviews" ON public.interview_experiences;
CREATE POLICY "Authenticated users can view approved interviews" ON public.interview_experiences
  FOR SELECT TO public
  USING (auth.uid() IS NOT NULL AND status = 'approved');

-- Referrals: change "Anyone can view approved referrals" to require auth
DROP POLICY "Anyone can view approved referrals" ON public.referrals;
CREATE POLICY "Authenticated users can view approved referrals" ON public.referrals
  FOR SELECT TO public
  USING (auth.uid() IS NOT NULL AND status = 'approved' AND is_active = true);
