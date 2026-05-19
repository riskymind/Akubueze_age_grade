import { cache } from "react";
import {
  formatDistanceToNow,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  MEETING_HOST_FEE: "Meeting Host Fee",
  MEETING_DUES: "Meeting Dues",
  DEVELOPMENT_LEVY: "Development Levy",
  EVENT_CONTRIBUTION: "Event Contribution",
  FINE: "Fine",
  DONATION: "Donation",
};

export const getCurrentUser = cache(async () => {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return {
    id: session.user.id,
    fullName: session.user.name ?? "",
    role: session.user.role,
    status: session.user.status,
    mustResetPassword: session.user.mustResetPassword,
  };
});

export async function getDashboardStats(userId: string, isAdmin: boolean) {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [
    totalMembers,
    upcomingMeetingsCount,
    paymentsThisMonth,
    totalAttendance,
    presentAttendance,
  ] = await Promise.all([
    isAdmin ? prisma.user.count({ where: { status: "ACTIVE" } }) : null,

    prisma.meeting.count({
      where: { status: "SCHEDULED", scheduledAt: { gte: now } },
    }),

    prisma.payment.aggregate({
      where: {
        ...(isAdmin ? {} : { userId }),
        status: "PAID",
        paidAt: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
    }),

    prisma.attendance.count({
      where: {
        ...(isAdmin ? {} : { userId }),
        meeting: { status: "COMPLETED" },
      },
    }),

    prisma.attendance.count({
      where: {
        ...(isAdmin ? {} : { userId }),
        status: "PRESENT",
        meeting: { status: "COMPLETED" },
      },
    }),
  ]);

  return {
    totalMembers,
    upcomingMeetingsCount,
    paymentsThisMonth: paymentsThisMonth._sum.amount ?? 0,
    attendanceRate:
      totalAttendance > 0
        ? Math.round((presentAttendance / totalAttendance) * 100)
        : 0,
  };
}

export async function getUpcomingMeetings() {
  const now = new Date();
  return prisma.meeting.findMany({
    where: { status: "SCHEDULED", scheduledAt: { gte: now } },
    orderBy: { scheduledAt: "asc" },
    take: 5,
    select: {
      id: true,
      title: true,
      type: true,
      scheduledAt: true,
      location: true,
    },
  });
}

export async function getAnnouncements(userId: string) {
  const rows = await prisma.announcement.findMany({
    take: 5,
    orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
    select: {
      id: true,
      title: true,
      body: true,
      isPinned: true,
      publishedAt: true,
      reads: { where: { userId }, select: { id: true } },
    },
  });

  return rows.map(({ reads, ...rest }) => ({
    ...rest,
    isRead: reads.length > 0,
    timeAgo: formatDistanceToNow(rest.publishedAt, { addSuffix: true }),
  }));
}

export async function getMemberDashboardData(userId: string) {
  const now = new Date();
  const yearStart = startOfYear(now);
  const yearEnd = endOfYear(now);

  const [
    nextMeeting,
    outstandingBalance,
    totalAttendance,
    presentAttendance,
    recentPayments,
    pendingCount,
    totalPaidThisYear,
    memberProfile,
  ] = await Promise.all([
    prisma.meeting.findFirst({
      where: { status: "SCHEDULED", scheduledAt: { gte: now } },
      orderBy: { scheduledAt: "asc" },
      select: {
        id: true,
        title: true,
        type: true,
        scheduledAt: true,
        location: true,
      },
    }),

    prisma.payment.aggregate({
      where: { userId, status: "PENDING" },
      _sum: { amount: true },
    }),

    prisma.attendance.count({
      where: { userId, meeting: { status: "COMPLETED" } },
    }),

    prisma.attendance.count({
      where: { userId, status: "PRESENT", meeting: { status: "COMPLETED" } },
    }),

    prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        type: true,
        amount: true,
        status: true,
        paidAt: true,
        createdAt: true,
      },
    }),

    prisma.payment.count({
      where: { userId, status: "PENDING" },
    }),

    prisma.payment.aggregate({
      where: {
        userId,
        status: "PAID",
        paidAt: { gte: yearStart, lte: yearEnd },
      },
      _sum: { amount: true },
    }),

    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { dateJoined: true, status: true },
    }),
  ]);

  return {
    nextMeeting,
    outstandingBalance: outstandingBalance._sum.amount ?? 0,
    attendanceRate:
      totalAttendance > 0
        ? Math.round((presentAttendance / totalAttendance) * 100)
        : 0,
    recentPayments,
    duesStatus: pendingCount > 0 ? "Outstanding" : "Paid to Date",
    totalPaidThisYear: totalPaidThisYear._sum.amount ?? 0,
    memberSince: memberProfile.dateJoined,
    memberStatus: memberProfile.status,
  };
}

export async function getRecentActivity() {
  const [attendances, payments, newMembers] = await Promise.all([
    prisma.attendance.findMany({
      take: 5,
      orderBy: { markedAt: "desc" },
      select: {
        id: true,
        markedAt: true,
        user: { select: { fullName: true } },
        meeting: { select: { title: true } },
      },
    }),

    prisma.payment.findMany({
      take: 5,
      where: { status: "PAID" },
      orderBy: { paidAt: "desc" },
      select: {
        id: true,
        type: true,
        amount: true,
        paidAt: true,
        createdAt: true,
        user: { select: { fullName: true } },
      },
    }),

    prisma.user.findMany({
      take: 3,
      orderBy: { dateJoined: "desc" },
      select: { id: true, fullName: true, dateJoined: true },
    }),
  ]);

  const activities = [
    ...attendances.map((a) => ({
      id: `att_${a.id}`,
      actor: a.user.fullName,
      description: "marked attendance for",
      subject: a.meeting.title,
      timestamp: a.markedAt,
    })),
    ...payments.map((p) => ({
      id: `pay_${p.id}`,
      actor: p.user.fullName,
      description: `recorded payment of ₦${p.amount.toLocaleString()} —`,
      subject: PAYMENT_TYPE_LABELS[p.type] ?? p.type,
      timestamp: p.paidAt ?? p.createdAt,
    })),
    ...newMembers.map((u) => ({
      id: `usr_${u.id}`,
      actor: u.fullName,
      description: "was added as",
      subject: "New Member",
      timestamp: u.dateJoined,
    })),
  ];

  return activities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 8)
    .map((a) => ({
      ...a,
      timeAgo: formatDistanceToNow(a.timestamp, { addSuffix: true }),
    }));
}
