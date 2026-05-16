import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  Role,
  MemberStatus,
  Gender,
  MeetingType,
  MeetingStatus,
  AttendanceStatus,
  PaymentType,
  PaymentStatus,
} from "../lib/generated/prisma/client";
import bcrypt from "bcryptjs";
import { subMonths, subWeeks, subDays, addWeeks, setDate } from "date-fns";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as never);

const DEFAULT_PASSWORD = bcrypt.hashSync("Akubueze@2026", 12);
const now = new Date();

function monthDate(monthsAgo: number): Date {
  return setDate(subMonths(now, monthsAgo), 15);
}

async function main() {
  console.log("🌱 Starting Akubueze seed...");

  // ── 1. USERS ─────────────────────────────────────────────

  console.log("👤 Seeding users...");

  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@akubueze.com" },
    update: {},
    create: {
      fullName: "Obiora Nnamdi Eze",
      email: "superadmin@akubueze.com",
      phone: "08031234567",
      passwordHash: DEFAULT_PASSWORD,
      role: Role.SUPER_ADMIN,
      status: MemberStatus.ACTIVE,
      gender: Gender.MALE,
      occupation: "Association President",
      address: "14 Rumuola Road, Port Harcourt",
      mustResetPassword: false,
      dateJoined: subMonths(now, 36),
    },
  });

  const admin1 = await prisma.user.upsert({
    where: { email: "adaeze.okafor@akubueze.com" },
    update: {},
    create: {
      fullName: "Adaeze Chisom Okafor",
      email: "adaeze.okafor@akubueze.com",
      phone: "08055678901",
      passwordHash: DEFAULT_PASSWORD,
      role: Role.ADMIN,
      status: MemberStatus.ACTIVE,
      gender: Gender.FEMALE,
      occupation: "Secretary General",
      address: "22 Ada George Road, Port Harcourt",
      mustResetPassword: false,
      dateJoined: subMonths(now, 30),
    },
  });

  const admin2 = await prisma.user.upsert({
    where: { email: "emeka.onwudiwe@akubueze.com" },
    update: {},
    create: {
      fullName: "Emeka Chukwudi Onwudiwe",
      email: "emeka.onwudiwe@akubueze.com",
      phone: "08167890123",
      passwordHash: DEFAULT_PASSWORD,
      role: Role.ADMIN,
      status: MemberStatus.ACTIVE,
      gender: Gender.MALE,
      occupation: "Treasurer",
      address: "5 Woji Road, GRA Phase 2, Port Harcourt",
      mustResetPassword: false,
      dateJoined: subMonths(now, 24),
    },
  });

  const memberData = [
    { fullName: "Chukwuemeka Obinna Agu",  email: "c.agu@akubueze.com",       phone: "08023456789", gender: Gender.MALE,   occupation: "Civil Engineer", address: "3 Birabi Street, GRA Phase 1",   status: MemberStatus.ACTIVE,    dateJoined: subMonths(now, 24) },
    { fullName: "Ngozi Amaka Obi",          email: "n.obi@akubueze.com",       phone: "08134567890", gender: Gender.FEMALE, occupation: "Pharmacist",     address: "11 Rumuibekwe Road, PH",         status: MemberStatus.ACTIVE,    dateJoined: subMonths(now, 24) },
    { fullName: "Ikechukwu Silas Nwosu",    email: "i.nwosu@akubueze.com",     phone: "08045678901", gender: Gender.MALE,   occupation: "Trader",         address: "7 Ogbunabali Road, PH",          status: MemberStatus.ACTIVE,    dateJoined: subMonths(now, 18) },
    { fullName: "Chidinma Uju Okeke",       email: "c.okeke@akubueze.com",     phone: "08156789012", gender: Gender.FEMALE, occupation: "Teacher",        address: "9 Eliozu Road, Rumola",          status: MemberStatus.ACTIVE,    dateJoined: subMonths(now, 18) },
    { fullName: "Uche Tobias Ihejirika",    email: "u.ihejirika@akubueze.com", phone: "08067890123", gender: Gender.MALE,   occupation: "Mechanic",       address: "2 Rumuola Housing Estate",       status: MemberStatus.ACTIVE,    dateJoined: subMonths(now, 18) },
    { fullName: "Adaora Blessing Nnadi",    email: "a.nnadi@akubueze.com",     phone: "08178901234", gender: Gender.FEMALE, occupation: "Nurse",          address: "15 D-Line Road, PH",             status: MemberStatus.ACTIVE,    dateJoined: subMonths(now, 12) },
    { fullName: "Chinedu Festus Okonkwo",   email: "c.okonkwo@akubueze.com",   phone: "08089012345", gender: Gender.MALE,   occupation: "Accountant",     address: "6 Moscow Road, PH",              status: MemberStatus.ACTIVE,    dateJoined: subMonths(now, 12) },
    { fullName: "Onyekachi Vera Eze",       email: "o.eze@akubueze.com",       phone: "08190123456", gender: Gender.FEMALE, occupation: "Hair Stylist",   address: "18 Rumuobiakani Road",           status: MemberStatus.ACTIVE,    dateJoined: subMonths(now, 12) },
    { fullName: "Nnamdi Godwin Ohaeri",     email: "n.ohaeri@akubueze.com",    phone: "08001234567", gender: Gender.MALE,   occupation: "Driver",         address: "4 Rumuola Road, PH",             status: MemberStatus.ACTIVE,    dateJoined: subMonths(now, 8)  },
    { fullName: "Kelechi Bright Onyia",     email: "k.onyia@akubueze.com",     phone: "08112345678", gender: Gender.MALE,   occupation: "Carpenter",      address: "33 Rumuokwurushi Road",          status: MemberStatus.SUSPENDED, dateJoined: subMonths(now, 12) },
    { fullName: "Ebele Grace Odum",         email: "e.odum@akubueze.com",      phone: "08023456780", gender: Gender.FEMALE, occupation: "Seamstress",     address: "8 Rumuola Close, PH",            status: MemberStatus.INACTIVE,  dateJoined: subMonths(now, 24) },
    { fullName: "Somtochukwu Paul Orji",    email: "s.orji@akubueze.com",      phone: "08134567891", gender: Gender.MALE,   occupation: "Student",        address: "1 University Road, Choba",       status: MemberStatus.ACTIVE,    dateJoined: subMonths(now, 1)  },
  ];

  const members = await Promise.all(
    memberData.map((m) =>
      prisma.user.upsert({
        where: { email: m.email },
        update: {},
        create: { ...m, passwordHash: DEFAULT_PASSWORD, role: Role.MEMBER, mustResetPassword: true },
      })
    )
  );

  const [agu, obi, nwosu, okeke, ihejirika, nnadi, okonkwo, oeze, ohaeri, , , orji] = members;

  console.log(`✅ Seeded ${members.length + 3} users`);

  // ── 2. MEETINGS ──────────────────────────────────────────
  // Each completed meeting has a host. Dues are compulsory for all members:
  // host pays ₦5,000 (MEETING_HOST_FEE), everyone else pays ₦1,000 (MEETING_DUES).

  console.log("📅 Seeding meetings...");

  const meetingsData = [
    {
      title: "January General Assembly",
      type: MeetingType.GENERAL,
      status: MeetingStatus.COMPLETED,
      scheduledAt: monthDate(6),
      location: "Town Hall, Mile 1, Port Harcourt",
      agenda: "1. Opening prayer\n2. Roll call\n3. New year address by the President\n4. Review of last year activities\n5. AOB\n6. Closing prayer",
      hostId: agu.id,
    },
    {
      title: "February Executive Review",
      type: MeetingType.EXECUTIVE,
      status: MeetingStatus.COMPLETED,
      scheduledAt: monthDate(5),
      location: "Secretariat Office, Ada George Road",
      agenda: "1. Q1 budget review\n2. Dues collection status\n3. Borehole project update\n4. AOB",
      hostId: obi.id,
    },
    {
      title: "March General Meeting",
      type: MeetingType.GENERAL,
      status: MeetingStatus.COMPLETED,
      scheduledAt: monthDate(4),
      location: "Town Hall, Mile 1, Port Harcourt",
      agenda: "1. Opening prayer\n2. Roll call\n3. Community development levy announcement\n4. Borehole project briefing\n5. AOB",
      hostId: nnadi.id,
    },
    {
      title: "April Emergency Meeting",
      type: MeetingType.EMERGENCY,
      status: MeetingStatus.COMPLETED,
      scheduledAt: monthDate(3),
      location: "Secretariat Office, Ada George Road",
      notes: "Called to address misconduct report filed against a member.",
      hostId: okeke.id,
    },
    {
      title: "May General Meeting",
      type: MeetingType.GENERAL,
      status: MeetingStatus.COMPLETED,
      scheduledAt: monthDate(2),
      location: "Town Hall, Mile 1, Port Harcourt",
      hostId: oeze.id,
    },
    {
      title: "June Executive Session",
      type: MeetingType.EXECUTIVE,
      status: MeetingStatus.COMPLETED,
      scheduledAt: monthDate(1),
      location: "Secretariat Office, Ada George Road",
      hostId: okonkwo.id,
    },
    {
      title: "July General Meeting",
      type: MeetingType.GENERAL,
      status: MeetingStatus.COMPLETED,
      scheduledAt: subWeeks(now, 2),
      location: "Town Hall, Mile 1, Port Harcourt",
      agenda: "1. Opening prayer\n2. Roll call\n3. July dues collection\n4. AGM announcement\n5. AOB\n6. Closing prayer",
      hostId: ihejirika.id,
    },
    {
      title: "Annual General Meeting 2026",
      type: MeetingType.ANNUAL,
      status: MeetingStatus.SCHEDULED,
      scheduledAt: addWeeks(now, 3),
      location: "Victory Hall, Rumuola, Port Harcourt",
      agenda: "1. Opening prayer\n2. Roll call\n3. President's annual address\n4. Financial report by Treasurer\n5. Elections\n6. AOB\n7. Closing prayer",
    },
    {
      title: "August Executive Meeting",
      type: MeetingType.EXECUTIVE,
      status: MeetingStatus.SCHEDULED,
      scheduledAt: addWeeks(now, 5),
      location: "Secretariat Office, Ada George Road",
    },
    {
      title: "August General Meeting",
      type: MeetingType.GENERAL,
      status: MeetingStatus.SCHEDULED,
      scheduledAt: addWeeks(now, 7),
      location: "Town Hall, Mile 1, Port Harcourt",
    },
  ];

  const meetings = await Promise.all(
    meetingsData.map((m) => prisma.meeting.create({ data: m }))
  );

  const [janMtg, febMtg, marMtg, aprMtg, mayMtg, junMtg, julMtg] = meetings;
  const completedMeetings = [janMtg, febMtg, marMtg, aprMtg, mayMtg, junMtg, julMtg];

  console.log(`✅ Seeded ${meetings.length} meetings`);

  // ── 3. ATTENDANCE ────────────────────────────────────────

  console.log("🙋 Seeding attendance...");

  type AttRecord = { userId: string; meetingId: string; status: AttendanceStatus; remarks?: string };
  const attendanceRecords: AttRecord[] = [];

  const att = (userId: string, meetingId: string, status: AttendanceStatus, remarks?: string): AttRecord =>
    ({ userId, meetingId, status, remarks });

  // Adaeze Okafor — PRESENT all 7
  completedMeetings.forEach((m) => attendanceRecords.push(att(admin1.id, m.id, AttendanceStatus.PRESENT)));

  // Emeka Onwudiwe — PRESENT 6, EXCUSED 1 (April)
  completedMeetings.forEach((m) =>
    attendanceRecords.push(att(admin2.id, m.id, m.id === aprMtg.id ? AttendanceStatus.EXCUSED : AttendanceStatus.PRESENT))
  );

  // Chukwuemeka Agu — PRESENT 6, ABSENT 1 (Feb) | host: Jan
  completedMeetings.forEach((m) =>
    attendanceRecords.push(att(agu.id, m.id, m.id === febMtg.id ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT))
  );

  // Ngozi Obi — PRESENT 5, EXCUSED 1 (Apr), ABSENT 1 (Jun) | host: Feb
  completedMeetings.forEach((m) => {
    const s = m.id === aprMtg.id ? AttendanceStatus.EXCUSED : m.id === junMtg.id ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT;
    attendanceRecords.push(att(obi.id, m.id, s));
  });

  // Ikechukwu Nwosu — PRESENT 4, ABSENT 3 (Apr, Jun, Jul)
  completedMeetings.forEach((m) => {
    const absentIds = [aprMtg.id, junMtg.id, julMtg.id];
    attendanceRecords.push(att(nwosu.id, m.id, absentIds.includes(m.id) ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT));
  });

  // Chidinma Okeke — PRESENT 5, ABSENT 2 (Mar, Jun) | host: Apr
  completedMeetings.forEach((m) => {
    const absentIds = [marMtg.id, junMtg.id];
    attendanceRecords.push(att(okeke.id, m.id, absentIds.includes(m.id) ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT));
  });

  // Uche Ihejirika — PRESENT 4, ABSENT 3 (Feb, May, Jun) | host: Jul
  completedMeetings.forEach((m) => {
    const absentIds = [febMtg.id, mayMtg.id, junMtg.id];
    attendanceRecords.push(att(ihejirika.id, m.id, absentIds.includes(m.id) ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT));
  });

  // Adaora Nnadi — last 5 meetings only (Mar–Jul), PRESENT 4, ABSENT 1 (Jun) | host: Mar
  const last5 = [marMtg, aprMtg, mayMtg, junMtg, julMtg];
  last5.forEach((m) =>
    attendanceRecords.push(att(nnadi.id, m.id, m.id === junMtg.id ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT))
  );

  // Chinedu Okonkwo — last 5 meetings only, PRESENT 4, ABSENT 1 (May) | host: Jun
  last5.forEach((m) =>
    attendanceRecords.push(att(okonkwo.id, m.id, m.id === mayMtg.id ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT))
  );

  // Onyekachi Eze — last 5 meetings only, PRESENT 3, ABSENT 2 (Apr, Jul) | host: May
  last5.forEach((m) => {
    const absentIds = [aprMtg.id, julMtg.id];
    attendanceRecords.push(att(oeze.id, m.id, absentIds.includes(m.id) ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT));
  });

  // Nnamdi Ohaeri — last 4 meetings only (Apr–Jul), PRESENT 2, ABSENT 2 (May, Jul)
  const last4 = [aprMtg, mayMtg, junMtg, julMtg];
  last4.forEach((m) => {
    const absentIds = [mayMtg.id, julMtg.id];
    attendanceRecords.push(att(ohaeri.id, m.id, absentIds.includes(m.id) ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT, absentIds.includes(m.id) ? "No notice given" : undefined));
  });

  // Somtochukwu Orji — most recent meeting only (joined 1 month ago)
  attendanceRecords.push(att(orji.id, julMtg.id, AttendanceStatus.PRESENT));

  await prisma.attendance.createMany({ data: attendanceRecords, skipDuplicates: true });
  console.log(`✅ Seeded ${attendanceRecords.length} attendance records`);

  // ── 4. PAYMENTS ──────────────────────────────────────────

  console.log("💰 Seeding payments...");

  // Build lookup: userId-meetingId → AttendanceStatus
  const attendanceLookup = new Map<string, AttendanceStatus>();
  for (const rec of attendanceRecords) {
    attendanceLookup.set(`${rec.userId}-${rec.meetingId}`, rec.status);
  }

  // All members who pay dues (superAdmin is exempt as president)
  const duesMembers = [admin1, admin2, agu, obi, nwosu, okeke, ihejirika, nnadi, okonkwo, oeze, ohaeri, orji];

  type PaymentInput = {
    userId: string;
    type: PaymentType;
    status: PaymentStatus;
    amount: number;
    description: string;
    paidAt?: Date | null;
    dueDate?: Date | null;
  };

  const paymentRecords: PaymentInput[] = [];

  // Host and per-member dues for each completed meeting.
  // MEETING_HOST_FEE (₦5,000) for the host.
  // MEETING_DUES (₦1,000) for every other member who had joined by that meeting date —
  // PAID if they were present, PENDING if absent/excused/not yet tracked.
  const meetingHosts: Record<string, typeof agu> = {
    [janMtg.id]: agu,
    [febMtg.id]: obi,
    [marMtg.id]: nnadi,
    [aprMtg.id]: okeke,
    [mayMtg.id]: oeze,
    [junMtg.id]: okonkwo,
    [julMtg.id]: ihejirika,
  };

  for (const meeting of completedMeetings) {
    const host = meetingHosts[meeting.id];

    // Host fee — always paid
    paymentRecords.push({
      userId: host.id,
      type: PaymentType.MEETING_HOST_FEE,
      status: PaymentStatus.PAID,
      amount: 5000,
      description: `Meeting dues (host) — ${meeting.title}`,
      paidAt: meeting.scheduledAt,
    });

    // Dues for every other member who had joined by this meeting's date
    for (const member of duesMembers) {
      if (member.id === host.id) continue;
      if (member.dateJoined > meeting.scheduledAt) continue; // not yet a member

      const attStatus = attendanceLookup.get(`${member.id}-${meeting.id}`);
      const paid = attStatus === AttendanceStatus.PRESENT;

      paymentRecords.push({
        userId: member.id,
        type: PaymentType.MEETING_DUES,
        status: paid ? PaymentStatus.PAID : PaymentStatus.PENDING,
        amount: 1000,
        description: `Meeting dues — ${meeting.title}`,
        paidAt: paid ? meeting.scheduledAt : null,
        dueDate: paid ? null : meeting.scheduledAt,
      });
    }
  }

  const extras = [
    { userId: agu.id,       type: PaymentType.DEVELOPMENT_LEVY,   amount: 5000,  status: PaymentStatus.PAID,    description: "Community borehole project",                  paidAt: monthDate(4) },
    { userId: obi.id,       type: PaymentType.DEVELOPMENT_LEVY,   amount: 5000,  status: PaymentStatus.PAID,    description: "Community borehole project",                  paidAt: monthDate(4) },
    { userId: oeze.id,      type: PaymentType.DEVELOPMENT_LEVY,   amount: 5000,  status: PaymentStatus.PENDING, description: "Community borehole project",                  dueDate: monthDate(3) },
    { userId: nwosu.id,     type: PaymentType.FINE,               amount: 1500,  status: PaymentStatus.PAID,    description: "Absent without excuse — February meeting",    paidAt: monthDate(4) },
    { userId: ihejirika.id, type: PaymentType.FINE,               amount: 1500,  status: PaymentStatus.PENDING, description: "Absent without excuse — April meeting",       dueDate: monthDate(2) },
    { userId: ohaeri.id,    type: PaymentType.FINE,               amount: 3000,  status: PaymentStatus.PENDING, description: "Absent from 3 consecutive meetings",          dueDate: monthDate(1) },
    { userId: admin1.id,    type: PaymentType.DONATION,           amount: 10000, status: PaymentStatus.PAID,    description: "Personal donation — secretariat renovation",  paidAt: monthDate(3) },
    { userId: admin2.id,    type: PaymentType.DONATION,           amount: 15000, status: PaymentStatus.PAID,    description: "Personal donation — secretariat renovation",  paidAt: monthDate(3) },
    { userId: okonkwo.id,   type: PaymentType.EVENT_CONTRIBUTION, amount: 3000,  status: PaymentStatus.PAID,    description: "Annual General Meeting logistics",             paidAt: monthDate(1) },
    { userId: okeke.id,     type: PaymentType.EVENT_CONTRIBUTION, amount: 3000,  status: PaymentStatus.PAID,    description: "Annual General Meeting logistics",             paidAt: monthDate(1) },
  ];

  await prisma.payment.createMany({ data: [...paymentRecords, ...extras] });
  console.log(`✅ Seeded ${paymentRecords.length + extras.length} payment records`);

  // ── 5. ANNOUNCEMENTS ─────────────────────────────────────

  console.log("📢 Seeding announcements...");

  const announcementsData = [
    {
      authorId: superAdmin.id,
      title: "Welcome to Akubueze Online Portal",
      body: "Dear members, we are pleased to announce the launch of the Akubueze digital management platform. All members are encouraged to log in using the credentials provided and update your profiles. For login issues, please contact the Secretary General.",
      isPinned: true,
      publishedAt: subMonths(now, 6),
    },
    {
      authorId: admin1.id,
      title: "January Meeting Dues Reminder",
      body: "This is a reminder that January meeting dues are compulsory for all members. The host pays ₦5,000; all other members pay ₦1,000. Members who have not paid will be liable for a fine. Please make payment to the Treasurer promptly.",
      isPinned: false,
      publishedAt: subMonths(now, 6),
    },
    {
      authorId: superAdmin.id,
      title: "Community Borehole Project — Levy Collection",
      body: "The executive committee has unanimously approved a development levy of ₦5,000 per member toward the construction of a community borehole on Rumuola Road. This is a mandatory contribution. Payment deadline is end of March. Contact the Treasurer to make your payment.",
      isPinned: true,
      publishedAt: subMonths(now, 4),
    },
    {
      authorId: admin1.id,
      title: "Misconduct Hearing Outcome",
      body: "Following the emergency meeting held in April, the executive committee has concluded proceedings relating to the misconduct report. A member has been placed on suspension pending a formal review. Full details were communicated at the meeting. Members with questions should direct them to the President.",
      isPinned: false,
      publishedAt: subMonths(now, 3),
    },
    {
      authorId: superAdmin.id,
      title: "Annual General Meeting — Save the Date",
      body: `Dear members, the Akubueze Age Grade Annual General Meeting is scheduled for ${addWeeks(now, 3).toDateString()} at Victory Hall, Rumuola, Port Harcourt. Attendance is compulsory for all active members. The formal agenda will be circulated one week before the meeting. Members who cannot attend must notify the Secretary General in advance.`,
      isPinned: true,
      publishedAt: subWeeks(now, 3),
    },
    {
      authorId: admin2.id,
      title: "July Meeting Dues — Payment Deadline",
      body: "This is a reminder that July meeting dues are now outstanding. The host pays ₦5,000; all other members pay ₦1,000. Members who have not paid by end of month will attract a ₦1,500 fine. Please make payment to the Treasurer and collect your receipt. Thank you.",
      isPinned: false,
      publishedAt: subWeeks(now, 1),
    },
  ];

  const announcements = await Promise.all(
    announcementsData.map((a) => prisma.announcement.create({ data: a }))
  );

  const [, , , ann4, ann5, ann6] = announcements;
  console.log(`✅ Seeded ${announcements.length} announcements`);

  // ── 6. ANNOUNCEMENT READS ────────────────────────────────

  console.log("👁️  Seeding announcement reads...");

  const activeUsers = [admin1, admin2, agu, obi, nwosu, okeke, ihejirika, nnadi, okonkwo, oeze, ohaeri, orji];

  const reads = [
    // AGM notice — all active members + both admins
    ...activeUsers.map((u) => ({ announcementId: ann5.id, userId: u.id, readAt: subDays(now, Math.floor(Math.random() * 18) + 1) })),
    // July dues — admins + 7 members
    ...[admin1, admin2, agu, obi, okeke, nnadi, okonkwo, oeze, orji].map((u) => ({ announcementId: ann6.id, userId: u.id, readAt: subDays(now, Math.floor(Math.random() * 6) + 1) })),
    // Misconduct outcome — admins only
    ...[admin1, admin2].map((u) => ({ announcementId: ann4.id, userId: u.id, readAt: subMonths(now, 3) })),
  ];

  await prisma.announcementRead.createMany({ data: reads, skipDuplicates: true });
  console.log(`✅ Seeded ${reads.length} announcement reads`);

  console.log("\n🎉 Seed complete!");
  console.log("\n📋 Login credentials (password: Akubueze@2026):");
  console.log("   Super Admin : superadmin@akubueze.com");
  console.log("   Admin 1     : adaeze.okafor@akubueze.com");
  console.log("   Admin 2     : emeka.onwudiwe@akubueze.com");
  console.log("   Member      : c.agu@akubueze.com  (will be prompted to reset)");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
