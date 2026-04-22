

# Alumni Groups / Communities

Add structured sub-communities so alumni can join niche spaces (e.g., "NYC Alumni", "Tech Professionals", "Class of 2018") with their own scoped post feeds.

## What you'll get

- A **Groups** page (`/groups`) listing all approved groups with search, filter by category (Location / Industry / Class Year / Interest), and a "Create Group" button
- A **Group detail** page (`/groups/:id`) showing group info, member count, join/leave button, and a feed of posts scoped to that group
- **Membership system** — alumni join/leave groups; only members can post in private groups, anyone authenticated can post in public ones
- **Group creation** flows through the same admin moderation pattern as events/referrals (pending → approved)
- **Admin moderation** tab in `/admin` to approve/reject/delete groups
- **Community sidebar** updated to surface "My Groups" for quick access

## Database changes

Three new tables (all with RLS, following existing event/referral patterns):

**`groups`**
- `id`, `created_at`, `updated_at`, `creator_id`
- `name` (unique), `slug`, `description`, `category` (location | industry | class_year | interest), `cover_image_url`
- `privacy` (public | private), `status` (pending | approved | rejected)

**`group_members`**
- `id`, `group_id`, `user_id`, `role` (member | moderator), `joined_at`
- Unique on (group_id, user_id)

**`posts`** (modified)
- Add nullable `group_id` column → posts without a group remain on the main community feed; posts with one are scoped to that group

**RLS highlights**
- Anyone authenticated can view approved groups
- Creator/admin can edit; admin can moderate
- Public groups: anyone authenticated reads posts; only members post
- Private groups: only members read and post
- Security-definer function `is_group_member(_group_id, _user_id)` to avoid RLS recursion

## New files

- `src/pages/Groups.tsx` — directory of all groups
- `src/pages/GroupDetail.tsx` — single group view with scoped feed
- `src/components/groups/GroupCard.tsx` — card with cover, name, category badge, member count, join button
- `src/components/groups/GroupSubmissionForm.tsx` — dialog to propose a new group
- `src/components/groups/GroupFilters.tsx` — search + category filter
- `src/components/groups/GroupMembersList.tsx` — sidebar widget on detail page
- `src/components/admin/AdminGroupManagement.tsx` — admin moderation tab

## Modified files

- `src/App.tsx` — add `/groups` and `/groups/:id` routes (wrapped in `AuthGate`)
- `src/components/Navbar.tsx` — add "Groups" nav link
- `src/components/community/CommunitySidebar.tsx` — add "My Groups" section listing groups the user belongs to
- `src/components/posts/PostForm.tsx` — accept optional `groupId` prop and pass it on insert
- `src/components/posts/PostList.tsx` — accept optional `groupId` filter; main feed shows only `group_id IS NULL` posts
- `src/pages/Admin.tsx` — add "Groups" tab using `AdminGroupManagement`

## UX flow

```text
/groups           → browse all approved groups, search & filter
   ↓ click card
/groups/:id      → group header (cover, name, members)
                    + Join/Leave button
                    + Scoped post feed (PostList filtered by group_id)
                    + Members sidebar
                    + PostForm (members only for private groups)

/community        → unchanged; shows only posts where group_id IS NULL
/admin → Groups   → approve / reject / delete pending groups
```

## Patterns reused

- AuthGate wrapping (universal access control)
- Admin moderation workflow (pending → approved) — same as events, referrals, interviews
- TanStack Query caching with realtime invalidation on `posts`, `group_members`, `groups`
- Framer-motion page transitions, UW-Madison cardinal red branding

## Out of scope (can add later)

- Group-specific events or photo galleries
- Group invitations / private group join requests
- Group-level moderators with kick/ban powers (schema supports it; UI deferred)
- Cover image upload (initial version uses URL field; storage upload can be added)

