# 👥 Akubueze — Members Page Spec (`/admin/members`)

> Implementation reference for Claude Code. This spec covers every file to create, every component, all data fetching, server actions, and UI behaviour for the Members section.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Access Control](#access-control)
- [Files to Create](#files-to-create)
- [Data Layer](#data-layer)
  - [Queries](#queries)
  - [Server Actions](#server-actions)
- [Page Breakdown](#page-breakdown)
  - [Members List Page](#1-members-list-page-adminmembers)
  - [Member Detail Page](#2-member-detail-page-adminmembersid)
  - [Add Member Sheet](#3-add-member-sheet)
  - [Edit Member Sheet](#4-edit-member-sheet)
  - [Suspend / Reactivate Dialog](#5-suspend--reactivate-dialog)
  - [Reset Password Action](#6-reset-password-action)
- [Component Specs](#component-specs)
- [URL & Search Params](#url--search-params)
- [Types](#types)
- [Behaviour Rules](#behaviour-rules)
- [Error Handling](#error-handling)

---

## Overview

The Members section is the primary people-management interface. It is split into:

| View | Route | Purpose |
|---|---|---|
| Members list | `/admin/members` | Table of all members with search, filter, and actions |
| Member detail | `/admin/members/[id]` | Full profile + attendance history + payment history |

Both routes are **admin-only**. Regular members cannot access either route — middleware handles this.

---

## Access Control

```typescript
// At the top of every Server Component and Server Action in this section:
import { requireRole } from '@/lib/auth.utils'
await requireRole('ADMIN', 'SUPER_ADMIN')
```

**Additional role rules within the section:**

| Action | ADMIN | SUPER_ADMIN |
|---|:---:|:---:|
| View members list | ✓ | ✓ |
| View member detail | ✓ | ✓ |
| Create MEMBER account | ✓ | ✓ |
| Create ADMIN account | ✗ | ✓ |
| Edit member profile | ✓ | ✓ |
| Suspend / reactivate MEMBER | ✓ | ✓ |
| Suspend / reactivate ADMIN | ✗ | ✓ |
| Reset MEMBER password | ✓ | ✓ |
| Reset ADMIN password | ✗ | ✓ |
| Assign ADMIN role | ✗ | ✓ |

Use `canManage(actorRole, targetRole)` from `lib/auth.utils.ts` to enforce these dynamically.

---

## Files to Create

```
app/
└── admin/
    └── members/
        ├── page.tsx                          # Members list (Server Component)
        ├── loading.tsx                       # Skeleton loader for list
        ├── [id]/
        │   ├── page.tsx                      # Member detail (Server Component)
        │   └── loading.tsx                   # Skeleton loader for detail
        └── _components/
            ├── MembersTable.tsx              # Data table (Client Component)
            ├── MembersTableColumns.tsx       # Column definitions
            ├── MembersFilters.tsx            # Search + filter bar (Client Component)
            ├── AddMemberSheet.tsx            # Slide-in form to create member
            ├── EditMemberSheet.tsx           # Slide-in form to edit member
            ├── SuspendMemberDialog.tsx       # Confirm suspend / reactivate
            ├── ResetPasswordButton.tsx       # One-click reset password trigger
            ├── MemberStatusBadge.tsx         # Reusable status badge
            ├── MemberRoleBadge.tsx           # Reusable role badge
            ├── MemberAttendanceCard.tsx      # Attendance summary on detail page
            └── MemberPaymentsCard.tsx        # Payments summary on detail page

lib/
└── members/
    ├── members.queries.ts                    # Prisma read queries
    ├── members.actions.ts                    # Server actions (create, edit, suspend, reset)
    └── members.schemas.ts                    # Zod validation schemas
```

---

## Data Layer

### Queries

**File:** `lib/members/members.queries.ts`

```typescript
import { prisma } from '@/lib/prisma'
import { MemberStatus, Role } from '@prisma/client'

export type MemberListItem = {
  id: string
  fullName: string
  email: string
  phone: string | null
  gender: string | null
  role: Role
  status: MemberStatus
  occupation: string | null
  dateJoined: Date
  _count: {
    attendances: number
    payments: number
  }
}

export type MemberFilters = {
  search?: string       // matches fullName, email, phone
  status?: MemberStatus
  role?: Role
  gender?: string
  page?: number         // default 1
  pageSize?: number     // default 20
}

/**
 * Paginated list of all members with basic counts.
 * Used on the /admin/members list page.
 */
export async function getMembers(filters: MemberFilters = {}) {
  const { search, status, role, gender, page = 1, pageSize = 20 } = filters
  const skip = (page - 1) * pageSize

  const where = {
    ...(search && {
      OR: [
        { fullName:  { contains: search, mode: 'insensitive' as const } },
        { email:     { contains: search, mode: 'insensitive' as const } },
        { phone:     { contains: search, mode: 'insensitive' as const } },
        { occupation:{ contains: search, mode: 'insensitive' as const } },
      ],
    }),
    ...(status && { status }),
    ...(role   && { role }),
    ...(gender && { gender: gender as any }),
  }

  const [members, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { dateJoined: 'desc' },
      select: {
        id: true, fullName: true, email: true, phone: true,
        gender: true, role: true, status: true, occupation: true,
        dateJoined: true, profileImageUrl: true,
        _count: { select: { attendances: true, payments: true } },
      },
    }),
    prisma.user.count({ where }),
  ])

  return {
    members,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

/**
 * Full member detail including attendance and payment history.
 * Used on the /admin/members/[id] detail page.
 */
export async function getMemberById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      attendances: {
        include: { meeting: { select: { id: true, title: true, type: true, scheduledAt: true } } },
        orderBy: { markedAt: 'desc' },
      },
      payments: {
        orderBy: { createdAt: 'desc' },
      },
      meetingPayments: {
        include: { meeting: { select: { id: true, title: true, scheduledAt: true } } },
        orderBy: { createdAt: 'desc' },
      },
      createdBy: { select: { id: true, fullName: true } },
    },
  })
}

/**
 * Quick summary stats for the member detail page header.
 */
export async function getMemberStats(userId: string) {
  const [totalMeetings, attended, paidDues, pendingDues] = await Promise.all([
    // Total meetings since the member joined
    prisma.meeting.count({
      where: { status: 'COMPLETED', scheduledAt: { gte: await getMemberJoinDate(userId) } },
    }),
    // Meetings attended (PRESENT or EXCUSED)
    prisma.attendance.count({
      where: { userId, status: { in: ['PRESENT', 'EXCUSED'] } },
    }),
    // Paid monthly dues
    prisma.payment.count({
      where: { userId, type: 'MONTHLY_DUES', status: 'PAID' },
    }),
    // Pending monthly dues
    prisma.payment.count({
      where: { userId, type: 'MONTHLY_DUES', status: 'PENDING' },
    }),
  ])

  const attendanceRate = totalMeetings > 0
    ? Math.round((attended / totalMeetings) * 100)
    : 0

  return { totalMeetings, attended, attendanceRate, paidDues, pendingDues }
}

async function getMemberJoinDate(userId: string): Promise<Date> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { dateJoined: true },
  })
  return user.dateJoined
}
```

---

### Server Actions

**File:** `lib/members/members.actions.ts`

All actions are `'use server'`. All actions call `requireRole` before doing anything.

---

#### `createMember`

```typescript
'use server'
import { requireRole } from '@/lib/auth.utils'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { Resend } from 'resend'
import { revalidatePath } from 'next/cache'
import { createMemberSchema } from './members.schemas'
import { canManage } from '@/lib/auth.utils'

export async function createMember(formData: unknown) {
  const actor = await requireRole('ADMIN', 'SUPER_ADMIN')

  const parsed = createMemberSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const { fullName, email, phone, role, gender, occupation, address } = parsed.data

  // Only SUPER_ADMIN can create ADMIN accounts
  if (role === 'ADMIN' && actor.role !== 'SUPER_ADMIN') {
    return { error: { role: ['Only a Super Admin can assign the Admin role.'] } }
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return { error: { email: ['A member with this email already exists.'] } }

  const tempPassword = crypto.randomBytes(9).toString('base64url').slice(0, 12)
  const passwordHash = await bcrypt.hash(tempPassword, 12)

  const member = await prisma.user.create({
    data: {
      fullName, email, phone, gender, occupation, address,
      passwordHash,
      role,
      status: 'ACTIVE',
      mustResetPassword: true,
      createdById: actor.id,
    },
  })

  // Send credentials email
  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: member.email,
    subject: 'Your Akubueze account is ready',
    html: `
      <p>Hi ${member.fullName},</p>
      <p>Your Akubueze account has been created.</p>
      <p><strong>Email:</strong> ${member.email}<br/>
         <strong>Temporary password:</strong> ${tempPassword}</p>
      <p>Log in at: <a href="${process.env.AUTH_URL}/login">${process.env.AUTH_URL}/login</a></p>
      <p>You will be prompted to set a new password on first login.</p>
    `,
  })

  revalidatePath('/admin/members')
  return { success: true, memberId: member.id }
}
```

---

#### `updateMember`

```typescript
export async function updateMember(memberId: string, formData: unknown) {
  const actor = await requireRole('ADMIN', 'SUPER_ADMIN')

  const target = await prisma.user.findUniqueOrThrow({ where: { id: memberId } })
  if (!canManage(actor.role, target.role)) {
    return { error: { _form: ['You do not have permission to edit this member.'] } }
  }

  const parsed = updateMemberSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  // Prevent ADMIN from changing another user's role to ADMIN or SUPER_ADMIN
  if (parsed.data.role && parsed.data.role !== 'MEMBER' && actor.role !== 'SUPER_ADMIN') {
    return { error: { role: ['Only a Super Admin can assign elevated roles.'] } }
  }

  await prisma.user.update({
    where: { id: memberId },
    data: parsed.data,
  })

  revalidatePath('/admin/members')
  revalidatePath(`/admin/members/${memberId}`)
  return { success: true }
}
```

---

#### `suspendMember` / `reactivateMember`

```typescript
export async function suspendMember(memberId: string, reason?: string) {
  const actor = await requireRole('ADMIN', 'SUPER_ADMIN')
  const target = await prisma.user.findUniqueOrThrow({ where: { id: memberId } })

  if (!canManage(actor.role, target.role)) {
    return { error: 'You do not have permission to suspend this member.' }
  }
  if (target.status === 'SUSPENDED') {
    return { error: 'Member is already suspended.' }
  }

  await prisma.user.update({
    where: { id: memberId },
    data: { status: 'SUSPENDED' },
  })

  revalidatePath('/admin/members')
  revalidatePath(`/admin/members/${memberId}`)
  return { success: true }
}

export async function reactivateMember(memberId: string) {
  const actor = await requireRole('ADMIN', 'SUPER_ADMIN')
  const target = await prisma.user.findUniqueOrThrow({ where: { id: memberId } })

  if (!canManage(actor.role, target.role)) {
    return { error: 'You do not have permission to reactivate this member.' }
  }

  await prisma.user.update({
    where: { id: memberId },
    data: { status: 'ACTIVE' },
  })

  revalidatePath('/admin/members')
  revalidatePath(`/admin/members/${memberId}`)
  return { success: true }
}
```

---

#### `triggerPasswordReset`

Delegates to `lib/auth.actions.ts`. Re-export or call directly:

```typescript
export { triggerPasswordReset } from '@/lib/auth.actions'
```

---

### Validation Schemas

**File:** `lib/members/members.schemas.ts`

```typescript
import { z } from 'zod'

export const createMemberSchema = z.object({
  fullName:   z.string().min(2, 'Full name is required'),
  email:      z.string().email('Must be a valid email address'),
  phone:      z.string().min(7, 'Phone number too short').optional().or(z.literal('')),
  role:       z.enum(['MEMBER', 'ADMIN']),
  gender:     z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  occupation: z.string().optional().or(z.literal('')),
  address:    z.string().optional().or(z.literal('')),
})

export const updateMemberSchema = z.object({
  fullName:   z.string().min(2).optional(),
  phone:      z.string().min(7).optional().or(z.literal('')),
  gender:     z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  occupation: z.string().optional().or(z.literal('')),
  address:    z.string().optional().or(z.literal('')),
  role:       z.enum(['MEMBER', 'ADMIN', 'SUPER_ADMIN']).optional(),
})

export type CreateMemberInput = z.infer<typeof createMemberSchema>
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>
```

---

## Page Breakdown

### 1. Members List Page (`/admin/members`)

**File:** `app/admin/members/page.tsx`  
**Type:** Server Component

#### Props (Search Params)

```typescript
type PageProps = {
  searchParams: {
    search?: string
    status?: string    // 'ACTIVE' | 'SUSPENDED' | 'INACTIVE'
    role?: string      // 'MEMBER' | 'ADMIN' | 'SUPER_ADMIN'
    gender?: string    // 'MALE' | 'FEMALE' | 'OTHER'
    page?: string
  }
}
```

#### What the page renders

```
┌────────────────────────────────────────────────────────────────────┐
│  PAGE HEADER                                                        │
│  "Members"                            [+ Add Member]  button       │
│  "15 total members"  subtitle                                      │
├────────────────────────────────────────────────────────────────────┤
│  STAT CARDS ROW (4 cards)                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│  │  Total   │ │  Active  │ │Suspended │ │ Inactive │             │
│  │    15    │ │    12    │ │    1     │ │    2     │             │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘             │
├────────────────────────────────────────────────────────────────────┤
│  FILTERS BAR                                                        │
│  [🔍 Search members...]  [Status ▾]  [Role ▾]  [Gender ▾]         │
│                                              [Clear filters]        │
├────────────────────────────────────────────────────────────────────┤
│  MEMBERS TABLE                                                      │
│  Member | Phone | Role | Status | Joined | Actions                 │
│  ─────────────────────────────────────────────────────             │
│  [Avatar] Chukwuemeka Agu    | 0802... | MEMBER | ACTIVE  | 2yr   │
│           c.agu@akubueze.com |         |        |         | [···] │
│  ...                                                                │
├────────────────────────────────────────────────────────────────────┤
│  PAGINATION                                                         │
│  Showing 1–15 of 15          [< Prev]  Page 1 of 1  [Next >]      │
└────────────────────────────────────────────────────────────────────┘
```

#### Implementation

```typescript
// app/admin/members/page.tsx
import { requireRole } from '@/lib/auth.utils'
import { getMembers } from '@/lib/members/members.queries'
import { MembersTable }   from './_components/MembersTable'
import { MembersFilters } from './_components/MembersFilters'
import { AddMemberSheet } from './_components/AddMemberSheet'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function MembersPage({ searchParams }: PageProps) {
  await requireRole('ADMIN', 'SUPER_ADMIN')
  const session = await auth()

  const { members, total, totalPages, page } = await getMembers({
    search:   searchParams.search,
    status:   searchParams.status as any,
    role:     searchParams.role as any,
    gender:   searchParams.gender,
    page:     Number(searchParams.page) || 1,
  })

  // Stat counts for header cards
  const [activeCount, suspendedCount, inactiveCount] = await Promise.all([
    prisma.user.count({ where: { status: 'ACTIVE' } }),
    prisma.user.count({ where: { status: 'SUSPENDED' } }),
    prisma.user.count({ where: { status: 'INACTIVE' } }),
  ])

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Members</h1>
          <p className="text-sm text-muted-foreground">{total} total members</p>
        </div>
        <AddMemberSheet actorRole={session!.user.role} />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total"     value={total}          />
        <StatCard label="Active"    value={activeCount}    color="green"  />
        <StatCard label="Suspended" value={suspendedCount} color="red"    />
        <StatCard label="Inactive"  value={inactiveCount}  color="gray"   />
      </div>

      {/* Filters */}
      <MembersFilters />

      {/* Table */}
      <MembersTable
        members={members}
        actorRole={session!.user.role}
        totalPages={totalPages}
        currentPage={page}
      />
    </div>
  )
}
```

---

### 2. Member Detail Page (`/admin/members/[id]`)

**File:** `app/admin/members/[id]/page.tsx`  
**Type:** Server Component

#### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  BREADCRUMB:  Members  /  Chukwuemeka Agu                        │
├─────────────────────────────────────────────────────────────────┤
│  PROFILE HEADER                                                  │
│  [Avatar 64px]  Chukwuemeka Obinna Agu                          │
│                 [MEMBER badge]  [ACTIVE badge]                   │
│                 c.agu@akubueze.com · 08023456789                 │
│                 Civil Engineer · 3 Birabi Street, GRA Phase 1   │
│                 Joined: 2 years ago                              │
│                                           [Edit] [Reset Pwd]    │
│                                           [Suspend]             │
├─────────────────────────────────────────────────────────────────┤
│  STAT CARDS (4)                                                  │
│  ┌──────────────┐ ┌──────────────┐ ┌───────────┐ ┌──────────┐  │
│  │  Attendance  │ │  Meetings    │ │ Dues Paid │ │  Dues    │  │
│  │    Rate      │ │  Attended    │ │           │ │ Pending  │  │
│  │     86%      │ │    6 / 7     │ │     6     │ │    1     │  │
│  └──────────────┘ └──────────────┘ └───────────┘ └──────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  TWO COLUMN LAYOUT                                               │
│  ┌──────────────────────────┐ ┌──────────────────────────────┐  │
│  │  ATTENDANCE HISTORY      │ │  PAYMENT HISTORY             │  │
│  │  (last 10 meetings)      │ │  (all payments, paginated)   │  │
│  │                          │ │                              │  │
│  │  Jul General  PRESENT ✓  │ │  Jul Dues   ₦2,000 PENDING  │  │
│  │  Jun Exec.    PRESENT ✓  │ │  Jun Dues   ₦2,000 PAID     │  │
│  │  May General  ABSENT  ✗  │ │  May Dues   ₦2,000 PAID     │  │
│  │  ...                     │ │  ...                         │  │
│  └──────────────────────────┘ └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

#### Implementation

```typescript
// app/admin/members/[id]/page.tsx
import { requireRole } from '@/lib/auth.utils'
import { getMemberById, getMemberStats } from '@/lib/members/members.queries'
import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { EditMemberSheet }      from '../_components/EditMemberSheet'
import { SuspendMemberDialog }  from '../_components/SuspendMemberDialog'
import { ResetPasswordButton }  from '../_components/ResetPasswordButton'
import { MemberAttendanceCard } from '../_components/MemberAttendanceCard'
import { MemberPaymentsCard }   from '../_components/MemberPaymentsCard'
import { MemberStatusBadge }    from '../_components/MemberStatusBadge'
import { MemberRoleBadge }      from '../_components/MemberRoleBadge'
import { canManage } from '@/lib/auth.utils'
import { formatDistanceToNow } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default async function MemberDetailPage({ params }: { params: { id: string } }) {
  await requireRole('ADMIN', 'SUPER_ADMIN')
  const session = await auth()
  const actorRole = session!.user.role

  const [member, stats] = await Promise.all([
    getMemberById(params.id),
    getMemberStats(params.id),
  ])

  if (!member) notFound()

  const canAct = canManage(actorRole, member.role)

  const initials = member.fullName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="space-y-6 p-6">

      {/* Breadcrumb */}
      <Breadcrumb items={[
        { label: 'Members', href: '/admin/members' },
        { label: member.fullName },
      ]} />

      {/* Profile header card */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 text-xl">
              <AvatarImage src={member.profileImageUrl ?? undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">{member.fullName}</h2>
              <div className="flex flex-wrap gap-2">
                <MemberRoleBadge   role={member.role}   />
                <MemberStatusBadge status={member.status} />
              </div>
              <p className="text-sm text-muted-foreground">{member.email}</p>
              {member.phone      && <p className="text-sm">{member.phone}</p>}
              {member.occupation && <p className="text-sm">{member.occupation}</p>}
              {member.address    && <p className="text-sm text-muted-foreground">{member.address}</p>}
              <p className="text-xs text-muted-foreground">
                Joined {formatDistanceToNow(member.dateJoined, { addSuffix: true })}
              </p>
            </div>
          </div>

          {/* Actions — only shown if actor outranks the target */}
          {canAct && (
            <div className="flex flex-wrap gap-2">
              <EditMemberSheet member={member} actorRole={actorRole} />
              <ResetPasswordButton memberId={member.id} memberName={member.fullName} />
              <SuspendMemberDialog
                memberId={member.id}
                memberName={member.fullName}
                currentStatus={member.status}
              />
            </div>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Attendance Rate" value={`${stats.attendanceRate}%`} />
        <StatCard label="Meetings Attended" value={`${stats.attended} / ${stats.totalMeetings}`} />
        <StatCard label="Dues Paid"    value={stats.paidDues}    color="green" />
        <StatCard label="Dues Pending" value={stats.pendingDues} color={stats.pendingDues > 0 ? 'red' : 'gray'} />
      </div>

      {/* Two-column history */}
      <div className="grid gap-6 md:grid-cols-2">
        <MemberAttendanceCard attendances={member.attendances} />
        <MemberPaymentsCard   payments={member.payments} meetingPayments={member.meetingPayments} />
      </div>
    </div>
  )
}
```

---

### 3. Add Member Sheet

**File:** `app/admin/members/_components/AddMemberSheet.tsx`  
**Type:** Client Component (`'use client'`)  
**ShadCN:** `Sheet`, `SheetTrigger`, `SheetContent`, `SheetHeader`, `SheetTitle`, `SheetDescription`

#### Trigger
`+ Add Member` button in the page header. Opens a slide-in sheet from the right.

#### Form Fields

| Field | Input Type | Required | Notes |
|---|---|:---:|---|
| Full Name | `text` | ✓ | |
| Email | `email` | ✓ | Checked for uniqueness server-side |
| Phone | `tel` | ✗ | |
| Role | `Select` | ✓ | `MEMBER` (default) or `ADMIN` (SUPER_ADMIN only) |
| Gender | `Select` | ✗ | MALE / FEMALE / OTHER |
| Occupation | `text` | ✗ | |
| Address | `textarea` | ✗ | |

#### Behaviour

- Use `react-hook-form` + `zodResolver(createMemberSchema)` for validation
- Show inline field errors below each input
- On submit: call `createMember(data)` server action
- While submitting: disable the submit button and show a spinner
- On success: close the sheet, show a `toast.success('Member account created. Credentials sent by email.')`
- On error: show field-level errors returned from the action, or a generic `toast.error`
- The `Role` field is only shown if `actorRole === 'SUPER_ADMIN'`. If hidden, default to `'MEMBER'`.

#### Sheet structure

```
Sheet (side="right", className="w-full sm:max-w-lg")
  SheetHeader
    SheetTitle: "Add New Member"
    SheetDescription: "Create an account and send login credentials by email."
  Form
    Full Name *
    Email *
    Phone
    [Role — SUPER_ADMIN only]
    Gender
    Occupation
    Address
    SheetFooter
      [Cancel]  [Create Member ›]
```

---

### 4. Edit Member Sheet

**File:** `app/admin/members/_components/EditMemberSheet.tsx`  
**Type:** Client Component  
**ShadCN:** `Sheet`, same as above

#### Trigger
`Edit` button on the member detail page header.

#### Form Fields (pre-filled with current values)

| Field | Input Type | Notes |
|---|---|---|
| Full Name | `text` | |
| Phone | `tel` | |
| Gender | `Select` | |
| Occupation | `text` | |
| Address | `textarea` | |
| Role | `Select` | Only shown to SUPER_ADMIN |

> Email and `dateJoined` are **not editable** — display them as read-only text in the form.

#### Behaviour

- Pre-populate with current member values using `defaultValues`
- On submit: call `updateMember(memberId, data)`
- On success: close sheet, `toast.success('Member profile updated.')`
- On error: show field errors or generic toast

---

### 5. Suspend / Reactivate Dialog

**File:** `app/admin/members/_components/SuspendMemberDialog.tsx`  
**Type:** Client Component  
**ShadCN:** `AlertDialog`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogCancel`, `AlertDialogAction`

#### Trigger
- Button on detail page header
- `···` row actions menu on the list page

#### Behaviour

The button label and dialog copy change based on `currentStatus`:

| `currentStatus` | Button label | Dialog title | Action |
|---|---|---|---|
| `ACTIVE` | `Suspend Member` | `Suspend this member?` | calls `suspendMember` |
| `SUSPENDED` | `Reactivate Member` | `Reactivate this member?` | calls `reactivateMember` |

**Suspend dialog copy:**
> "Suspending **[Name]** will immediately block them from logging in. They will see a suspension notice page until reactivated. This does not delete any of their records."

**Reactivate dialog copy:**
> "Reactivating **[Name]** will restore their access to the platform. They will be able to log in immediately."

- On confirm: call the appropriate action
- On success: `toast.success('Member suspended.' / 'Member reactivated.')`
- Show spinner on the confirm button while pending

---

### 6. Reset Password Action

**File:** `app/admin/members/_components/ResetPasswordButton.tsx`  
**Type:** Client Component  
**ShadCN:** `Button` (variant `outline`)

#### Behaviour

- Shows a simple `Button` with a key icon: `Reset Password`
- On click: show an inline `AlertDialog` confirming: *"This will send [Name] an email with a link to set a new password. The link expires in 1 hour."*
- On confirm: call `triggerPasswordReset(memberId)`
- On success: `toast.success('Password reset email sent to [email].')`

---

## Component Specs

### `MembersTable.tsx`

**Type:** Client Component (needs `useRouter` for row clicks)  
**Library:** `@tanstack/react-table` — use its `useReactTable` hook with ShadCN `Table` primitives for rendering.

#### Columns (defined in `MembersTableColumns.tsx`)

| Column | Content | Sortable |
|---|---|:---:|
| Member | Avatar + Full Name + email (stacked) | ✓ (by fullName) |
| Phone | Phone number or `—` | ✗ |
| Role | `<MemberRoleBadge>` | ✗ |
| Status | `<MemberStatusBadge>` | ✗ |
| Joined | Relative date (`2 years ago`) | ✓ (by dateJoined) |
| Actions | `···` dropdown menu | ✗ |

#### Row Actions Dropdown (`DropdownMenu`)

Items shown depend on `actorRole` vs the row's `role` using `canManage`:

```
View Profile    → navigate to /admin/members/[id]
Edit            → open EditMemberSheet (if canManage)
Reset Password  → trigger reset (if canManage)
──────────────
Suspend         → open SuspendMemberDialog (if ACTIVE and canManage)
Reactivate      → open SuspendMemberDialog (if SUSPENDED and canManage)
```

#### Row click
Clicking anywhere on the row (except the actions dropdown) navigates to `/admin/members/[id]`.

#### Empty state
When no members match the filters:
```
[Users icon]
No members found
Try adjusting your search or filters.
[Clear filters] button
```

---

### `MembersFilters.tsx`

**Type:** Client Component  
**Behaviour:** Updates URL search params using `useRouter` + `useSearchParams` without full page reload (Next.js App Router pattern — push to URL, page re-fetches as Server Component).

```
[🔍 Search members...]   [Status ▾]   [Role ▾]   [Gender ▾]   [Clear filters]
```

- **Search input:** debounced 300ms before pushing to URL
- **Status dropdown:** All / Active / Suspended / Inactive
- **Role dropdown:** All / Member / Admin / Super Admin
- **Gender dropdown:** All / Male / Female / Other
- **Clear filters:** resets all params and search input

---

### `MemberStatusBadge.tsx`

```typescript
// Stateless, pure presentational
const statusConfig = {
  ACTIVE:    { label: 'Active',    className: 'bg-green-100 text-green-800 border-green-200' },
  SUSPENDED: { label: 'Suspended', className: 'bg-red-100   text-red-800   border-red-200'   },
  INACTIVE:  { label: 'Inactive',  className: 'bg-gray-100  text-gray-600  border-gray-200'  },
}
```

Use ShadCN `Badge` with `variant="outline"` and override className.

---

### `MemberRoleBadge.tsx`

```typescript
const roleConfig = {
  SUPER_ADMIN: { label: 'Super Admin', className: 'bg-purple-100 text-purple-800 border-purple-200' },
  ADMIN:       { label: 'Admin',       className: 'bg-blue-100   text-blue-800   border-blue-200'   },
  MEMBER:      { label: 'Member',      className: 'bg-gray-100   text-gray-600   border-gray-200'   },
}
```

---

### `MemberAttendanceCard.tsx`

**ShadCN:** `Card`, `CardHeader`, `CardTitle`, `CardContent`

Displays a scrollable list of attendance records, each row showing:

```
[Icon]  July General Meeting          PRESENT  ✓   2 weeks ago
[Icon]  June Executive Session        PRESENT  ✓   1 month ago
[Icon]  May General Meeting           ABSENT   ✗   2 months ago
        remarks: "No notice given"
```

- `PRESENT` → green check icon
- `EXCUSED` → yellow minus icon
- `ABSENT`  → red X icon
- Show meeting type badge alongside the meeting name
- Show `remarks` below the row if present (smaller, muted text)
- Limit to the last 10. Add a "View all" link if more exist.

---

### `MemberPaymentsCard.tsx`

**ShadCN:** `Card`, `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`

Two tabs:
1. **General Payments** — monthly dues, levies, fines, donations (from `Payment` model)
2. **Meeting Payments** — per-meeting contributions (from `MeetingPayment` model)

Each row shows:
```
Monthly Dues — June         ₦2,000    PAID     ✓   1 month ago
Monthly Dues — July         ₦2,000    PENDING  ⏳  3 weeks ago
Community borehole levy     ₦5,000    PAID     ✓   3 months ago
Fine: absent April meeting  ₦1,500    PENDING  ⏳  2 months ago
```

- `PAID`    → green text/icon
- `PENDING` → amber text/icon
- `WAIVED`  → gray text, strikethrough amount
- Show `description` as the row label
- Limit to 10 per tab. Add a "View all" link.

---

### `loading.tsx` (List and Detail)

Use ShadCN `Skeleton` components. The list loading skeleton should mirror the table structure (header + 8 rows). The detail loading skeleton should mirror the profile header + stat cards + two cards.

---

## URL & Search Params

| Param | Values | Default |
|---|---|---|
| `search` | string | `''` |
| `status` | `ACTIVE` \| `SUSPENDED` \| `INACTIVE` | all |
| `role` | `MEMBER` \| `ADMIN` \| `SUPER_ADMIN` | all |
| `gender` | `MALE` \| `FEMALE` \| `OTHER` | all |
| `page` | number | `1` |

All params are pushed to the URL so pages are shareable and back-navigable.

---

## Types

```typescript
// Convenience re-exports for use across components

export type { MemberListItem } from '@/lib/members/members.queries'

export type MemberDetail = NonNullable<Awaited<ReturnType<typeof getMemberById>>>

export type ActorRole = 'SUPER_ADMIN' | 'ADMIN'
```

---

## Behaviour Rules

1. **Never show the Suspend or Reset actions** against a member whose `role` rank is equal to or higher than the actor's. Use `canManage(actorRole, targetRole)`.

2. **ADMIN cannot see the Role field** in Add/Edit forms — the role selector is only rendered when `actorRole === 'SUPER_ADMIN'`.

3. **Suspended members remain in the table** — they are not hidden. The `SUSPENDED` badge makes their status obvious.

4. **Clicking a table row** navigates to the detail page. The actions dropdown `···` does not propagate the click to the row.

5. **Search is debounced** — 300ms before pushing to URL to avoid excessive re-fetches.

6. **`revalidatePath`** must be called in every action that mutates member data so the list and detail pages reflect changes without a manual refresh.

7. **Pagination resets to page 1** whenever any filter changes.

8. **Avatar initials fallback** — take the first letter of each word in `fullName`, use the first two.

9. **Empty `phone`, `occupation`, `address`** — render as `—` (em dash) in the table, not blank.

10. **Toast notifications** — use a toast library (Sonner is recommended with ShadCN). Every success and error in the Client Components should produce a toast.

---

## Error Handling

| Scenario | Handling |
|---|---|
| Member not found (`/admin/members/[id]`) | `notFound()` → Next.js 404 page |
| Duplicate email on create | Server action returns `{ error: { email: [...] } }`, shown below the email field |
| Role permission violation | Server action returns `{ error: { _form: [...] } }`, shown as a form-level error banner |
| Resend email failure | Log the error server-side; do not fail the member creation — member is created, show a warning toast: *"Member created but credentials email failed to send. Reset their password manually."* |
| Network/server error | Catch in the Client Component and show `toast.error('Something went wrong. Please try again.')` |
| Suspending already-suspended | Server action returns `{ error: '...' }`, shown as toast |

---

## Dependencies Checklist

Ensure these are installed before implementation:

```bash
npm install @tanstack/react-table react-hook-form @hookform/resolvers zod date-fns sonner
npx shadcn@latest add sheet dialog alert-dialog badge avatar table tabs card skeleton dropdown-menu select textarea
```

---

*Last updated: May 2026*