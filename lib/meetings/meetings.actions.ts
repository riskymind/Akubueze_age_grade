"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { requireRole } from "@/lib/auth.utils"
import { z } from "zod"
import {
  createMeetingSchema,
  updateMeetingSchema,
  markAttendanceSchema,
} from "./meetings.schemas"

export async function createMeeting(formData: unknown) {
  await requireRole("ADMIN", "SUPER_ADMIN")

  const parsed = createMeetingSchema.safeParse(formData)
  if (!parsed.success) return { error: z.flattenError(parsed.error).fieldErrors }

  const { title, type, scheduledAt, location, agenda, notes, hostId } =
    parsed.data

  await prisma.meeting.create({
    data: {
      title,
      type,
      scheduledAt: new Date(scheduledAt),
      location: location || null,
      agenda: agenda || null,
      notes: notes || null,
      hostId: hostId || null,
    },
  })

  revalidatePath("/admin/meetings")
  revalidatePath("/meetings")
  return { success: true }
}

export async function updateMeeting(meetingId: string, formData: unknown) {
  await requireRole("ADMIN", "SUPER_ADMIN")

  const parsed = updateMeetingSchema.safeParse(formData)
  if (!parsed.success) return { error: z.flattenError(parsed.error).fieldErrors }

  const { title, type, scheduledAt, location, agenda, notes, hostId } =
    parsed.data

  await prisma.meeting.update({
    where: { id: meetingId },
    data: {
      title,
      type,
      scheduledAt: new Date(scheduledAt),
      location: location || null,
      agenda: agenda || null,
      notes: notes || null,
      hostId: hostId || null,
    },
  })

  revalidatePath("/admin/meetings")
  revalidatePath(`/meetings/${meetingId}`)
  revalidatePath("/meetings")
  return { success: true }
}

export async function cancelMeeting(meetingId: string) {
  await requireRole("ADMIN", "SUPER_ADMIN")

  const meeting = await prisma.meeting.findUniqueOrThrow({
    where: { id: meetingId },
  })

  if (meeting.status === "CANCELLED") {
    return { error: "Meeting is already cancelled." }
  }
  if (meeting.status === "COMPLETED") {
    return { error: "Completed meetings cannot be cancelled." }
  }

  await prisma.meeting.update({
    where: { id: meetingId },
    data: { status: "CANCELLED" },
  })

  revalidatePath("/admin/meetings")
  revalidatePath(`/meetings/${meetingId}`)
  revalidatePath("/meetings")
  return { success: true }
}

export async function markAttendance(meetingId: string, data: unknown) {
  await requireRole("ADMIN", "SUPER_ADMIN")

  const parsed = markAttendanceSchema.safeParse(data)
  if (!parsed.success) return { error: "Invalid attendance data." }

  await Promise.all(
    parsed.data.attendances.map(({ userId, status, remarks }) =>
      prisma.attendance.upsert({
        where: { userId_meetingId: { userId, meetingId } },
        update: { status, remarks: remarks || null },
        create: {
          userId,
          meetingId,
          status,
          remarks: remarks || null,
        },
      })
    )
  )

  revalidatePath(`/meetings/${meetingId}`)
  return { success: true }
}
