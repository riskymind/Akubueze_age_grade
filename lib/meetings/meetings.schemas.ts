import { z } from "zod"

export const createMeetingSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  type: z.enum(["GENERAL", "EXECUTIVE", "EMERGENCY", "ANNUAL"]),
  scheduledAt: z.string().min(1, "Scheduled date is required"),
  location: z.string().optional().or(z.literal("")),
  agenda: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  hostId: z.string().optional().or(z.literal("")),
})

export const updateMeetingSchema = createMeetingSchema

export const markAttendanceSchema = z.object({
  attendances: z.array(
    z.object({
      userId: z.string(),
      status: z.enum(["PRESENT", "ABSENT", "EXCUSED"]),
      remarks: z.string().optional().or(z.literal("")),
    })
  ),
})

export type CreateMeetingInput = z.infer<typeof createMeetingSchema>
export type UpdateMeetingInput = z.infer<typeof updateMeetingSchema>
export type MarkAttendanceInput = z.infer<typeof markAttendanceSchema>
