import prisma from "@/lib/prisma"
import { Gender, MemberStatus, Role } from "@/lib/generated/prisma/enums"

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
  profileImageUrl: string | null
}

export type MemberFilters = {
  search?: string
  status?: MemberStatus
  role?: Role
  gender?: string
  page?: number
  pageSize?: number
}

export async function getMembers(filters: MemberFilters = {}) {
  const { search, status, role, gender, page = 1, pageSize = 20 } = filters
  const skip = (page - 1) * pageSize

  const where = {
    ...(search && {
      OR: [
        { fullName: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
        { phone: { contains: search, mode: "insensitive" as const } },
        { occupation: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    ...(status && { status }),
    ...(role && { role }),
    ...(gender && { gender: gender as Gender }),
  }

  const [rawMembers, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { dateJoined: "desc" },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        gender: true,
        role: true,
        status: true,
        occupation: true,
        dateJoined: true,
        profileImageUrl: true,
      },
    }),
    prisma.user.count({ where }),
  ])
  const members = rawMembers as unknown as MemberListItem[]

  return {
    members,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

export async function getMemberById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      attendances: {
        include: {
          meeting: {
            select: {
              id: true,
              title: true,
              type: true,
              scheduledAt: true,
            },
          },
        },
        orderBy: { markedAt: "desc" },
      },
      payments: {
        orderBy: { createdAt: "desc" },
      },
      createdBy: { select: { id: true, fullName: true } },
    },
  })
}

export async function getMemberStats(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { dateJoined: true },
  })

  const [totalMeetings, attended, paidDues, pendingDues] = await Promise.all([
    prisma.meeting.count({
      where: {
        status: "COMPLETED",
        scheduledAt: { gte: user.dateJoined },
      },
    }),
    prisma.attendance.count({
      where: { userId, status: { in: ["PRESENT", "EXCUSED"] } },
    }),
    prisma.payment.count({
      where: {
        userId,
        type: { in: ["MEETING_DUES", "MEETING_HOST_FEE"] },
        status: "PAID",
      },
    }),
    prisma.payment.count({
      where: {
        userId,
        type: { in: ["MEETING_DUES", "MEETING_HOST_FEE"] },
        status: "PENDING",
      },
    }),
  ])

  const attendanceRate =
    totalMeetings > 0 ? Math.round((attended / totalMeetings) * 100) : 0

  return { totalMeetings, attended, attendanceRate, paidDues, pendingDues }
}

export type MemberDetail = NonNullable<Awaited<ReturnType<typeof getMemberById>>>
