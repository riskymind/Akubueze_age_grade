import { z } from "zod"

export const createMemberSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Must be a valid email address"),
  phone: z.string().min(7, "Phone number too short").optional().or(z.literal("")),
  role: z.enum(["MEMBER", "ADMIN"]),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  occupation: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
})

export const updateMemberSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().min(7).optional().or(z.literal("")),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  occupation: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  role: z.enum(["MEMBER", "ADMIN", "SUPER_ADMIN"]).optional(),
})

export type CreateMemberInput = z.infer<typeof createMemberSchema>
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>
