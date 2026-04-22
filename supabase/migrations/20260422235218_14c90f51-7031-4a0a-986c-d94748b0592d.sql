
-- 1. Groups table
CREATE TABLE public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'interest',
  cover_image_url TEXT,
  privacy TEXT NOT NULL DEFAULT 'public',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_groups_updated_at
BEFORE UPDATE ON public.groups
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Group members
CREATE TABLE public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_id)
);

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- 3. Add group_id to posts
ALTER TABLE public.posts ADD COLUMN group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE;
CREATE INDEX idx_posts_group_id ON public.posts(group_id);

-- 4. Security-definer membership check
CREATE OR REPLACE FUNCTION public.is_group_member(_group_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = _group_id AND user_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.get_group_privacy(_group_id UUID)
RETURNS TEXT
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT privacy FROM public.groups WHERE id = _group_id;
$$;

CREATE OR REPLACE FUNCTION public.get_group_status(_group_id UUID)
RETURNS TEXT
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT status FROM public.groups WHERE id = _group_id;
$$;

-- 5. RLS for groups
CREATE POLICY "Authenticated can view approved groups"
ON public.groups FOR SELECT
USING (auth.uid() IS NOT NULL AND status = 'approved');

CREATE POLICY "Creators view own groups"
ON public.groups FOR SELECT
USING (auth.uid() = creator_id);

CREATE POLICY "Admins view all groups"
ON public.groups FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated can submit groups"
ON public.groups FOR INSERT
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators update own pending groups"
ON public.groups FOR UPDATE
USING (auth.uid() = creator_id AND status = 'pending');

CREATE POLICY "Admins update any group"
ON public.groups FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Creators delete own pending groups"
ON public.groups FOR DELETE
USING (auth.uid() = creator_id AND status = 'pending');

CREATE POLICY "Admins delete any group"
ON public.groups FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- 6. RLS for group_members
CREATE POLICY "Authenticated view members of approved groups"
ON public.group_members FOR SELECT
USING (auth.uid() IS NOT NULL AND get_group_status(group_id) = 'approved');

CREATE POLICY "Admins view all memberships"
ON public.group_members FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users join approved groups"
ON public.group_members FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND get_group_status(group_id) = 'approved'
);

CREATE POLICY "Users leave their groups"
ON public.group_members FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins remove any member"
ON public.group_members FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- 7. Update posts RLS for group scoping
DROP POLICY IF EXISTS "Authenticated users can view posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;

CREATE POLICY "View ungrouped or accessible group posts"
ON public.posts FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND (
    group_id IS NULL
    OR (
      get_group_status(group_id) = 'approved'
      AND (
        get_group_privacy(group_id) = 'public'
        OR is_group_member(group_id, auth.uid())
      )
    )
  )
);

CREATE POLICY "Create posts in main feed or as group member"
ON public.posts FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND (
    group_id IS NULL
    OR is_group_member(group_id, auth.uid())
  )
);

-- 8. Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.groups;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_members;
