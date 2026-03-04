

# Referrals Feature

## Overview
Add a "Referrals" section where alumni can post job referral offers (they can refer people at their company) or request referrals at specific companies. Follows the same moderation pattern as events and interviews.

## Database

**New table: `referrals`**
- `id`, `user_id`, `created_at`, `updated_at` (standard)
- `type` (text: 'offering' | 'seeking') -- whether posting an offer or request
- `company` (text, required) -- target company
- `role` (text, required) -- job role/title
- `description` (text, required) -- details about the referral
- `contact_info` (text, optional) -- how to reach out
- `status` (text, default 'pending') -- admin moderation
- `is_active` (boolean, default true) -- poster can close the listing

**RLS policies**: Same pattern as events/interviews -- public views approved, users CRUD own pending, admins manage all.

## New Files
- `src/pages/Referrals.tsx` -- main page with filters, list, and submission form
- `src/components/referrals/ReferralCard.tsx` -- card displaying company, role, type badge (offering/seeking), description preview
- `src/components/referrals/ReferralSubmissionForm.tsx` -- dialog form for submitting referrals
- `src/components/referrals/ReferralFilters.tsx` -- search by company/role, filter by type (offering/seeking)
- `src/components/admin/AdminReferralManagement.tsx` -- admin tab for moderation

## Modified Files
- `src/App.tsx` -- add `/referrals` route
- `src/components/Navbar.tsx` -- add "Referrals" nav link
- `src/pages/Admin.tsx` -- add "Referrals" tab

## Patterns
- Same admin moderation workflow (pending → approved)
- Same RLS structure as interviews/events
- Same TanStack Query caching/invalidation patterns
- Same UI components (Card, Dialog, AlertDialog, Badge, Select)

