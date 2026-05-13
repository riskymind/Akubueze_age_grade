# 🏛️ Akubueze — Age Grade Association Management System

> A private, invite-only web application for managing age grade associations — covering membership, meetings, attendance, finances, and internal communications.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Authentication & Access Control](#authentication--access-control)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Models](#database-models)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Authentication Flow](#authentication-flow)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Security](#security)
- [License](#license)

---

# Overview

Akubueze is a modern web platform designed for age grade associations and community unions to manage members, meetings, attendance, contributions, announcements, and administrative operations digitally.

The platform is intentionally private and membership-based.

✅ No public registration  
✅ No open sign-up  
✅ Only administrators can create accounts

The goal is to eliminate paper-based processes and improve transparency, accountability, and communication within the association.

---

# Features

## 👥 Member Management

- Create member accounts
- Assign roles and permissions
- Suspend/reactivate members
- Search and filter members
- Manage member profiles

---

## 🔐 Authentication & Authorization

- Secure login system
- Role-based access control (RBAC)
- Protected routes using middleware
- First-login password reset flow
- Admin-controlled onboarding

---

## 📅 Meeting Management

- Create and schedule meetings
- Manage agendas and meeting notes
- Upload meeting minutes
- Categorize meetings by type
- Track meeting status

---

## 🙋 Attendance Tracking

- Mark attendance
- View attendance reports
- Track absentees
- Meeting participation analytics

---

## 💰 Financial Management

- Track dues and levies
- Record contributions and fines
- Generate receipts
- Payment history per member
- Financial summaries and reports

---

## 📢 Announcements

- Post important notices
- Pin announcements
- Meeting reminders
- Read/unread tracking

---

## 📊 Dashboard & Reports

### Admin Dashboard
- Total members
- Upcoming meetings
- Financial overview
- Attendance summary
- Recent activities

### Member Dashboard
- Upcoming meetings
- Attendance history
- Payment history
- Announcements

---

# Authentication & Access Control

The application uses a strict invite-only authentication flow.

## User Roles

### 👑 Super Admin
Full system access and configuration permissions.

### 🛠️ Admin / Executives
Operational management permissions.

### 👤 Member
Standard member access.

---

# Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | ShadCN UI |
| Database | PostgreSQL |
| ORM | Prisma ORM |
| Authentication | Auth.js (NextAuth v5) |
| File Uploads | Uploadthing |
| Email Service | Resend |
| Charts | Recharts |
| Form Handling | React Hook Form |
| Validation | Zod |

---

# Project Structure

```txt
akubueze/
├── app/
│   ├── (auth)/
│   ├── dashboard/
│   ├── admin/
│   ├── meetings/
│   ├── payments/
│   ├── announcements/
│   ├── profile/
│   └── api/
│
├── components/
│   ├── ui/
│   ├── dashboard/
│   ├── members/
│   ├── meetings/
│   └── payments/
│
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── resend.ts
│   └── utils.ts
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── middleware.ts
├── .env.local
└── next.config.ts
```

---

# Database Models

Main entities:

- `User`
- `Meeting`
- `Attendance`
- `Payment`
- `Announcement`
- `AnnouncementRead`

---

# Getting Started

## 1. Clone the Repository

```bash
git clone https://github.com/yourusername/akubueze.git

cd akubueze
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create a `.env.local` file:

```env
DATABASE_URL=""

AUTH_SECRET=""

AUTH_URL="http://localhost:3000"

RESEND_API_KEY=""

UPLOADTHING_SECRET=""

UPLOADTHING_APP_ID=""
```

---

## 4. Run Prisma Migration

```bash
npx prisma migrate dev
```

---

## 5. Seed Super Admin

```bash
npx prisma db seed
```

---

## 6. Start Development Server

```bash
npm run dev
```

Application will run on:

```txt
http://localhost:3000
```

---

# Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL database connection |
| `AUTH_SECRET` | Auth.js secret |
| `AUTH_URL` | Application URL |
| `RESEND_API_KEY` | Resend email API key |
| `UPLOADTHING_SECRET` | Uploadthing secret |
| `UPLOADTHING_APP_ID` | Uploadthing app ID |

---

# Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build production app
npm run start        # Start production server
npm run lint         # Run ESLint
npm run prisma:studio # Open Prisma Studio
```

---

# Authentication Flow

```txt
Admin creates member account
        ↓
System generates temporary password
        ↓
Member receives login credentials
        ↓
Member logs in
        ↓
Forced password reset
        ↓
Dashboard access granted
```

---

# Deployment

## Recommended Stack

| Service | Platform |
|---|---|
| Frontend | Vercel |
| Database | Neon PostgreSQL |
| File Uploads | Uploadthing |
| Emails | Resend |

---

# Security

The platform implements:

- Password hashing with bcrypt
- Route protection via middleware
- Role-based authorization
- Session validation
- Secure server actions
- Input validation using Zod

---

# Roadmap

## Planned Features

- QR attendance scanning
- Online payment integration
- Push notifications
- SMS reminders
- Multi-branch support
- Voting & polls
- Audit logging
- Mobile application

---

# License

MIT License

---

# Author

Built for modern age grade associations and community unions.

---

*Last updated: May 2026*