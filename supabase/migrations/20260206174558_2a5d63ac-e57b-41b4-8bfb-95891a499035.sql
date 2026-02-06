-- Fix: Restrict likes visibility to authenticated users only
-- This prevents anonymous tracking of user activity

DROP POLICY IF EXISTS "Anyone can view likes" ON public.likes;

CREATE POLICY "Authenticated users can view likes" 
ON public.likes 
FOR SELECT 
USING (auth.uid() IS NOT NULL);