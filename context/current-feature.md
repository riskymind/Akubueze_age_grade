# Current Feature

Seed Data

## Status

In Progress

## Goals

- Create `prisma/seed.ts` with realistic sample data for all models
- Cover all user roles: `SUPER_ADMIN`, `ADMIN`, `MEMBER`
- Cover all member statuses: `ACTIVE`, `SUSPENDED`, `INACTIVE`
- Seed 10 meetings (7 completed, 3 scheduled) spanning 6 months past and 2 months future
- Seed attendance records with realistic profiles per member
- Seed 7 months of payment history (monthly dues + levies, fines, donations)
- Seed 6 announcements with partial read tracking
- Wire up `npx prisma db seed` via `package.json` prisma config

## Notes

- Spec defined in `context/features/seed-spec.md`
- Imports enums from `lib/generated/prisma/client` (Prisma 7 custom output path)
- Uses PrismaPg adapter — same pattern as `lib/prisma.ts`
- Run with `npx prisma db seed` or `npx prisma migrate reset` (resets + reseeds)
- Default password for all seeded users: `Akubueze@2026`

## History

<!-- Keep this updated. Earliest to latest -->

- **2026-05-13** — Initial Next.js project setup with context files (project overview, coding standards, AI interaction guidelines). Cleaned up default Next.js boilerplate (removed default SVGs, updated globals.css and page.tsx). Pushed to remote repo.
- **2026-05-14** — Dashboard UI Phase 1: Initialized ShadCN UI (Tailwind v4), created /dashboard route with sidebar and main area placeholders, enabled dark mode by default.
- **2026-05-14** — Dashboard UI Phase 2: Collapsible sidebar with drawer toggle icon, user avatar area at the bottom, mobile Sheet drawer (always a drawer on mobile view). Added ShadCN Sheet and Avatar components.
- **2026-05-14** — Dashboard UI Phase 3: Built main dashboard content area with 4 stats cards (Total Members, Upcoming Meetings, Payments This Month, Attendance Rate), Recent Activity list, Announcements panel, and Upcoming Meetings list. Data sourced from mock-data.ts.
- **2026-05-15** — Prisma 7 + Neon PostgreSQL setup: Installed Prisma 7 with @prisma/adapter-pg (driver adapter required in v7), created prisma.config.ts for DB URL config, full schema with all models + NextAuth models (Account, Session, VerificationToken), indexes, and cascade deletes. Generated client to lib/generated/prisma/. Initial migration applied to Neon dev branch. Added scripts/test-db.ts for connection verification.
- **2026-05-15** — Seed data: Created prisma/seed.ts with 15 users, 10 meetings, attendance records, 7 months of payments, 6 announcements, and announcement reads. Installed bcryptjs + date-fns. Wired npx prisma db seed via package.json.
