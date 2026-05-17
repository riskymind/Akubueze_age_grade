import prisma from "@/lib/prisma";
import { MeetingStatus, MeetingType } from "@/lib/generated/prisma/client";

export type MeetingRow = {
  id: string;
  title: string;
  type: MeetingType;
  status: MeetingStatus;
  scheduledAt: Date;
  location: string | null;
};

export async function getMeetings(
  status?: string,
  type?: string
): Promise<MeetingRow[]> {
  return prisma.meeting.findMany({
    where: {
      ...(status && status !== "ALL"
        ? { status: status as MeetingStatus }
        : {}),
      ...(type && type !== "ALL" ? { type: type as MeetingType } : {}),
    },
    orderBy: { scheduledAt: "desc" },
    select: {
      id: true,
      title: true,
      type: true,
      status: true,
      scheduledAt: true,
      location: true,
    },
  });
}
