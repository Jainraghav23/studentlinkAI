-- Allow group creators to update their approved groups (needed to edit cover image after approval)
CREATE POLICY "Creators update own approved groups"
ON public.groups
FOR UPDATE
USING (auth.uid() = creator_id AND status = 'approved')
WITH CHECK (auth.uid() = creator_id AND status = 'approved');