

# Interview Experiences & Insights Feature

## Overview
Add a dedicated "Interview Experiences" section where alumni can share their interview experiences, questions, and insights from companies they've interviewed at. This creates a valuable knowledge base for the MBA community.

## What Gets Built

### 1. Database: `interview_experiences` table
A new table to store interview submissions with the following fields:
- **id**, **user_id**, **created_at**, **updated_at** (standard fields)
- **company** (required) -- the company interviewed at
- **role** (required) -- the position applied for
- **interview_date** (optional) -- approximate date of interview
- **difficulty** -- rating: easy, medium, hard
- **result** -- outcome: offered, rejected, pending, declined
- **rounds** -- number of interview rounds
- **experience** (required) -- detailed write-up of the process
- **questions** -- specific interview questions asked (text)
- **tips** -- advice for future candidates
- **status** -- pending/approved (admin moderation, matching existing patterns)

RLS policies will mirror the community posts pattern: authors can CRUD their own entries, admins can manage all, and approved entries are publicly viewable.

### 2. New Page: `/interviews`
A dedicated page with:
- **Search and filters** -- filter by company, role, difficulty, result
- **Submission form** -- authenticated users can share their experiences
- **Card-based list** -- each experience displayed as a card showing company, role, difficulty badge, result badge, and a preview of the experience text
- **Detail view** -- expandable or click-through to see the full experience, questions, and tips

### 3. Submission Form Component
A form (similar to EventSubmissionForm) where users fill in:
- Company name, role title
- Difficulty rating (select), outcome (select), number of rounds
- Detailed experience write-up (textarea)
- Interview questions section (textarea)
- Tips/advice (textarea)

Submissions go through admin approval (status = 'pending') before appearing publicly, consistent with the existing moderation workflow.

### 4. Admin Management
A new "Interviews" tab in the admin dashboard (`/admin`) to:
- View all pending/approved interview submissions
- Approve or reject submissions
- Edit or delete entries

### 5. Navigation
- Add an "Interviews" link to the Navbar alongside Community and Events

## Technical Details

### Database Migration
```sql
CREATE TABLE public.interview_experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  company text NOT NULL,
  role text NOT NULL,
  interview_date date,
  difficulty text NOT NULL DEFAULT 'medium',
  result text DEFAULT 'pending',
  rounds integer,
  experience text NOT NULL,
  questions text,
  tips text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.interview_experiences ENABLE ROW LEVEL SECURITY;

-- RLS policies (same pattern as events)
-- Public can view approved entries
-- Users can CRUD their own pending entries
-- Admins can manage all

ALTER PUBLICATION supabase_realtime ADD TABLE public.interview_experiences;
```

### New Files
- `src/pages/Interviews.tsx` -- main page with filters, list, and form
- `src/components/interviews/InterviewCard.tsx` -- display card for each experience
- `src/components/interviews/InterviewSubmissionForm.tsx` -- submission dialog
- `src/components/interviews/InterviewFilters.tsx` -- search/filter bar
- `src/components/admin/AdminInterviewManagement.tsx` -- admin tab for moderation

### Modified Files
- `src/App.tsx` -- add `/interviews` route
- `src/components/Navbar.tsx` -- add "Interviews" nav link
- `src/pages/Admin.tsx` -- add "Interviews" tab with the new admin component

### Patterns Followed
- Same admin moderation workflow as events (pending -> approved)
- Same RLS policy structure as events table
- Same component patterns (Card, Dialog, AlertDialog for confirmations)
- Same query/cache invalidation patterns using TanStack Query

