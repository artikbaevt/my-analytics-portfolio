# Signal — Trilingual Data Analyst Portfolio
A Next.js App Router portfolio and Supabase-backed admin workspace for junior data analysts. It ships with responsive light/dark presentation, EN/RU/UZ UI, content publishing, realtime subscriptions, project case studies and interactive charts.

## Scripts
`npm run dev` starts development, `npm run build` creates production output, `npm run lint` checks code, and `npm run seed` explains the safe database seed route.

## Setup
Copy `.env.example` to `.env.local`, supply the public Supabase URL and anon key, then apply `supabase/migrations/001_portfolio.sql` using the Supabase CLI or SQL editor. Create an Auth email/password user and visit `/admin/login`.

## Structure
- `app/`: public and admin routes
- `components/`: interactive portfolio experience
- `lib/`: Supabase client, types, local design fallback
- `locales/`: complete static UI translations
- `supabase/migrations/`: schema, policies, storage and realtime
