import prisma from "@/lib/prisma"
import { MeetingStatus, MeetingType, AttendanceStatus } from "@/lib/generated/prisma/enums"

const PAGE_SIZE = 20

export type MeetingListItem = {
  id: string
  title: string
  type: MeetingType
  status: MeetingStatus
  scheduledAt: Date
  location: string | null
  agenda: string | null
  notes: string | null
  hostId: string | null
  host: { id: string; fullName: string } | null
}

export type MeetingDetail = {
  id: string
  title: string
  type: MeetingType
  status: MeetingStatus
  scheduledAt: Date
  location: string | null
  agenda: string | null
  notes: string | null
  minutesUrl: string | null
  host: { id: string; fullName: string; email: string } | null
  attendances: {
    id: string
    status: AttendanceStatus
    remarks: string | null
    user: { id: string; fullName: string; email: string }
  }[]
}

export type ActiveMember = {
  id: string
  fullName: string
  email: string
}

export async function getAdminMeetings(params: {
  search?: string
  status?: string
  type?: string
  page?: number
}) {
  const { search, status, type, page = 1 } = params
  const skip = (page - 1) * PAGE_SIZE

  const where = {
    ...(search
      ? { title: { contains: search, mode: "insensitive" as const } }
      : {}),
    ...(status && status !== "ALL" ? { status: status as MeetingStatus } : {}),
    ...(type && type !== "ALL" ? { type: type as MeetingType } : {}),
  }

  const [meetings, total] = await Promise.all([
    prisma.meeting.findMany({
      where,
      skip,
      take: PAGE_SIZE,
      orderBy: { scheduledAt: "desc" },
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        scheduledAt: true,
        location: true,
        agenda: true,
        notes: true,
        hostId: true,
        host: { select: { id: true, fullName: true } },
      },
    }),
    prisma.meeting.count({ where }),
  ])

  return {
    meetings,
    total,
    page,
    totalPages: Math.ceil(total / PAGE_SIZE),
  }
}

export async function getMeetingStats() {
  const [total, scheduled, completed, cancelled] = await Promise.all([
    prisma.meeting.count(),
    prisma.meeting.count({ where: { status: "SCHEDULED" } }),
    prisma.meeting.count({ where: { status: "COMPLETED" } }),
    prisma.meeting.count({ where: { status: "CANCELLED" } }),
  ])
  return { total, scheduled, completed, cancelled }
}

export async function getMeetingById(id: string): Promise<MeetingDetail | null> {
  return prisma.meeting.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      type: true,
      status: true,
      scheduledAt: true,
      location: true,
      agenda: true,
      notes: true,
      minutesUrl: true,
      host: { select: { id: true, fullName: true, email: true } },
      attendances: {
        orderBy: { user: { fullName: "asc" } },
        select: {
          id: true,
          status: true,
          remarks: true,
          user: { select: { id: true, fullName: true, email: true } },
        },
      },
    },
  })
}

export async function getActiveMembers(): Promise<ActiveMember[]> {
  return prisma.user.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, fullName: true, email: true },
    orderBy: { fullName: "asc" },
  })
}
