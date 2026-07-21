# StudentLink AI

StudentLink AI is a trusted student and alumni network built to help students find the right people, advice, referrals, events, and community opportunities in one place.

I started this as a personal project after noticing how hard it can be for students to find alumni or peers who have already gone through the same classes, internship searches, interviews, or career decisions. A lot of that help exists, but it is scattered across LinkedIn, group chats, spreadsheets, and one-off messages. StudentLink AI brings those connections into a more organized and approved community directory.

Live site: https://studentlink-ai.jainraghav-rj.chatgpt.site

## What It Does

- Secure signup and login with Supabase Auth
- Admin approval flow before users can access the private directory
- Student and alumni profile directory
- Search by name, graduation year, company, location, and specialization
- Admin dashboard for reviewing, approving, and rejecting applications
- Duplicate pending application protection
- Profile claiming by email for migrated or pre-existing profiles
- Sections for events, groups, interview experiences, and referrals
- Public deployment through Codex hosting

## Why I Built It

I wanted to build something that could start small for my own community, but eventually grow into a useful platform for my university. The long-term goal is to make it easier for students to find mentors, ask better questions, discover opportunities, and build relationships with alumni and other students.

StudentLink AI is not just a directory. It is the foundation for a smarter campus network where students can get connected to the people most likely to help them.

## Future Plans

- AI mentor matching based on goals, interests, major, skills, and target companies
- AI-generated intro messages so students can reach out more confidently
- Smart profile recommendations for students looking for advice
- Mentorship request tracking and follow-ups
- Campus opportunity feed for jobs, referrals, events, and student groups
- Better admin analytics for community growth and engagement
- More trust and verification features for university communities

## How I Used Codex

Codex was used throughout the project as my main coding and deployment partner. It helped me:

- Transfer the project from Lovable into GitHub and Codex
- Rename and rebrand the app as StudentLink AI
- Connect the app to my own Supabase project
- Debug authentication, password reset, approval, and directory access issues
- Fix signup submission failures after migrating away from Lovable Cloud
- Add duplicate pending application protection
- Write and organize SQL migrations
- Push changes to GitHub
- Build and deploy the public site after each fix

Codex was especially useful because this project involved real production problems, not just UI work. It helped me reason through database ownership, Supabase Auth, row-level security, migrations, environment variables, and deployment.

## How I Used GPT-5.6

I used GPT-5.6 as a product and coding partner. It helped me think through the user experience, understand error messages, write SQL queries, plan the app flow, and decide what features should come next.

GPT-5.6 also helped me turn rough ideas into clearer product decisions, including how the approval flow should work, how users should recover access after migration, and how StudentLink AI could grow into an AI-powered mentor matching platform.

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Supabase Auth
- Supabase Postgres
- Codex hosting

## Local Development

```bash
pnpm install
pnpm run dev
```

Create a `.env` file with your Supabase values:

```bash
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
```

Build for production:

```bash
pnpm run build
```

## Status

StudentLink AI is live as a working prototype. The current version supports signup, approval, directory access, admin management, events, groups, interview experiences, and referrals. The next major step is adding AI-powered mentor matching.
