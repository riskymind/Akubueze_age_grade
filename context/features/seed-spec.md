# 🌱 Akubueze — Seed Data Specification

> This document defines all seed data for the Akubueze development and staging database. It covers every model, the exact records to insert, realistic Nigerian context, ordering/dependency rules, and the complete annotated `seed.ts` implementation.

---

## 📋 Table of Contents

- [Seed Goals](#seed-goals)
- [Seeding Order & Dependencies](#seeding-order--dependencies)
- [Seed Data by Model](#seed-data-by-model)
  - [Users](#1-users)
  - [Meetings](#2-meetings)
  - [Attendance](#3-attendance)
  - [Payments](#4-payments)
  - [Announcements](#5-announcements)
  - [AnnouncementReads](#6-announcementreads)
- [Scenario Coverage](#scenario-coverage)
- [seed.ts Implementation](#seedts-implementation)
- [Running the Seed](#running-the-seed)
- [Reset & Reseed](#reset--reseed)

---

## Seed Goals

The seed data should make the application immediately usable for UI development and testing. It must:

- Populate every page with realistic, non-trivial data
- Cover all role types: `SUPER_ADMIN`, `ADMIN`, `MEMBER`
- Cover all member statuses: `ACTIVE`, `SUSPENDED`, `INACTIVE`
- Cover all meeting types and statuses
- Produce a mix of good, average, and poor payers and attenders
- Create enough data for charts, tables, and reports to be meaningful
- Use realistic Nigerian names, phone numbers, addresses, and ₦ amounts

---

## Seeding Order & Dependencies

Prisma relations require records to exist before they are referenced. Seed in this exact order:

```
1. Users          (no foreign key dependencies)
2. Meetings       (no foreign key dependencies)
3. Attendance     (depends on Users + Meetings)
4. Payments       (depends on Users)
5. Announcements  (depends on Users)
6. AnnouncementReads (depends on Announcements — skip User FK if not in your model)
```

---

## Seed Data by Model

### 1. Users

Seed **15 users** total across all roles and statuses.

#### Credentials (all seeded users)

| Field | Value |
|---|---|
| Default password | `Akubueze@2026` (bcrypt hashed) |
| `mustResetPassword` | `false` for Super Admin and Admins; `true` for all Members |

> In production, Members would receive temporary passwords via email. For seeding, we set a known password and flag them to reset on first login.

---

#### 1a. Super Admin (1)

| Field | Value |
|---|---|
| fullName | Obiora Nnamdi Eze |
| email | `superadmin@akubueze.com` |
| phone | `08031234567` |
| role | `SUPER_ADMIN` |
| status | `ACTIVE` |
| gender | `MALE` |
| occupation | Association President |
| address | 14 Rumuola Road, Port Harcourt |
| mustResetPassword | `false` |
| dateJoined | 3 years ago |

---

#### 1b. Admins / Executives (2)

| # | fullName | email | phone | gender | occupation | address | dateJoined |
|---|---|---|---|---|---|---|---|
| 1 | Adaeze Chisom Okafor | `adaeze.okafor@akubueze.com` | `08055678901` | FEMALE | Secretary General | 22 Ada George Road, PH | 2.5 years ago |
| 2 | Emeka Chukwudi Onwudiwe | `emeka.onwudiwe@akubueze.com` | `08167890123` | MALE | Treasurer | 5 Woji Road, GRA Phase 2, PH | 2 years ago |

Both: `role: ADMIN`, `status: ACTIVE`, `mustResetPassword: false`

---

#### 1c. Members (12)

Mix of statuses: 9 ACTIVE, 1 SUSPENDED, 1 INACTIVE, 1 ACTIVE (recent join).

| # | fullName | email | phone | gender | occupation | address | status | dateJoined |
|---|---|---|---|---|---|---|---|---|
| 1 | Chukwuemeka Obinna Agu | `c.agu@akubueze.com` | `08023456789` | MALE | Civil Engineer | 3 Birabi Street, GRA Phase 1 | ACTIVE | 2 years ago |
| 2 | Ngozi Amaka Obi | `n.obi@akubueze.com` | `08134567890` | FEMALE | Pharmacist | 11 Rumuibekwe Road, PH | ACTIVE | 2 years ago |
| 3 | Ikechukwu Silas Nwosu | `i.nwosu@akubueze.com` | `08045678901` | MALE | Trader | 7 Ogbunabali Road, PH | ACTIVE | 1.5 years ago |
| 4 | Chidinma Uju Okeke | `c.okeke@akubueze.com` | `08156789012` | FEMALE | Teacher | 9 Eliozu Road, Rumola | ACTIVE | 1.5 years ago |
| 5 | Uche Tobias Ihejirika | `u.ihejirika@akubueze.com` | `08067890123` | MALE | Mechanic | 2 Rumuola Housing Estate | ACTIVE | 1.5 years ago |
| 6 | Adaora Blessing Nnadi | `a.nnadi@akubueze.com` | `08178901234` | FEMALE | Nurse | 15 D-Line Road, PH | ACTIVE | 1 year ago |
| 7 | Chinedu Festus Okonkwo | `c.okonkwo@akubueze.com` | `08089012345` | MALE | Accountant | 6 Moscow Road, PH | ACTIVE | 1 year ago |
| 8 | Onyekachi Vera Eze | `o.eze@akubueze.com` | `08190123456` | FEMALE | Hair Stylist | 18 Rumuobiakani Road | ACTIVE | 1 year ago |
| 9 | Nnamdi Godwin Ohaeri | `n.ohaeri@akubueze.com` | `08001234567` | MALE | Driver | 4 Rumuola Road, PH | ACTIVE | 8 months ago |
| 10 | Kelechi Bright Onyia | `k.onyia@akubueze.com` | `08112345678` | MALE | Carpenter | 33 Rumuokwurushi Road | SUSPENDED | 1 year ago |
| 11 | Ebele Grace Odum | `e.odum@akubueze.com` | `08023456780` | FEMALE | Seamstress | 8 Rumuola Close, PH | INACTIVE | 2 years ago |
| 12 | Somtochukwu Paul Orji | `s.orji@akubueze.com` | `08134567891` | MALE | Student | 1 University Road, Choba | ACTIVE | 1 month ago |

All: `role: MEMBER`, `mustResetPassword: true`

---

### 2. Meetings

Seed **10 meetings** spanning the past 6 months and next 2 months. This gives the calendar view, meeting list, and dashboard widget meaningful data.

| # | title | type | status | scheduledAt | location | notes |
|---|---|---|---|---|---|---|
| 1 | January General Assembly | GENERAL | COMPLETED | 6 months ago | Town Hall, Mile 1, PH | New year address by the president |
| 2 | February Executive Review | EXECUTIVE | COMPLETED | 5 months ago | Secretariat Office, Ada George | Budget review for Q1 |
| 3 | March General Meeting | GENERAL | COMPLETED | 4 months ago | Town Hall, Mile 1, PH | Community development update |
| 4 | April Emergency Meeting | EMERGENCY | COMPLETED | 3 months ago | Secretariat Office, Ada George | Discussed misconduct report |
| 5 | May General Meeting | GENERAL | COMPLETED | 2 months ago | Town Hall, Mile 1, PH | Mid-year review |
| 6 | June Executive Session | EXECUTIVE | COMPLETED | 1 month ago | Secretariat Office, Ada George | Elections planning |
| 7 | July General Meeting | GENERAL | COMPLETED | 2 weeks ago | Town Hall, Mile 1, PH | July dues & announcements |
| 8 | Annual General Meeting 2024 | ANNUAL | SCHEDULED | 3 weeks from now | Victory Hall, Rumuola, PH | Full year review, elections |
| 9 | August Executive Meeting | EXECUTIVE | SCHEDULED | 5 weeks from now | Secretariat Office, Ada George | Pre-AGM planning |
| 10 | August General Meeting | GENERAL | SCHEDULED | 7 weeks from now | Town Hall, Mile 1, PH | August general assembly |

Add a realistic agenda string to the 3 most recent completed meetings and the next scheduled GENERAL meeting.

---

### 3. Attendance

Generate attendance for all **7 completed meetings** for all **active members + admins** (excluding Super Admin, Suspended, and Inactive members — 11 people total).

Use these attendance profiles to create realistic variation for dashboard stats and reports:

| Member | Attendance Profile | Pattern |
|---|---|---|
| Obiora Eze (Super Admin) | Skip — executives don't appear in member attendance | — |
| Adaeze Okafor (Admin) | Excellent | PRESENT for all 7 |
| Emeka Onwudiwe (Admin) | Excellent | PRESENT for 6, EXCUSED for 1 |
| Chukwuemeka Agu | Good | PRESENT for 6, ABSENT for 1 |
| Ngozi Obi | Good | PRESENT for 5, EXCUSED for 1, ABSENT for 1 |
| Ikechukwu Nwosu | Average | PRESENT for 4, ABSENT for 3 |
| Chidinma Okeke | Good | PRESENT for 5, ABSENT for 2 |
| Uche Ihejirika | Average | PRESENT for 4, ABSENT for 3 |
| Adaora Nnadi | Good (joined later) | PRESENT for 4 of last 5, ABSENT for 1 |
| Chinedu Okonkwo | Good (joined later) | PRESENT for 4 of last 5, ABSENT for 1 |
| Onyekachi Eze | Average (joined later) | PRESENT for 3 of last 5, ABSENT for 2 |
| Nnamdi Ohaeri | Poor | PRESENT for 2 of last 4, ABSENT for 2 |
| Kelechi Onyia (Suspended) | Skip — suspended members excluded | — |
| Ebele Odum (Inactive) | Skip | — |
| Somtochukwu Orji (Recent) | Only mark for the most recent meeting — PRESENT | — |

> **Tip:** Build a helper function `markAttendance(userId, meetingId, status, remarks?)` to avoid repetitive Prisma calls in the seed file.

---

### 4. Payments

Seed payments for all **active members and admins** (13 people). Cover the past **6 months** of monthly dues plus some levies, fines, and donations.

#### Monthly Dues Schedule
- Amount: **₦2,000** per member per month
- 6 months = January through June (seed July as PENDING for everyone)

| Member | January | February | March | April | May | June | July |
|---|---|---|---|---|---|---|---|
| Adaeze Okafor | PAID | PAID | PAID | PAID | PAID | PAID | PAID |
| Emeka Onwudiwe | PAID | PAID | PAID | PAID | PAID | PAID | PAID |
| Chukwuemeka Agu | PAID | PAID | PAID | PAID | PAID | PAID | PENDING |
| Ngozi Obi | PAID | PAID | PAID | PAID | PAID | PAID | PENDING |
| Ikechukwu Nwosu | PAID | PAID | PAID | PENDING | PENDING | PENDING | PENDING |
| Chidinma Okeke | PAID | PAID | PAID | PAID | PAID | PENDING | PENDING |
| Uche Ihejirika | PAID | PAID | PENDING | PENDING | PENDING | PENDING | PENDING |
| Adaora Nnadi | PAID | PAID | PAID | PAID | PENDING | PENDING | PENDING |
| Chinedu Okonkwo | PAID | PAID | PAID | PAID | PAID | PENDING | PENDING |
| Onyekachi Eze | PAID | PAID | PAID | PENDING | PENDING | PENDING | PENDING |
| Nnamdi Ohaeri | PAID | PENDING | PENDING | PENDING | PENDING | PENDING | PENDING |
| Somtochukwu Orji | — | — | — | — | — | — | PENDING |

#### Additional Payments (seed these individually)

| Member | Type | Amount | Status | Description | Month |
|---|---|---|---|---|---|
| Chukwuemeka Agu | DEVELOPMENT_LEVY | ₦5,000 | PAID | Community borehole project | March |
| Ngozi Obi | DEVELOPMENT_LEVY | ₦5,000 | PAID | Community borehole project | March |
| Ikechukwu Nwosu | FINE | ₦1,500 | PAID | Absent without excuse — February meeting | March |
| Uche Ihejirika | FINE | ₦1,500 | PENDING | Absent without excuse — April meeting | May |
| Nnamdi Ohaeri | FINE | ₦3,000 | PENDING | Absent from 3 consecutive meetings | June |
| Adaeze Okafor | DONATION | ₦10,000 | PAID | Personal donation toward secretariat renovation | April |
| Emeka Onwudiwe | DONATION | ₦15,000 | PAID | Personal donation toward secretariat renovation | April |
| Chinedu Okonkwo | EVENT_CONTRIBUTION | ₦3,000 | PAID | Annual General Meeting logistics | June |
| Chidinma Okeke | EVENT_CONTRIBUTION | ₦3,000 | PAID | Annual General Meeting logistics | June |
| Onyekachi Eze | DEVELOPMENT_LEVY | ₦5,000 | PENDING | Community borehole project | March |

---

### 5. Announcements

Seed **6 announcements** authored by the Super Admin and Admins.

| # | title | body (summary) | isPinned | author | publishedAt |
|---|---|---|---|---|---|
| 1 | Welcome to Akubueze Online Portal | Announcement that the association has launched its digital management platform. Members are encouraged to log in and update their profiles. | `true` | Super Admin | 6 months ago |
| 2 | January Dues Reminder | Reminder that January monthly dues of ₦2,000 are due by end of the month. Members are urged to pay promptly to avoid fines. | `false` | Adaeze Okafor | 6 months ago |
| 3 | Community Borehole Project — Levy Collection | The executive committee has approved a development levy of ₦5,000 per member toward the construction of a community borehole on Rumuola Road. Payment deadline is end of March. | `true` | Super Admin | 4 months ago |
| 4 | Misconduct Hearing Outcome | Following the April emergency meeting, the executive committee has concluded proceedings. A member has been suspended pending a formal review. Full details were shared at the meeting. | `false` | Adaeze Okafor | 3 months ago |
| 5 | Annual General Meeting — Save the Date | The Akubueze Age Grade Annual General Meeting is scheduled for [3 weeks from now] at Victory Hall, Rumuola. All members are required to attend. Agenda to be circulated shortly. | `true` | Super Admin | 3 weeks ago |
| 6 | July Dues — Payment Deadline | A reminder that July monthly dues of ₦2,000 are now due. Members who have not paid by end of month will attract a ₦1,500 fine. Please pay promptly. | `false` | Emeka Onwudiwe | 1 week ago |

---

### 6. AnnouncementReads

Mark reads for the **3 most recent announcements** to simulate partial read rates on the dashboard.

| Announcement | Read by |
|---|---|
| "Annual General Meeting — Save the Date" | All ACTIVE members + both Admins (11 reads) |
| "July Dues — Payment Deadline" | 7 of the active members + both Admins (9 reads) |
| "Misconduct Hearing Outcome" | Both Admins only (2 reads) |

Leave announcements 1, 2, and 3 with no reads (they're old enough that tracking isn't meaningful for the prototype).

---

## Scenario Coverage

After seeding, these test scenarios should all be demonstrable in the UI:

| Scenario | Who / What |
|---|---|
| Super Admin full access | `superadmin@akubueze.com` |
| Admin dashboard with activity | `adaeze.okafor@akubueze.com` |
| Member with perfect record | Chukwuemeka Agu — attended nearly all, mostly paid |
| Member with poor attendance | Nnamdi Ohaeri — missed most meetings, unpaid dues |
| Member with outstanding balance | Ikechukwu Nwosu — 4 months unpaid + 1 fine pending |
| Suspended member | Kelechi Onyia — shows in members list with SUSPENDED badge |
| Inactive member | Ebele Odum — shows in members list with INACTIVE badge |
| New member (no history) | Somtochukwu Orji — joined 1 month ago |
| Upcoming meetings | AGM + 2 more show in dashboard widget |
| Pinned announcements | 3 pinned notices show at top |
| Partial announcement reads | AGM notice: all read; Dues notice: partial |

---

## seed.ts Implementation

```typescript
// prisma/seed.ts

import { PrismaClient, Role, MemberStatus, Gender, MeetingType, MeetingStatus, AttendanceStatus, PaymentType, PaymentStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { subMonths, subWeeks, subDays, addWeeks, addDays, setDate } from 'date-fns'

const prisma = new PrismaClient()

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

const hash = (password: string) => bcrypt.hashSync(password, 12)
const DEFAULT_PASSWORD = hash('Akubueze@2024')
const now = new Date()

// Returns the 15th of a given month offset from today
function monthDate(monthsAgo: number): Date {
  return setDate(subMonths(now, monthsAgo), 15)
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Starting Akubueze seed...')

  // ── 1. USERS ──────────────────────────────────────────────

  console.log('👤 Seeding users...')

  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@akubueze.com' },
    update: {},
    create: {
      fullName: 'Obiora Nnamdi Eze',
      email: 'superadmin@akubueze.com',
      phone: '08031234567',
      passwordHash: DEFAULT_PASSWORD,
      role: Role.SUPER_ADMIN,
      status: MemberStatus.ACTIVE,
      gender: Gender.MALE,
      occupation: 'Association President',
      address: '14 Rumuola Road, Port Harcourt',
      mustResetPassword: false,
      dateJoined: subMonths(now, 36),
    },
  })

  const admin1 = await prisma.user.upsert({
    where: { email: 'adaeze.okafor@akubueze.com' },
    update: {},
    create: {
      fullName: 'Adaeze Chisom Okafor',
      email: 'adaeze.okafor@akubueze.com',
      phone: '08055678901',
      passwordHash: DEFAULT_PASSWORD,
      role: Role.ADMIN,
      status: MemberStatus.ACTIVE,
      gender: Gender.FEMALE,
      occupation: 'Secretary General',
      address: '22 Ada George Road, Port Harcourt',
      mustResetPassword: false,
      dateJoined: subMonths(now, 30),
    },
  })

  const admin2 = await prisma.user.upsert({
    where: { email: 'emeka.onwudiwe@akubueze.com' },
    update: {},
    create: {
      fullName: 'Emeka Chukwudi Onwudiwe',
      email: 'emeka.onwudiwe@akubueze.com',
      phone: '08167890123',
      passwordHash: DEFAULT_PASSWORD,
      role: Role.ADMIN,
      status: MemberStatus.ACTIVE,
      gender: Gender.MALE,
      occupation: 'Treasurer',
      address: '5 Woji Road, GRA Phase 2, Port Harcourt',
      mustResetPassword: false,
      dateJoined: subMonths(now, 24),
    },
  })

  const memberData = [
    { fullName: 'Chukwuemeka Obinna Agu',   email: 'c.agu@akubueze.com',       phone: '08023456789', gender: Gender.MALE,   occupation: 'Civil Engineer', address: '3 Birabi Street, GRA Phase 1',   status: MemberStatus.ACTIVE,     dateJoined: subMonths(now, 24) },
    { fullName: 'Ngozi Amaka Obi',           email: 'n.obi@akubueze.com',       phone: '08134567890', gender: Gender.FEMALE, occupation: 'Pharmacist',     address: '11 Rumuibekwe Road, PH',         status: MemberStatus.ACTIVE,     dateJoined: subMonths(now, 24) },
    { fullName: 'Ikechukwu Silas Nwosu',     email: 'i.nwosu@akubueze.com',     phone: '08045678901', gender: Gender.MALE,   occupation: 'Trader',         address: '7 Ogbunabali Road, PH',          status: MemberStatus.ACTIVE,     dateJoined: subMonths(now, 18) },
    { fullName: 'Chidinma Uju Okeke',        email: 'c.okeke@akubueze.com',     phone: '08156789012', gender: Gender.FEMALE, occupation: 'Teacher',        address: '9 Eliozu Road, Rumola',          status: MemberStatus.ACTIVE,     dateJoined: subMonths(now, 18) },
    { fullName: 'Uche Tobias Ihejirika',     email: 'u.ihejirika@akubueze.com', phone: '08067890123', gender: Gender.MALE,   occupation: 'Mechanic',       address: '2 Rumuola Housing Estate',       status: MemberStatus.ACTIVE,     dateJoined: subMonths(now, 18) },
    { fullName: 'Adaora Blessing Nnadi',     email: 'a.nnadi@akubueze.com',     phone: '08178901234', gender: Gender.FEMALE, occupation: 'Nurse',          address: '15 D-Line Road, PH',             status: MemberStatus.ACTIVE,     dateJoined: subMonths(now, 12) },
    { fullName: 'Chinedu Festus Okonkwo',    email: 'c.okonkwo@akubueze.com',   phone: '08089012345', gender: Gender.MALE,   occupation: 'Accountant',     address: '6 Moscow Road, PH',              status: MemberStatus.ACTIVE,     dateJoined: subMonths(now, 12) },
    { fullName: 'Onyekachi Vera Eze',        email: 'o.eze@akubueze.com',       phone: '08190123456', gender: Gender.FEMALE, occupation: 'Hair Stylist',   address: '18 Rumuobiakani Road',           status: MemberStatus.ACTIVE,     dateJoined: subMonths(now, 12) },
    { fullName: 'Nnamdi Godwin Ohaeri',      email: 'n.ohaeri@akubueze.com',    phone: '08001234567', gender: Gender.MALE,   occupation: 'Driver',         address: '4 Rumuola Road, PH',             status: MemberStatus.ACTIVE,     dateJoined: subMonths(now, 8)  },
    { fullName: 'Kelechi Bright Onyia',      email: 'k.onyia@akubueze.com',     phone: '08112345678', gender: Gender.MALE,   occupation: 'Carpenter',      address: '33 Rumuokwurushi Road',          status: MemberStatus.SUSPENDED,  dateJoined: subMonths(now, 12) },
    { fullName: 'Ebele Grace Odum',          email: 'e.odum@akubueze.com',      phone: '08023456780', gender: Gender.FEMALE, occupation: 'Seamstress',     address: '8 Rumuola Close, PH',            status: MemberStatus.INACTIVE,   dateJoined: subMonths(now, 24) },
    { fullName: 'Somtochukwu Paul Orji',     email: 's.orji@akubueze.com',      phone: '08134567891', gender: Gender.MALE,   occupation: 'Student',        address: '1 University Road, Choba',       status: MemberStatus.ACTIVE,     dateJoined: subMonths(now, 1)  },
  ]

  const members = await Promise.all(
    memberData.map((m) =>
      prisma.user.upsert({
        where: { email: m.email },
        update: {},
        create: { ...m, passwordHash: DEFAULT_PASSWORD, role: Role.MEMBER, mustResetPassword: true },
      })
    )
  )

  // Named references for use in attendance/payments below
  const [agu, obi, nwosu, okeke, ihejirika, nnadi, okonkwo, oeze, ohaeri, onyia, odum, orji] = members

  console.log(`✅ Seeded ${members.length + 3} users`)

  // ── 2. MEETINGS ───────────────────────────────────────────

  console.log('📅 Seeding meetings...')

  const meetingsData = [
    {
      title: 'January General Assembly',
      type: MeetingType.GENERAL,
      status: MeetingStatus.COMPLETED,
      scheduledAt: monthDate(6),
      location: 'Town Hall, Mile 1, Port Harcourt',
      agenda: '1. Opening prayer\n2. Roll call\n3. New year address by the President\n4. Review of last year activities\n5. AOB\n6. Closing prayer',
    },
    {
      title: 'February Executive Review',
      type: MeetingType.EXECUTIVE,
      status: MeetingStatus.COMPLETED,
      scheduledAt: monthDate(5),
      location: 'Secretariat Office, Ada George Road',
      agenda: '1. Q1 budget review\n2. Dues collection status\n3. Borehole project update\n4. AOB',
    },
    {
      title: 'March General Meeting',
      type: MeetingType.GENERAL,
      status: MeetingStatus.COMPLETED,
      scheduledAt: monthDate(4),
      location: 'Town Hall, Mile 1, Port Harcourt',
      agenda: '1. Opening prayer\n2. Roll call\n3. Community development levy announcement\n4. Borehole project briefing\n5. AOB',
    },
    {
      title: 'April Emergency Meeting',
      type: MeetingType.EMERGENCY,
      status: MeetingStatus.COMPLETED,
      scheduledAt: monthDate(3),
      location: 'Secretariat Office, Ada George Road',
      notes: 'Called to address misconduct report filed against a member.',
    },
    {
      title: 'May General Meeting',
      type: MeetingType.GENERAL,
      status: MeetingStatus.COMPLETED,
      scheduledAt: monthDate(2),
      location: 'Town Hall, Mile 1, Port Harcourt',
    },
    {
      title: 'June Executive Session',
      type: MeetingType.EXECUTIVE,
      status: MeetingStatus.COMPLETED,
      scheduledAt: monthDate(1),
      location: 'Secretariat Office, Ada George Road',
    },
    {
      title: 'July General Meeting',
      type: MeetingType.GENERAL,
      status: MeetingStatus.COMPLETED,
      scheduledAt: subWeeks(now, 2),
      location: 'Town Hall, Mile 1, Port Harcourt',
      agenda: '1. Opening prayer\n2. Roll call\n3. July dues collection\n4. AGM announcement\n5. AOB\n6. Closing prayer',
    },
    {
      title: 'Annual General Meeting 2024',
      type: MeetingType.ANNUAL,
      status: MeetingStatus.SCHEDULED,
      scheduledAt: addWeeks(now, 3),
      location: 'Victory Hall, Rumuola, Port Harcourt',
      agenda: '1. Opening prayer\n2. Roll call\n3. President\'s annual address\n4. Financial report by Treasurer\n5. Elections\n6. AOB\n7. Closing prayer',
    },
    {
      title: 'August Executive Meeting',
      type: MeetingType.EXECUTIVE,
      status: MeetingStatus.SCHEDULED,
      scheduledAt: addWeeks(now, 5),
      location: 'Secretariat Office, Ada George Road',
    },
    {
      title: 'August General Meeting',
      type: MeetingType.GENERAL,
      status: MeetingStatus.SCHEDULED,
      scheduledAt: addWeeks(now, 7),
      location: 'Town Hall, Mile 1, Port Harcourt',
    },
  ]

  const meetings = await Promise.all(
    meetingsData.map((m) => prisma.meeting.create({ data: m }))
  )

  const [janMtg, febMtg, marMtg, aprMtg, mayMtg, junMtg, julMtg] = meetings
  const completedMeetings = [janMtg, febMtg, marMtg, aprMtg, mayMtg, junMtg, julMtg]

  console.log(`✅ Seeded ${meetings.length} meetings`)

  // ── 3. ATTENDANCE ─────────────────────────────────────────

  console.log('🙋 Seeding attendance...')

  type AttRecord = { userId: string; meetingId: string; status: AttendanceStatus; remarks?: string }
  const attendanceRecords: AttRecord[] = []

  // Helper
  const att = (userId: string, meetingId: string, status: AttendanceStatus, remarks?: string): AttRecord =>
    ({ userId, meetingId, status, remarks })

  // Adaeze Okafor (Admin) — PRESENT all 7
  completedMeetings.forEach((m) => attendanceRecords.push(att(admin1.id, m.id, AttendanceStatus.PRESENT)))

  // Emeka Onwudiwe (Admin) — PRESENT 6, EXCUSED 1 (April emergency)
  completedMeetings.forEach((m) =>
    attendanceRecords.push(att(admin2.id, m.id, m.id === aprMtg.id ? AttendanceStatus.EXCUSED : AttendanceStatus.PRESENT))
  )

  // Chukwuemeka Agu — PRESENT 6, ABSENT 1 (Feb)
  completedMeetings.forEach((m) =>
    attendanceRecords.push(att(agu.id, m.id, m.id === febMtg.id ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT))
  )

  // Ngozi Obi — PRESENT 5, EXCUSED 1 (Apr), ABSENT 1 (Jun)
  completedMeetings.forEach((m) => {
    const s = m.id === aprMtg.id ? AttendanceStatus.EXCUSED : m.id === junMtg.id ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT
    attendanceRecords.push(att(obi.id, m.id, s))
  })

  // Ikechukwu Nwosu — PRESENT 4, ABSENT 3 (Apr, Jun, Jul)
  completedMeetings.forEach((m) => {
    const absent = [aprMtg.id, junMtg.id, julMtg.id]
    attendanceRecords.push(att(nwosu.id, m.id, absent.includes(m.id) ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT))
  })

  // Chidinma Okeke — PRESENT 5, ABSENT 2 (Mar, Jun)
  completedMeetings.forEach((m) => {
    const absent = [marMtg.id, junMtg.id]
    attendanceRecords.push(att(okeke.id, m.id, absent.includes(m.id) ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT))
  })

  // Uche Ihejirika — PRESENT 4, ABSENT 3 (Feb, May, Jun)
  completedMeetings.forEach((m) => {
    const absent = [febMtg.id, mayMtg.id, junMtg.id]
    attendanceRecords.push(att(ihejirika.id, m.id, absent.includes(m.id) ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT))
  })

  // Adaora Nnadi — only last 5 meetings (joined 12 months ago), PRESENT 4, ABSENT 1 (Jun)
  const nnadi5 = [marMtg, aprMtg, mayMtg, junMtg, julMtg]
  nnadi5.forEach((m) =>
    attendanceRecords.push(att(nnadi.id, m.id, m.id === junMtg.id ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT))
  )

  // Chinedu Okonkwo — only last 5 meetings, PRESENT 4, ABSENT 1 (May)
  nnadi5.forEach((m) =>
    attendanceRecords.push(att(okonkwo.id, m.id, m.id === mayMtg.id ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT))
  )

  // Onyekachi Eze — only last 5 meetings, PRESENT 3, ABSENT 2 (Apr, Jul)
  nnadi5.forEach((m) => {
    const absent = [aprMtg.id, julMtg.id]
    attendanceRecords.push(att(oeze.id, m.id, absent.includes(m.id) ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT))
  })

  // Nnamdi Ohaeri — only last 4 meetings (joined 8 months ago), PRESENT 2, ABSENT 2 (May, Jul)
  const ohaeri4 = [aprMtg, mayMtg, junMtg, julMtg]
  ohaeri4.forEach((m) => {
    const absent = [mayMtg.id, julMtg.id]
    attendanceRecords.push(att(ohaeri.id, m.id, absent.includes(m.id) ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT, absent.includes(m.id) ? 'No notice given' : undefined))
  })

  // Somtochukwu Orji — most recent meeting only (joined 1 month ago)
  attendanceRecords.push(att(orji.id, julMtg.id, AttendanceStatus.PRESENT))

  await prisma.attendance.createMany({ data: attendanceRecords, skipDuplicates: true })
  console.log(`✅ Seeded ${attendanceRecords.length} attendance records`)

  // ── 4. PAYMENTS ───────────────────────────────────────────

  console.log('💰 Seeding payments...')

  // Monthly dues matrix: [member, [Jan, Feb, Mar, Apr, May, Jun, Jul]]
  // P = PAID, N = PENDING
  const duesMatrix: [typeof agu, (PaymentStatus)[]][] = [
    [admin1,    ['PAID','PAID','PAID','PAID','PAID','PAID','PAID']    as PaymentStatus[]],
    [admin2,    ['PAID','PAID','PAID','PAID','PAID','PAID','PAID']    as PaymentStatus[]],
    [agu,       ['PAID','PAID','PAID','PAID','PAID','PAID','PENDING'] as PaymentStatus[]],
    [obi,       ['PAID','PAID','PAID','PAID','PAID','PAID','PENDING'] as PaymentStatus[]],
    [nwosu,     ['PAID','PAID','PAID','PENDING','PENDING','PENDING','PENDING'] as PaymentStatus[]],
    [okeke,     ['PAID','PAID','PAID','PAID','PAID','PENDING','PENDING'] as PaymentStatus[]],
    [ihejirika, ['PAID','PAID','PENDING','PENDING','PENDING','PENDING','PENDING'] as PaymentStatus[]],
    [nnadi,     ['PAID','PAID','PAID','PAID','PENDING','PENDING','PENDING'] as PaymentStatus[]],
    [okonkwo,   ['PAID','PAID','PAID','PAID','PAID','PENDING','PENDING'] as PaymentStatus[]],
    [oeze,      ['PAID','PAID','PAID','PENDING','PENDING','PENDING','PENDING'] as PaymentStatus[]],
    [ohaeri,    ['PAID','PENDING','PENDING','PENDING','PENDING','PENDING','PENDING'] as PaymentStatus[]],
    [orji,      [null, null, null, null, null, null, 'PENDING'] as any],
  ]

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July']
  const paymentRecords = []

  for (const [member, statuses] of duesMatrix) {
    for (let i = 0; i < statuses.length; i++) {
      if (!statuses[i]) continue
      paymentRecords.push({
        userId: member.id,
        type: PaymentType.MONTHLY_DUES,
        status: statuses[i] as PaymentStatus,
        amount: 2000,
        description: `${monthNames[i]} monthly dues`,
        dueDate: setDate(subMonths(now, 6 - i), 28),
        paidAt: statuses[i] === 'PAID' ? setDate(subMonths(now, 6 - i), Math.floor(Math.random() * 15) + 1) : null,
      })
    }
  }

  // Additional payments
  const extras = [
    { userId: agu.id,      type: PaymentType.DEVELOPMENT_LEVY,    amount: 5000,  status: PaymentStatus.PAID,    description: 'Community borehole project',                  paidAt: monthDate(4) },
    { userId: obi.id,      type: PaymentType.DEVELOPMENT_LEVY,    amount: 5000,  status: PaymentStatus.PAID,    description: 'Community borehole project',                  paidAt: monthDate(4) },
    { userId: oeze.id,     type: PaymentType.DEVELOPMENT_LEVY,    amount: 5000,  status: PaymentStatus.PENDING, description: 'Community borehole project',                  dueDate: monthDate(3) },
    { userId: nwosu.id,    type: PaymentType.FINE,                amount: 1500,  status: PaymentStatus.PAID,    description: 'Absent without excuse — February meeting',   paidAt: monthDate(4) },
    { userId: ihejirika.id,type: PaymentType.FINE,                amount: 1500,  status: PaymentStatus.PENDING, description: 'Absent without excuse — April meeting',      dueDate: monthDate(2) },
    { userId: ohaeri.id,   type: PaymentType.FINE,                amount: 3000,  status: PaymentStatus.PENDING, description: 'Absent from 3 consecutive meetings',         dueDate: monthDate(1) },
    { userId: admin1.id,   type: PaymentType.DONATION,            amount: 10000, status: PaymentStatus.PAID,    description: 'Personal donation — secretariat renovation', paidAt: monthDate(3) },
    { userId: admin2.id,   type: PaymentType.DONATION,            amount: 15000, status: PaymentStatus.PAID,    description: 'Personal donation — secretariat renovation', paidAt: monthDate(3) },
    { userId: okonkwo.id,  type: PaymentType.EVENT_CONTRIBUTION,  amount: 3000,  status: PaymentStatus.PAID,    description: 'Annual General Meeting logistics',            paidAt: monthDate(1) },
    { userId: okeke.id,    type: PaymentType.EVENT_CONTRIBUTION,  amount: 3000,  status: PaymentStatus.PAID,    description: 'Annual General Meeting logistics',            paidAt: monthDate(1) },
  ]

  await prisma.payment.createMany({ data: [...paymentRecords, ...extras] })
  console.log(`✅ Seeded ${paymentRecords.length + extras.length} payment records`)

  // ── 5. ANNOUNCEMENTS ──────────────────────────────────────

  console.log('📢 Seeding announcements...')

  const announcementsData = [
    {
      authorId: superAdmin.id,
      title: 'Welcome to Akubueze Online Portal',
      body: 'Dear members, we are pleased to announce the launch of the Akubueze digital management platform. All members are encouraged to log in using the credentials provided and update your profiles. For login issues, please contact the Secretary General.',
      isPinned: true,
      publishedAt: subMonths(now, 6),
    },
    {
      authorId: admin1.id,
      title: 'January Dues Reminder',
      body: 'This is a reminder that January monthly dues of ₦2,000 are due by the end of the month. Members who have not paid will be liable for a ₦1,500 fine. Please make payment to the Treasurer promptly.',
      isPinned: false,
      publishedAt: subMonths(now, 6),
    },
    {
      authorId: superAdmin.id,
      title: 'Community Borehole Project — Levy Collection',
      body: 'The executive committee has unanimously approved a development levy of ₦5,000 per member toward the construction of a community borehole on Rumuola Road. This is a mandatory contribution. Payment deadline is end of March. Contact the Treasurer to make your payment.',
      isPinned: true,
      publishedAt: subMonths(now, 4),
    },
    {
      authorId: admin1.id,
      title: 'Misconduct Hearing Outcome',
      body: 'Following the emergency meeting held in April, the executive committee has concluded proceedings relating to the misconduct report. A member has been placed on suspension pending a formal review. Full details were communicated at the meeting. Members with questions should direct them to the President.',
      isPinned: false,
      publishedAt: subMonths(now, 3),
    },
    {
      authorId: superAdmin.id,
      title: 'Annual General Meeting — Save the Date',
      body: `Dear members, the Akubueze Age Grade Annual General Meeting is scheduled for ${addWeeks(now, 3).toDateString()} at Victory Hall, Rumuola, Port Harcourt. Attendance is compulsory for all active members. The formal agenda will be circulated one week before the meeting. Members who cannot attend must notify the Secretary General in advance.`,
      isPinned: true,
      publishedAt: subWeeks(now, 3),
    },
    {
      authorId: admin2.id,
      title: 'July Dues — Payment Deadline',
      body: 'This is a reminder that July monthly dues of ₦2,000 are now due. Members who have not paid by end of month will attract a ₦1,500 fine. Please make payment to the Treasurer and collect your receipt. Thank you.',
      isPinned: false,
      publishedAt: subWeeks(now, 1),
    },
  ]

  const announcements = await Promise.all(
    announcementsData.map((a) => prisma.announcement.create({ data: a }))
  )

  const [ann1, ann2, ann3, ann4, ann5, ann6] = announcements
  console.log(`✅ Seeded ${announcements.length} announcements`)

  // ── 6. ANNOUNCEMENT READS ─────────────────────────────────

  console.log('👁️  Seeding announcement reads...')

  const activeUsers = [admin1, admin2, agu, obi, nwosu, okeke, ihejirika, nnadi, okonkwo, oeze, ohaeri, orji]

  const reads = [
    // AGM notice — all active members read it
    ...activeUsers.map((u) => ({ announcementId: ann5.id, userId: u.id, readAt: subDays(now, Math.floor(Math.random() * 18) + 1) })),
    // July dues — 9 members read it (admin1, admin2, and 7 members)
    ...[admin1, admin2, agu, obi, okeke, nnadi, okonkwo, oeze, orji].map((u) => ({ announcementId: ann6.id, userId: u.id, readAt: subDays(now, Math.floor(Math.random() * 6) + 1) })),
    // Misconduct outcome — admins only
    ...[admin1, admin2].map((u) => ({ announcementId: ann4.id, userId: u.id, readAt: subMonths(now, 3) })),
  ]

  await prisma.announcementRead.createMany({ data: reads, skipDuplicates: true })
  console.log(`✅ Seeded ${reads.length} announcement reads`)

  // ─────────────────────────────────────────────────────────
  console.log('\n🎉 Seed complete!')
  console.log('\n📋 Login credentials:')
  console.log('   Super Admin : superadmin@akubueze.com  / Akubueze@2024')
  console.log('   Admin 1     : adaeze.okafor@akubueze.com / Akubueze@2024')
  console.log('   Admin 2     : emeka.onwudiwe@akubueze.com / Akubueze@2024')
  console.log('   Member      : c.agu@akubueze.com / Akubueze@2024 (will be prompted to reset)')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
```

---

## Running the Seed

**1. Install dependencies** (if not already present):

```bash
npm install bcryptjs date-fns
npm install --save-dev @types/bcryptjs
```

**2. Add the seed script to `package.json`:**

```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

**3. Run migrations first:**

```bash
npx prisma migrate dev --name init
```

**4. Run the seed:**

```bash
npx prisma db seed
```

**5. Verify in Prisma Studio:**

```bash
npx prisma studio
```

---

## Reset & Reseed

To wipe the database and start fresh during development:

```bash
# Drop all tables and re-run migrations
npx prisma migrate reset

# This automatically runs the seed script afterward
```

> ⚠️ `migrate reset` will delete **all data**. Never run this against a production database.

---

*Last updated: May 2026*