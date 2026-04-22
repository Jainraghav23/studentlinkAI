---
name: Alumni Groups
description: Sub-communities (location/industry/class year/interest) with admin moderation, public/private membership, and scoped post feeds
type: feature
---
Groups are admin-moderated sub-communities. Tables: `groups` (creator_id, name, slug, description, category, privacy, status, cover_image_url) + `group_members` (group_id, user_id, role) + `posts.group_id` nullable column.

Posts with `group_id IS NULL` show on the main /community feed. Posts with a group_id are scoped to that group's detail page. PostList accepts optional `groupId` prop; PostForm accepts optional `groupId` prop.

Privacy: public groups are readable by any authenticated user but only members can post. Private groups require membership for both reading and posting. Enforced via `is_group_member`, `get_group_privacy`, `get_group_status` security-definer functions to avoid RLS recursion.

Routes: /groups (directory) and /groups/:id (detail). Both wrapped in AuthGate. Admin moderation via /admin → Groups tab.
