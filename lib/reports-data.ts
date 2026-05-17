import {
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subMonths,
  subYears,
  format,
  eachMonthOfInterval,
} from "date-fns";
import prisma from "@/lib/prisma";

export type Timeframe = "THIS_MONTH" | "LAST_MONTH" | "THIS_YEAR" | "ALL_TIME";

export type ReportStats = {
  totalMembers: number;
  totalMembersDelta: number;
  avgAttendance: number;
  avgAttendanceDelta: number;
  totalDuesCollected: number;
  totalDuesCollectedDelta: number;
  outstandingDues: number;
  outstandingDuesDelta: number;
};

export type MembershipTrendRow = {
  month: string;
  newMembers: number;
  active: number;
  inactive: number;
  suspended: number;
};

type DateRange = { start: Date; end: Date };

function getDateRanges(timeframe: Timeframe): {
  current: DateRange;
  previous: DateRange | null;
} {
  const now = new Date();

  switch (timeframe) {
    case "THIS_MONTH":
      return {
        current: { start: startOfMonth(now), end: endOfMonth(now) },
        previous: {
          start: startOfMonth(subMonths(now, 1)),
          end: endOfMonth(subMonths(now, 1)),
        },
      };
    case "LAST_MONTH": {
      const lastMonth = subMonths(now, 1);
      const twoMonthsAgo = subMonths(now, 2);
      return {
        current: {
          start: startOfMonth(lastMonth),
          end: endOfMonth(lastMonth),
        },
        previous: {
          start: startOfMonth(twoMonthsAgo),
          end: endOfMonth(twoMonthsAgo),
        },
      };
    }
    case "THIS_YEAR":
      return {
        current: { start: startOfYear(now), end: endOfYear(now) },
        previous: {
          start: startOfYear(subYears(now, 1)),
          end: endOfYear(subYears(now, 1)),
        },
      };
    case "ALL_TIME":
    default:
      return {
        current: { start: new Date(0), end: now },
        previous: null,
      };
  }
}

function calcAvgAttendance(records: { status: string }[]): number {
  if (records.length === 0) return 0;
  const present = records.filter((r) => r.status === "PRESENT").length;
  return Math.round((present / records.length) * 100);
}

export async function getReportStats(timeframe: Timeframe): Promise<ReportStats> {
  const { current, previous } = getDateRanges(timeframe);

  const [
    totalMembersCurr,
    totalMembersPrev,
    attendanceCurr,
    attendancePrev,
    duesCollectedCurr,
    duesCollectedPrev,
    outstandingCurr,
    outstandingPrev,
  ] = await Promise.all([
    prisma.user.count({ where: { dateJoined: { lte: current.end } } }),
    previous
      ? prisma.user.count({ where: { dateJoined: { lte: previous.end } } })
      : Promise.resolve(0),

    prisma.attendance.findMany({
      where: {
        meeting: { scheduledAt: { gte: current.start, lte: current.end } },
      },
      select: { status: true },
    }),
    previous
      ? prisma.attendance.findMany({
          where: {
            meeting: {
              scheduledAt: { gte: previous.start, lte: previous.end },
            },
          },
          select: { status: true },
        })
      : Promise.resolve([]),

    prisma.payment.aggregate({
      where: {
        status: "PAID",
        createdAt: { gte: current.start, lte: current.end },
      },
      _sum: { amount: true },
    }),
    previous
      ? prisma.payment.aggregate({
          where: {
            status: "PAID",
            createdAt: { gte: previous.start, lte: previous.end },
          },
          _sum: { amount: true },
        })
      : Promise.resolve({ _sum: { amount: null } }),

    prisma.payment.aggregate({
      where: {
        status: "PENDING",
        createdAt: { gte: current.start, lte: current.end },
      },
      _sum: { amount: true },
    }),
    previous
      ? prisma.payment.aggregate({
          where: {
            status: "PENDING",
            createdAt: { gte: previous.start, lte: previous.end },
          },
          _sum: { amount: true },
        })
      : Promise.resolve({ _sum: { amount: null } }),
  ]);

  const avgCurr = calcAvgAttendance(attendanceCurr);
  const avgPrev = calcAvgAttendance(attendancePrev);
  const duesCurr = duesCollectedCurr._sum.amount ?? 0;
  const duesPrev = duesCollectedPrev._sum.amount ?? 0;
  const outCurr = outstandingCurr._sum.amount ?? 0;
  const outPrev = outstandingPrev._sum.amount ?? 0;

  return {
    totalMembers: totalMembersCurr,
    totalMembersDelta: previous ? totalMembersCurr - totalMembersPrev : 0,
    avgAttendance: avgCurr,
    avgAttendanceDelta: previous ? avgCurr - avgPrev : 0,
    totalDuesCollected: duesCurr,
    totalDuesCollectedDelta: previous ? duesCurr - duesPrev : 0,
    outstandingDues: outCurr,
    outstandingDuesDelta: previous ? outCurr - outPrev : 0,
  };
}

export async function getMembershipTrends(): Promise<MembershipTrendRow[]> {
  const now = new Date();
  const yearStart = startOfYear(now);
  const months = eachMonthOfInterval({ start: yearStart, end: now });

  const users = await prisma.user.findMany({
    select: { status: true, dateJoined: true },
  });

  return months.map((monthDate) => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const joinedByMonthEnd = users.filter((u) => u.dateJoined <= monthEnd);

    return {
      month: format(monthDate, "MMMM"),
      newMembers: users.filter(
        (u) => u.dateJoined >= monthStart && u.dateJoined <= monthEnd
      ).length,
      active: joinedByMonthEnd.filter((u) => u.status === "ACTIVE").length,
      inactive: joinedByMonthEnd.filter((u) => u.status === "INACTIVE").length,
      suspended: joinedByMonthEnd.filter((u) => u.status === "SUSPENDED").length,
    };
  });
}

export function getDeltaLabel(timeframe: Timeframe): string {
  switch (timeframe) {
    case "THIS_MONTH":
      return "vs last month";
    case "LAST_MONTH":
      return "vs month before";
    case "THIS_YEAR":
      return "vs last year";
    default:
      return "";
  }
}
