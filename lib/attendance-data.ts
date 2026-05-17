import prisma from "@/lib/prisma";
import { AttendanceStatus } from "@/lib/generated/prisma/client";

export type AttendanceRow = {
  id: string;
  status: AttendanceStatus;
  user: {
    id: string;
    fullName: string;
  };
  meeting: {
    id: string;
    title: string;
    scheduledAt: Date;
  };
};

export type MeetingOption = {
  id: string;
  title: string;
  scheduledAt: Date;
};

export async function getAttendance(
  userId: string,
  isAdmin: boolean,
  search?: string,
  meetingId?: string,
  status?: string
): Promise<AttendanceRow[]> {
  return prisma.attendance.findMany({
    where: {
      ...(isAdmin ? {} : { userId }),
      ...(meetingId && meetingId !== "ALL" ? { meetingId } : {}),
      ...(status && status !== "ALL"
        ? { status: status as AttendanceStatus }
        : {}),
      ...(search
        ? {
            OR: [
              { user: { fullName: { contains: search, mode: "insensitive" } } },
              {
                meeting: { title: { contains: search, mode: "insensitive" } },
              },
            ],
          }
        : {}),
    },
    orderBy: { meeting: { scheduledAt: "desc" } },
    select: {
      id: true,
      status: true,
      user: { select: { id: true, fullName: true } },
      meeting: { select: { id: true, title: true, scheduledAt: true } },
    },
  });
}

export async function getMeetingOptions(): Promise<MeetingOption[]> {
  return prisma.meeting.findMany({
    orderBy: { scheduledAt: "desc" },
    select: { id: true, title: true, scheduledAt: true },
  });
}