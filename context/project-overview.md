# 🏛️ Akubueze — Age Grade Association Management System

> A private, invite-only web application for managing age grade associations — covering membership, meetings, attendance, finances, and internal communications.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Goals](#goals)
- [User Roles & Permissions](#user-roles--permissions)
- [Authentication & Access Flow](#authentication--access-flow)
- [Core Features](#core-features)
- [Data Models (Rough Draft)](#data-models-rough-draft)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Key Design Decisions](#key-design-decisions)

---

## Project Overview

Akubueze is a **closed membership web application** built to digitize the operations of age grade associations. It is not open to the public — access is strictly by administrator invitation.

The system replaces paper-based processes for:

- ✅ Member records & profiles
- 📅 Meeting scheduling & minutes
- 🙋 Attendance tracking
- 💰 Financial contributions, dues & fines
- 📢 Announcements & notices
- 📊 Reports & summaries

> **No public registration. No open sign-up.** All accounts are created by administrators.

---

## Goals

| # | Goal |
|---|------|
| 1 | Digitize month-to-month association operations |
| 2 | Improve financial transparency and accountability |
| 3 | Track attendance and payment compliance |
| 4 | Enhance internal communication among members |
| 5 | Eliminate manual record-keeping and paperwork |

---

## User Roles & Permissions

The system uses a **3-tier RBAC model**:

```
Super Admin
    └── Admin / Executives
            └── Members
```

### 👑 Super Admin

Full system control. Only one (or a small number) should hold this role.

| Permission | ✓ |
|---|---|
| Manage admins | ✓ |
| Manage all members | ✓ |
| Create & manage meetings | ✓ |
| Manage finances | ✓ |
| View all reports | ✓ |
| Suspend / reactivate members | ✓ |
| Reset any member's password | ✓ |
| Configure platform settings | ✓ |

### 🛠️ Admin / Executives

Month-to-month operations. Assigned to elected executives or coordinators.

| Permission | ✓ |
|---|---|
| Create member accounts | ✓ |
| Manage meetings | ✓ |
| Mark attendance | ✓ |
| Record payments | ✓ |
| Post announcements | ✓ |
| View reports | ✓ |

### 👤 Members

Standard read-only access with personal profile management.

| Permission | ✓ |
|---|---|
| Log in to platform | ✓ |
| View scheduled meetings | ✓ |
| View announcements | ✓ |
| View personal payment history | ✓ |
| View personal attendance history | ✓ |
| Update own profile | ✓ |

---

## Authentication & Access Flow

> 🔒 There is **no public sign-up page**. All accounts originate from an admin action.

```
┌─────────────────────────────────────────────────────────────┐
│                     ONBOARDING FLOW                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Admin creates member account (name, email, role)       │
│         │                                                   │
│         ▼                                                   │
│  2. System generates a temporary password                   │
│         │                                                   │
│         ▼                                                   │
│  3. Member receives credentials via email                   │
│         │                                                   │
│         ▼                                                   │
│  4. Member logs in with temporary password                  │
│         │                                                   │
│         ▼                                                   │
│  5. Member is prompted to change password                   │
│         │                                                   │
│         ▼                                                   │
│  6. Member accesses their dashboard                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Auth implementation:** [Auth.js (NextAuth v5)](https://authjs.dev/) is recommended for tighter Next.js 15 App Router integration. JWT sessions with refresh token rotation for security.

Protected routes should use Next.js middleware to check session + role before rendering.

---

## Core Features

### 1. 🔐 Authentication & Authorization

- Secure login with hashed passwords (bcrypt)
- JWT / session-based authentication via Auth.js
- Role-based route protection (middleware)
- Forced password change on first login
- Admin-triggered password reset

---

### 2. 👥 Member Management

- Create, edit, and deactivate member accounts
- Assign or update roles
- Suspend / reactivate members
- Search and filter members list

**Member Profile Fields:**

| Field | Type |
|---|---|
| Full Name | `String` |
| Phone Number | `String` |
| Email | `String` (unique) |
| Occupation | `String?` |
| Address | `String?` |
| Gender | `Enum (MALE, FEMALE)` |
| Date Joined | `DateTime` |
| Membership Status | `Enum (ACTIVE, SUSPENDED, INACTIVE)` |
| Role | `Enum (SUPER_ADMIN, ADMIN, MEMBER)` |

---

### 3. 📅 Meeting Management

- Schedule, edit, and cancel meetings
- Categorize meetings by type
- Assign a host member to each meeting
- Add/edit agendas
- Upload meeting minutes (PDF/DOCX via Uploadthing)
- Track meeting status lifecycle

**Meeting Types:**

| Type | Use Case |
|---|---|
| `GENERAL` | Regular association-wide gatherings |
| `EXECUTIVE` | Leadership-only sessions |
| `EMERGENCY` | Urgent unscheduled meetings |
| `ANNUAL` | Yearly general assembly |

**Meeting Status:** `SCHEDULED → IN_PROGRESS → COMPLETED → CANCELLED`

**Meeting Host & Dues:**
Each completed meeting has one designated host from the membership. Meeting dues are compulsory for all members per meeting: the host pays ₦5,000; every other member pays ₦1,000.

---

### 4. 🙋 Attendance Management

- Mark attendance per meeting (present / absent / excused)
- Auto-flag members who miss consecutive meetings
- Generate per-member and per-meeting attendance reports
- Admins can add attendance notes/remarks

---

### 5. 💰 Financial Management

- Record and categorize all inflows
- Track outstanding dues per member
- Apply fines automatically or manually
- Generate and download receipts (PDF)
- Full payment history per member


**Payment Features:**

The system should support:

- Manual payment recording
- Payment verification
- Payment history
- Outstanding balances
- Meeting-by-meeting payment tracking
- Financial summaries
- Treasurer/Admin tracking dashboard

Optional future features:

- Online payment integration
- Payment receipts
- PDF receipt downloads
- Automatic reminders

**Payment Types:**

| Type | Description |
|---|---|
| `MEETING_HOST_FEE` | Meeting dues — host rate (₦5,000/meeting) |
| `MEETING_DUES` | Meeting dues — all other members (₦1,000/meeting, compulsory regardless of attendance) |
| `DEVELOPMENT_LEVY` | Special project contributions |
| `EVENT_CONTRIBUTION` | Event-specific collections |
| `FINE` | Penalty for rule infractions |
| `DONATION` | Voluntary contributions |

---

### 6. 📢 Announcements

- Post association-wide announcements
- Meeting reminders (manual or auto-triggered before scheduled meetings)
- Pin important notices
- Mark announcements as read (per member)

---

### 7. 📊 Dashboard

**Admin Dashboard:**

```
┌──────────────────┬──────────────────┬──────────────────┐
│  👥 Total Members │ 📅 Next Meeting   │ 💰 Dues Summary  │
├──────────────────┴──────────────────┴──────────────────┤
│  🙋 Attendance Overview (this month)                    │
├─────────────────────────────────────────────────────────┤
│  📋 Recent Activities (audit log)                       │
└─────────────────────────────────────────────────────────┘
```

**Member Dashboard:**

```
┌──────────────────┬──────────────────┬──────────────────┐
│ 📅 Next Meeting   │ ✅ My Attendance  │ 💳 My Balance    │
├──────────────────┴──────────────────┴──────────────────┤
│  📢 Latest Announcements                                │
└─────────────────────────────────────────────────────────┘
```

---

## Data Models

```prisma
// ─────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────

enum Role {
  SUPER_ADMIN
  ADMIN
  MEMBER
}

enum MemberStatus {
  ACTIVE
  SUSPENDED
  INACTIVE
}

enum Gender {
  MALE
  FEMALE
  OTHER
}

enum MeetingType {
  GENERAL
  EXECUTIVE
  EMERGENCY
  ANNUAL
}

enum MeetingStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum AttendanceStatus {
  PRESENT
  ABSENT
  EXCUSED
}

enum PaymentType {
  MEETING_HOST_FEE  // meeting dues — host rate (₦5,000)
  MEETING_DUES      // meeting dues — all other members (₦1,000), compulsory regardless of attendance
  DEVELOPMENT_LEVY
  EVENT_CONTRIBUTION
  FINE
  DONATION
}

enum PaymentStatus {
  PENDING
  PAID
  WAIVED
}

// ─────────────────────────────────────────
// MODELS
// ─────────────────────────────────────────

model User {
  id                String       @id @default(cuid())
  fullName          String
  email             String       @unique
  emailVerified     DateTime?
  phone             String?
  passwordHash      String?
  occupation        String?
  address           String?
  gender            Gender?
  role              Role         @default(MEMBER)
  status            MemberStatus @default(ACTIVE)
  mustResetPassword Boolean      @default(true)
  profileImageUrl   String?
  dateJoined        DateTime     @default(now())
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt

  createdById     String?
  createdBy       User?          @relation("CreatedMembers", fields: [createdById], references: [id])
  createdMembers  User[]         @relation("CreatedMembers")

  attendances      Attendance[]
  payments         Payment[]
  announcements    Announcement[]
  announcementRead AnnouncementRead[]
  hostedMeetings   Meeting[]          @relation("MeetingHost")

  accounts  Account[]
  sessions  Session[]

  @@map("users")
}

model Meeting {
  id          String        @id @default(cuid())
  title       String
  type        MeetingType
  status      MeetingStatus @default(SCHEDULED)
  scheduledAt DateTime
  location    String?
  agenda      String?
  minutesUrl  String?
  notes       String?
  hostId      String?       // member designated to host this meeting
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  host        User?         @relation("MeetingHost", fields: [hostId], references: [id])
  attendances Attendance[]

  @@map("meetings")
}

model Attendance {
  id       String           @id @default(cuid())
  status   AttendanceStatus @default(ABSENT)
  remarks  String?
  markedAt DateTime         @default(now())

  userId    String
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  meetingId String
  meeting   Meeting @relation(fields: [meetingId], references: [id], onDelete: Cascade)

  @@unique([userId, meetingId])
  @@map("attendances")
}

model Payment {
  id          String        @id @default(cuid())
  type        PaymentType
  status      PaymentStatus @default(PENDING)
  amount      Float
  description String?
  receiptUrl  String?
  paidAt      DateTime?
  dueDate     DateTime?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("payments")
}

model Announcement {
  id          String   @id @default(cuid())
  title       String
  body        String
  isPinned    Boolean  @default(false)
  publishedAt DateTime @default(now())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  authorId String
  author   User   @relation(fields: [authorId], references: [id], onDelete: Restrict)

  reads AnnouncementRead[]

  @@map("announcements")
}

model AnnouncementRead {
  id     String   @id @default(cuid())
  readAt DateTime @default(now())

  announcementId String
  announcement   Announcement @relation(fields: [announcementId], references: [id], onDelete: Cascade)

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([announcementId, userId])
  @@map("announcement_reads")
}
```

> 💡 **Notes:**
> - `passwordHash` is nullable to support future OAuth accounts (NextAuth).
> - `mustResetPassword` enforces the first-login password change flow.
> - `Meeting.hostId` links to the member hosting that meeting; null for scheduled meetings without a host yet.
> - `Payment.receiptUrl` stores an Uploadthing-hosted PDF receipt link.
> - Consider adding a separate `AuditLog` model for admin activity tracking.

---

### F. AI Features

- 🤖 AI  Meeting Minutes Summarizer
- 📝 AI  Member Onboarding Assistant

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router) | Full-stack, SSR + API routes |
| **Language** | TypeScript | Strict mode recommended |
| **UI** | [Tailwind CSS](https://tailwindcss.com/) + [ShadCN UI](https://ui.shadcn.com/) | Component-driven, accessible |
| **Database** | PostgreSQL ([Neon](https://neon.tech/)) | Serverless Postgres, free tier available |
| **ORM** | [Prisma ORM](https://www.prisma.io/) | Type-safe DB access, migrations |
| **Auth** | [Auth.js v5 (NextAuth)](https://authjs.dev/) | App Router native, Credentials provider |
| **File Uploads** | [Uploadthing](https://uploadthing.com/) | Meeting minutes, receipts, avatars |
| **Email** | [Resend](https://resend.com/) | Transactional emails (credentials, reminders) |
| **Notifications** | Firebase (optional) | Push notifications for announcements |
| **AI**      | OpenAI GPT-4o Mini        | Cost-effective for AI features      |

### Useful Libraries to Consider

| Library | Purpose |
|---|---|
| [`zod`](https://zod.dev/) | Schema validation for forms and API inputs |
| [`react-hook-form`](https://react-hook-form.com/) | Form state management |
| [`date-fns`](https://date-fns.org/) | Date formatting and manipulation |
| [`@tanstack/react-table`](https://tanstack.com/table) | Data tables (members, payments) |
| [`recharts`](https://recharts.org/) | Dashboard charts |
| [`next-safe-action`](https://next-safe-action.dev/) | Type-safe server actions |

---

## 🎨 UI/UX Guidelines

### Design Principles

- **Modern & Minimal** - Developer-focused aesthetic
- **Dark Mode Default** - Light mode optional
- **Clean Typography** - Generous whitespace
- **Subtle Accents** - Borders and shadows used sparingly
- **Syntax Highlighting** - For all code blocks

### Design References

- [Notion](https://notion.so) - Clean organization
- [Linear](https://linear.app) - Modern dev aesthetic
- [Raycast](https://raycast.com) - Quick access patterns

### Screenshots

Refer to the screenshots below as a base for the dashboard UI. It does not have to be exact. Use it as a reference:

- @context/screenshots/dashboard.png
- @context/screenshots/meetings.png
- @context/screenshots/members.png
- @context/screenshots/payments.png
- @context/screenshots/meeting-drawer.png
- @context/screenshots/member-drawer.png

## Project Architecture

```
akubueze/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── reset-password/
│   ├── dashboard/
│   │   ├── page.tsx              # Role-aware dashboard
│   │   └── layout.tsx
│   ├── admin/
│   │   ├── members/
│   │   ├── settings/
│   │   └── reports/
│   ├── meetings/
│   │   ├── page.tsx              # List all meetings
│   │   └── [id]/
│   │       ├── page.tsx          # Meeting detail
│   │       └── attendance/
│   ├── payments/
│   │   ├── page.tsx
│   │   └── [id]/
│   ├── announcements/
│   ├── profile/
│   └── api/
│       ├── auth/[...nextauth]/
│       ├── members/
│       ├── meetings/
│       ├── payments/
│       └── announcements/
│
├── components/
│   ├── ui/                       # ShadCN components
│   ├── layout/                   # Sidebar, Navbar, etc.
│   ├── members/
│   ├── meetings/
│   ├── payments/
│   └── dashboard/
│
├── lib/
│   ├── prisma.ts                 # Prisma client singleton
│   ├── auth.ts                   # Auth.js config
│   ├── uploadthing.ts
│   ├── resend.ts
│   └── utils.ts
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                   # Seed super admin account
│
├── middleware.ts                 # Route protection by role
├── .env.local
└── next.config.ts
```

---

## Key Design Decisions

**Why no public sign-up?**
Age grade associations are closed communities. Membership is earned through community ties, not self-registration. Enforcing invite-only at the platform level ensures data integrity and prevents unauthorized access.

**Why Auth.js (NextAuth v5) over custom JWT?**
Auth.js v5 is designed for the Next.js App Router. It handles session management, CSRF, and token rotation out of the box, reducing boilerplate and security surface area.

**Why Neon (serverless Postgres)?**
Neon pairs perfectly with Vercel deployments — both are serverless-first, support connection pooling via `DATABASE_URL`, and have a generous free tier suited for association-scale usage.

**Why Uploadthing for file uploads?**
Meeting minutes and receipts are user-uploaded files (PDFs). Uploadthing provides storage, CDN delivery, and a clean Next.js upload API without needing separate S3 configuration.

**Why Resend for emails?**
Credential delivery (temporary passwords) and meeting reminders are critical paths. Resend offers high deliverability, a clean API, and React Email template support.

---

*Last updated: May 2026 — added meeting host & dues model*