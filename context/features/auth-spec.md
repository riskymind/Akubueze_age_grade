# 🔐 Akubueze — Authentication Specification

> Complete implementation reference for authentication, session management, route protection, and the full account lifecycle in the Akubueze system.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Choices](#tech-choices)
- [Environment Variables](#environment-variables)
- [Database Fields](#database-fields)
- [Auth.js Configuration](#authjs-configuration)
- [Session Shape](#session-shape)
- [Account Lifecycle](#account-lifecycle)
  - [Account Creation](#1-account-creation)
  - [First Login & Forced Password Reset](#2-first-login--forced-password-reset)
  - [Normal Login](#3-normal-login)
  - [Admin-Triggered Password Reset](#4-admin-triggered-password-reset)
  - [Self-Service Password Change](#5-self-service-password-change)
  - [Logout](#6-logout)
  - [Suspended / Inactive Account Handling](#7-suspended--inactive-account-handling)
- [Route Protection](#route-protection)
  - [Middleware](#middleware)
  - [Route Permission Matrix](#route-permission-matrix)
- [RBAC — Role-Based Access Control](#rbac--role-based-access-control)
- [Email Templates](#email-templates)
- [File Structure](#file-structure)
- [Implementation Reference](#implementation-reference)
  - [auth.ts](#authts)
  - [middleware.ts](#middlewarets)
  - [Helper Utilities](#helper-utilities)
  - [Server Actions](#server-actions)
- [Security Rules](#security-rules)
- [Error Reference](#error-reference)

---

## Overview

Akubueze uses a **closed, invite-only authentication model**. There is no public sign-up. Every account is created by an administrator. The system enforces:

- Credentials-only login (email + password)
- Bcrypt password hashing
- Forced password change on first login (`mustResetPassword` flag)
- Role-based route access (`SUPER_ADMIN`, `ADMIN`, `MEMBER`)
- Suspended and inactive account blocking
- Admin-triggered password resets with secure token delivery via email

---

## Tech Choices

| Concern | Choice | Reason |
|---|---|---|
| Auth framework | **Auth.js v5 (NextAuth)** | Native App Router support, handles CSRF, session, and token rotation |
| Strategy | **Credentials Provider** | No OAuth needed — invite-only system |
| Session storage | **JWT (stateless)** | No DB hit per request; role is encoded in the token |
| Password hashing | **bcryptjs** (cost factor 12) | Standard, well-supported, works in Node.js edge-compatible environments |
| Email delivery | **Resend** | Password reset and credential emails |
| Token generation | **`crypto.randomBytes`** | Cryptographically secure reset tokens |

> **Why JWT over database sessions?**
> Database sessions require a round-trip on every request to validate. For an association platform with moderate traffic, JWT sessions with a short expiry (24h) and a `role` claim embedded in the token gives fast, stateless route protection via middleware without added DB load.

---

## Environment Variables

```env
# .env.local

# Auth.js
AUTH_SECRET=                  # openssl rand -base64 32
AUTH_URL=http://localhost:3000 # Full URL of your deployment

# Database (Neon)
DATABASE_URL=                  # Pooled connection string
DIRECT_URL=                    # Direct connection string (for migrations)

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@akubueze.com
```

Generate `AUTH_SECRET`:
```bash
openssl rand -base64 32
```

---

## Database Fields

The following fields on the `User` model drive authentication behaviour:

| Field | Type | Purpose |
|---|---|---|
| `email` | `String @unique` | Login identifier |
| `passwordHash` | `String` | bcrypt hash of the user's password |
| `role` | `Role` enum | Determines route access level |
| `status` | `MemberStatus` enum | Blocks login if `SUSPENDED` or `INACTIVE` |
| `mustResetPassword` | `Boolean` | Forces password change on first login |
| `resetToken` | `String?` | Secure random token for password resets |
| `resetTokenExpiry` | `DateTime?` | Expiry timestamp for the reset token |

Add `resetToken` and `resetTokenExpiry` to your schema:

```prisma
model User {
  // ... existing fields

  resetToken       String?   @unique
  resetTokenExpiry DateTime?

  // ... rest of model
}
```

---

## Auth.js Configuration

```
lib/auth.ts          — Core Auth.js config (providers, callbacks, session)
lib/auth.actions.ts  — Server actions for login, logout, password operations
middleware.ts        — Edge middleware for route protection
```

---

## Session Shape

The JWT session is extended to include `id`, `role`, and `mustResetPassword`. This allows middleware and server components to make access decisions without a DB query.

```typescript
// types/next-auth.d.ts
import { DefaultSession } from 'next-auth'
import { Role, MemberStatus } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: Role
      status: MemberStatus
      mustResetPassword: boolean
    } & DefaultSession['user']
  }

  interface User {
    id: string
    role: Role
    status: MemberStatus
    mustResetPassword: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: Role
    status: MemberStatus
    mustResetPassword: boolean
  }
}
```

---

## Account Lifecycle

### 1. Account Creation

Only `SUPER_ADMIN` and `ADMIN` users can create accounts. There is no public sign-up route.

```
Admin fills in:
  - Full name
  - Email address
  - Role (MEMBER or ADMIN)
  - Phone (optional)

System does:
  1. Generates a secure temporary password (12 chars, mixed case + digits + symbol)
  2. Hashes it with bcrypt (cost 12)
  3. Creates the User record with mustResetPassword: true
  4. Sends a welcome email via Resend with login credentials
```

**Temporary password generation:**
```typescript
import crypto from 'crypto'

function generateTempPassword(): string {
  // 12 printable ASCII characters, URL-safe
  return crypto.randomBytes(9).toString('base64url').slice(0, 12)
}
```

> The temporary password is shown **once** in the email. It is never stored in plaintext. If the member loses it, an admin must trigger a password reset.

---

### 2. First Login & Forced Password Reset

When a member logs in with `mustResetPassword: true`, the system must prevent them from accessing any other page until the password is changed.

```
Member submits login form
        │
        ▼
Auth.js validates credentials
        │
        ▼
Session created with mustResetPassword: true
        │
        ▼
Middleware detects mustResetPassword: true
        │
        ├── Request is NOT for /auth/reset-password  →  redirect to /auth/reset-password
        │
        └── Request IS for /auth/reset-password  →  allow through
```

On the `/auth/reset-password` page:
- Member enters new password + confirmation
- New password must meet the password policy (see [Security Rules](#security-rules))
- On success: `mustResetPassword` set to `false`, session reissued, redirect to `/dashboard`

---

### 3. Normal Login

```
POST /api/auth/callback/credentials
  body: { email, password }
        │
        ▼
  Fetch user by email from DB
        │
  ├── Not found  →  return null  →  Auth.js shows generic error
        │
  ▼
  bcrypt.compare(password, user.passwordHash)
        │
  ├── Mismatch  →  return null  →  generic error
        │
  ▼
  Check user.status
        │
  ├── SUSPENDED  →  throw "AccountSuspended"
  ├── INACTIVE   →  throw "AccountInactive"
        │
  ▼
  Return user object (id, email, name, role, status, mustResetPassword)
        │
        ▼
  JWT callback encodes role, status, mustResetPassword into token
        │
        ▼
  Session callback exposes token fields on session.user
        │
        ▼
  Middleware runs on next request:
    mustResetPassword: true  →  /auth/reset-password
    mustResetPassword: false →  /dashboard (or intended route)
```

**Important:** Never expose whether an email exists or not in the error message. Always return a generic message: *"Invalid email or password."*

---

### 4. Admin-Triggered Password Reset

Admins can trigger a password reset for any member. `SUPER_ADMIN` can reset any account. `ADMIN` can reset `MEMBER` accounts only.

```
Admin clicks "Reset Password" on member profile
        │
        ▼
Server action: generatePasswordReset(userId)
        │
        ▼
  1. Generate token: crypto.randomBytes(32).toString('hex')
  2. Store hashed token on user: resetToken = sha256(token)
  3. Set resetTokenExpiry = now + 1 hour
  4. Send reset email to member with link:
     https://yourdomain.com/auth/set-password?token=<raw_token>
        │
        ▼
Member clicks link → /auth/set-password?token=...
        │
        ▼
Server action: consumeResetToken(token, newPassword)
  1. Hash incoming token: sha256(token)
  2. Find user where resetToken = hash AND resetTokenExpiry > now
  3. If not found or expired → error: "Reset link is invalid or has expired"
  4. Hash new password with bcrypt
  5. Update user: passwordHash, mustResetPassword: false,
                  resetToken: null, resetTokenExpiry: null
  6. Redirect to /login with success toast
```

> Store a **SHA-256 hash** of the token in the DB, never the raw token. This way, even if the DB is compromised, reset links cannot be reused.

```typescript
import crypto from 'crypto'

const hashToken = (token: string) =>
  crypto.createHash('sha256').update(token).digest('hex')
```

---

### 5. Self-Service Password Change

Any logged-in member can change their own password from their profile settings.

```
Member submits: { currentPassword, newPassword, confirmPassword }
        │
        ▼
Server action: changePassword(userId, currentPassword, newPassword)
  1. Fetch user.passwordHash from DB
  2. bcrypt.compare(currentPassword, passwordHash)
     └── Mismatch → error: "Current password is incorrect"
  3. Validate newPassword against policy
  4. bcrypt.hash(newPassword, 12)
  5. Update user.passwordHash
  6. Return success
```

---

### 6. Logout

```typescript
// Server action or form action
import { signOut } from '@/lib/auth'

await signOut({ redirectTo: '/login' })
```

Auth.js clears the JWT session cookie on logout. No additional DB cleanup needed for stateless JWT sessions.

---

### 7. Suspended / Inactive Account Handling

A suspended or inactive account must be blocked at **two layers**:

**Layer 1 — Login:** The Credentials provider authorize callback checks `user.status` and throws a named error before a session is ever created.

**Layer 2 — Middleware:** If a user's status is changed to `SUSPENDED` while they are already logged in, the next request will pass through middleware. Because JWT sessions don't invalidate automatically, middleware must re-check `status` from the token.

> For immediate effect on suspension (without waiting for token expiry), switch the session strategy from `jwt` to `database` sessions, or maintain a Redis blocklist of suspended user IDs checked in middleware. For an association platform, waiting for the 24h token expiry is usually acceptable — document the chosen approach.

**Redirect targets:**
- `SUSPENDED` → `/auth/suspended` (custom page explaining the suspension)
- `INACTIVE` → `/auth/inactive`

---

## Route Protection

### Middleware

`middleware.ts` runs on every request matched by the `config.matcher`. It performs four checks in order:

```
Request comes in
      │
      ▼
1. Is the route public (/login, /auth/*)? → allow through
      │
      ▼
2. Is there a valid session? → No → redirect to /login
      │
      ▼
3. Is user SUSPENDED or INACTIVE? → redirect to /auth/suspended or /auth/inactive
      │
      ▼
4. Is mustResetPassword: true AND route ≠ /auth/reset-password? → redirect to /auth/reset-password
      │
      ▼
5. Does the user's role satisfy the route's required role? → No → redirect to /unauthorized
      │
      ▼
Allow request through
```

### Route Permission Matrix

| Route | `MEMBER` | `ADMIN` | `SUPER_ADMIN` |
|---|:---:|:---:|:---:|
| `/login` | ✓ (public) | ✓ | ✓ |
| `/auth/reset-password` | ✓ (public) | ✓ | ✓ |
| `/auth/set-password` | ✓ (public) | ✓ | ✓ |
| `/dashboard` | ✓ | ✓ | ✓ |
| `/meetings` | ✓ | ✓ | ✓ |
| `/meetings/[id]` | ✓ | ✓ | ✓ |
| `/payments` | ✓ (own only) | ✓ (all) | ✓ |
| `/announcements` | ✓ | ✓ | ✓ |
| `/profile` | ✓ | ✓ | ✓ |
| `/admin/members` | ✗ | ✓ | ✓ |
| `/admin/meetings/create` | ✗ | ✓ | ✓ |
| `/admin/payments/record` | ✗ | ✓ | ✓ |
| `/admin/announcements/create` | ✗ | ✓ | ✓ |
| `/admin/reports` | ✗ | ✓ | ✓ |
| `/admin/settings` | ✗ | ✗ | ✓ |
| `/admin/admins` | ✗ | ✗ | ✓ |

---

## RBAC — Role-Based Access Control

Beyond route-level protection, individual actions inside pages and API routes must also verify roles. Use a reusable server-side helper:

```typescript
// lib/auth.utils.ts

import { auth } from '@/lib/auth'
import { Role } from '@prisma/client'
import { redirect } from 'next/navigation'

/**
 * Call at the top of a Server Component or Server Action.
 * Throws/redirects if the session doesn't satisfy the required role.
 */
export async function requireRole(...roles: Role[]) {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (!roles.includes(session.user.role)) redirect('/unauthorized')
  return session
}

// Usage in a Server Component:
// const session = await requireRole('ADMIN', 'SUPER_ADMIN')
```

**Role hierarchy helper** — useful for checks like "can this user manage that user?":

```typescript
export const ROLE_RANK: Record<Role, number> = {
  MEMBER:      1,
  ADMIN:       2,
  SUPER_ADMIN: 3,
}

export const hasHigherRole = (actor: Role, target: Role) =>
  ROLE_RANK[actor] > ROLE_RANK[target]

// Example: ADMIN can reset MEMBER passwords, but not SUPER_ADMIN passwords
// hasHigherRole('ADMIN', 'MEMBER')      → true  ✓
// hasHigherRole('ADMIN', 'SUPER_ADMIN') → false ✗
```

---

## Email Templates

All emails are sent via **Resend** using **React Email** templates.

### Welcome / Credentials Email

**To:** New member  
**Subject:** `Your Akubueze account is ready`  
**Trigger:** Admin creates a new member account

```
Hi [Full Name],

Your Akubueze Age Grade Association account has been created.

Log in at: https://yourdomain.com/login

Email:    [email]
Password: [temporary_password]

You will be asked to set a new password when you first log in.

If you did not expect this email, please contact your administrator.

— Akubueze Management System
```

### Password Reset Email

**To:** Member requesting reset  
**Subject:** `Reset your Akubueze password`  
**Trigger:** Admin triggers a password reset for a member  
**Link expiry:** 1 hour

```
Hi [Full Name],

A password reset has been requested for your Akubueze account.

Click the link below to set a new password:
https://yourdomain.com/auth/set-password?token=[token]

This link expires in 1 hour.

If you did not request this, you can ignore this email.
Your password will not change unless you click the link above.

— Akubueze Management System
```

---

## File Structure

```
lib/
├── auth.ts              # Auth.js config — providers, callbacks, session
├── auth.utils.ts        # requireRole(), hasHigherRole(), getCurrentUser()
└── auth.actions.ts      # Server actions — login, logout, password ops

app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx          # Login form (no sign-up link)
│   ├── reset-password/
│   │   └── page.tsx          # First-login forced password change
│   ├── set-password/
│   │   └── page.tsx          # Admin-triggered reset (token from URL)
│   ├── suspended/
│   │   └── page.tsx          # Shown to suspended members
│   └── inactive/
│       └── page.tsx          # Shown to inactive members

middleware.ts                 # Edge middleware — route protection
types/
└── next-auth.d.ts            # Session type augmentation
```

---

## Implementation Reference

### auth.ts

```typescript
// lib/auth.ts
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { MemberStatus } from '@prisma/client'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user) return null

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )
        if (!passwordMatch) return null

        if (user.status === MemberStatus.SUSPENDED) {
          throw new Error('AccountSuspended')
        }
        if (user.status === MemberStatus.INACTIVE) {
          throw new Error('AccountInactive')
        }

        return {
          id:               user.id,
          name:             user.fullName,
          email:            user.email,
          role:             user.role,
          status:           user.status,
          mustResetPassword: user.mustResetPassword,
        }
      },
    }),
  ],

  session: { strategy: 'jwt' },

  callbacks: {
    async jwt({ token, user }) {
      // On sign-in, user object is available — encode custom fields
      if (user) {
        token.id               = user.id
        token.role             = user.role
        token.status           = user.status
        token.mustResetPassword = user.mustResetPassword
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id               = token.id
        session.user.role             = token.role
        session.user.status           = token.status
        session.user.mustResetPassword = token.mustResetPassword
      }
      return session
    },
  },

  pages: {
    signIn:  '/login',
    error:   '/login',        // Auth errors redirect back to login
  },
})
```

---

### middleware.ts

```typescript
// middleware.ts
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Role } from '@prisma/client'

// Routes that do NOT require authentication
const PUBLIC_ROUTES = ['/login', '/auth/suspended', '/auth/inactive']

// Routes that require ADMIN or SUPER_ADMIN
const ADMIN_ROUTES  = ['/admin']

// Routes that require SUPER_ADMIN only
const SUPERADMIN_ROUTES = ['/admin/settings', '/admin/admins']

export default auth((req: NextRequest & { auth: any }) => {
  const { nextUrl, auth: session } = req as any
  const pathname = nextUrl.pathname

  // 1. Allow public routes and Next.js internals through unconditionally
  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r))
    || pathname.startsWith('/_next')
    || pathname.startsWith('/favicon')
  if (isPublic) return NextResponse.next()

  // 2. No session → redirect to login
  if (!session?.user) {
    const loginUrl = new URL('/login', nextUrl.origin)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const { role, status, mustResetPassword } = session.user

  // 3. Blocked accounts
  if (status === 'SUSPENDED') return NextResponse.redirect(new URL('/auth/suspended', nextUrl.origin))
  if (status === 'INACTIVE')  return NextResponse.redirect(new URL('/auth/inactive',  nextUrl.origin))

  // 4. Force password reset
  if (mustResetPassword && !pathname.startsWith('/auth/reset-password')) {
    return NextResponse.redirect(new URL('/auth/reset-password', nextUrl.origin))
  }

  // 5. SUPER_ADMIN-only routes
  if (SUPERADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    if (role !== 'SUPER_ADMIN') return NextResponse.redirect(new URL('/unauthorized', nextUrl.origin))
  }

  // 6. Admin routes
  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    if (role === 'MEMBER') return NextResponse.redirect(new URL('/unauthorized', nextUrl.origin))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
}
```

---

### Helper Utilities

```typescript
// lib/auth.utils.ts
import { auth } from '@/lib/auth'
import { Role } from '@prisma/client'
import { redirect } from 'next/navigation'

/** Get current session user in a Server Component. Redirects to /login if unauthenticated. */
export async function getCurrentUser() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  return session.user
}

/** Enforce a role requirement. Redirects to /unauthorized if the role isn't satisfied. */
export async function requireRole(...roles: Role[]) {
  const user = await getCurrentUser()
  if (!roles.includes(user.role)) redirect('/unauthorized')
  return user
}

/** True if the actor's role rank is strictly higher than the target's. */
export const ROLE_RANK: Record<Role, number> = {
  MEMBER: 1, ADMIN: 2, SUPER_ADMIN: 3,
}
export const canManage = (actor: Role, target: Role) =>
  ROLE_RANK[actor] > ROLE_RANK[target]
```

---

### Server Actions

```typescript
// lib/auth.actions.ts
'use server'

import { prisma } from '@/lib/prisma'
import { signOut }  from '@/lib/auth'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { Resend } from 'resend'
import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/auth.utils'

const resend = new Resend(process.env.RESEND_API_KEY)
const hashToken = (t: string) => crypto.createHash('sha256').update(t).digest('hex')

// ── Logout ────────────────────────────────────────────────
export async function logout() {
  await signOut({ redirectTo: '/login' })
}

// ── Self-service password change ──────────────────────────
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } })

  const match = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!match) return { error: 'Current password is incorrect.' }

  const hash = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: hash, mustResetPassword: false },
  })

  return { success: true }
}

// ── Admin-triggered password reset ────────────────────────
export async function triggerPasswordReset(targetUserId: string) {
  const actor = await requireRole('ADMIN', 'SUPER_ADMIN')

  const target = await prisma.user.findUniqueOrThrow({ where: { id: targetUserId } })

  // ADMIN cannot reset SUPER_ADMIN passwords
  if (!canManage(actor.role, target.role)) {
    return { error: 'You do not have permission to reset this account.' }
  }

  const rawToken   = crypto.randomBytes(32).toString('hex')
  const hashedToken = hashToken(rawToken)
  const expiry     = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  await prisma.user.update({
    where: { id: targetUserId },
    data: { resetToken: hashedToken, resetTokenExpiry: expiry },
  })

  const resetUrl = `${process.env.AUTH_URL}/auth/set-password?token=${rawToken}`

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to:   target.email,
    subject: 'Reset your Akubueze password',
    html: `
      <p>Hi ${target.fullName},</p>
      <p>A password reset was requested for your account.</p>
      <p><a href="${resetUrl}">Click here to set a new password</a></p>
      <p>This link expires in 1 hour.</p>
      <p>If you did not request this, ignore this email.</p>
    `,
  })

  return { success: true }
}

// ── Consume reset token (set-password page) ───────────────
export async function consumeResetToken(rawToken: string, newPassword: string) {
  const hashedToken = hashToken(rawToken)

  const user = await prisma.user.findFirst({
    where: {
      resetToken:       hashedToken,
      resetTokenExpiry: { gt: new Date() },
    },
  })

  if (!user) return { error: 'Reset link is invalid or has expired.' }

  const hash = await bcrypt.hash(newPassword, 12)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash:      hash,
      mustResetPassword: false,
      resetToken:        null,
      resetTokenExpiry:  null,
    },
  })

  redirect('/login?reset=success')
}

// ── Create member account (Admin only) ───────────────────
export async function createMemberAccount(data: {
  fullName: string
  email: string
  role: 'MEMBER' | 'ADMIN'
  phone?: string
}) {
  await requireRole('ADMIN', 'SUPER_ADMIN')

  const tempPassword = crypto.randomBytes(9).toString('base64url').slice(0, 12)
  const hash = await bcrypt.hash(tempPassword, 12)

  const user = await prisma.user.create({
    data: {
      fullName:         data.fullName,
      email:            data.email,
      phone:            data.phone,
      passwordHash:     hash,
      role:             data.role,
      mustResetPassword: true,
    },
  })

  await resend.emails.send({
    from:    process.env.RESEND_FROM_EMAIL!,
    to:      user.email,
    subject: 'Your Akubueze account is ready',
    html: `
      <p>Hi ${user.fullName},</p>
      <p>Your Akubueze account has been created.</p>
      <p><strong>Email:</strong> ${user.email}<br/>
         <strong>Password:</strong> ${tempPassword}</p>
      <p>Log in at: <a href="${process.env.AUTH_URL}/login">${process.env.AUTH_URL}/login</a></p>
      <p>You will be asked to set a new password on first login.</p>
    `,
  })

  return { success: true, userId: user.id }
}
```

---

## Security Rules

### Password Policy

| Rule | Requirement |
|---|---|
| Minimum length | 8 characters |
| Uppercase letter | At least 1 |
| Lowercase letter | At least 1 |
| Number | At least 1 |
| Special character | At least 1 (`!@#$%^&*`) |
| Cannot reuse | Current password (checked at change time) |

Enforce with Zod on both client and server:

```typescript
import { z } from 'zod'

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Must contain at least one number')
  .regex(/[!@#$%^&*]/, 'Must contain at least one special character (!@#$%^&*)')
```

### General Security

- **Never expose whether an email exists.** Login errors always say *"Invalid email or password."*
- **bcrypt cost factor 12** — high enough to be slow for brute-force, fast enough for normal use.
- **Reset tokens are SHA-256 hashed** before DB storage. Raw token only travels in the email link.
- **Reset tokens expire in 1 hour** and are nulled out after use.
- **No password in logs** — never log credentials, tokens, or hashes.
- **HTTPS only in production** — Auth.js cookies are `Secure` and `HttpOnly` by default.
- **CSRF protection** — handled automatically by Auth.js for all auth routes.
- **Rate limiting** — add rate limiting to `/api/auth/callback/credentials` to prevent brute-force. Use Upstash Rate Limit or a simple in-memory limiter for low-traffic deployments.

---

## Error Reference

| Error code / message | Cause | User-facing message |
|---|---|---|
| `CredentialsSignin` | Wrong email or password | "Invalid email or password." |
| `AccountSuspended` | User status is SUSPENDED | "Your account has been suspended. Contact your administrator." |
| `AccountInactive` | User status is INACTIVE | "This account is no longer active. Contact your administrator." |
| `Reset link is invalid or has expired` | Token not found or past expiry | "This reset link is invalid or has expired. Please request a new one." |
| `Current password is incorrect` | bcrypt mismatch on self-change | "The current password you entered is incorrect." |
| `You do not have permission` | Role rank violation | "You do not have permission to perform this action." |

---

*Last updated: May 2026*