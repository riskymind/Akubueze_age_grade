"use server"

import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { Resend } from "resend"
import { revalidatePath } from "next/cache"
import { requireRole } from "@/lib/auth.utils"
import { canManage } from "@/lib/permissions"
import { z } from "zod"
import { createMemberSchema, updateMemberSchema } from "./members.schemas"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function createMember(formData: unknown) {
  const actor = await requireRole("ADMIN", "SUPER_ADMIN")

  const parsed = createMemberSchema.safeParse(formData)
  if (!parsed.success) return { error: z.flattenError(parsed.error).fieldErrors }

  const { fullName, email, phone, role, gender, occupation, address } =
    parsed.data

  if (role === "ADMIN" && actor.role !== "SUPER_ADMIN") {
    return { error: { role: ["Only a Super Admin can assign the Admin role."] } }
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing)
    return { error: { email: ["A member with this email already exists."] } }

  const tempPassword = crypto.randomBytes(9).toString("base64url").slice(0, 12)
  const passwordHash = await bcrypt.hash(tempPassword, 12)

  const member = await prisma.user.create({
    data: {
      fullName,
      email,
      phone: phone || null,
      gender: gender ?? null,
      occupation: occupation || null,
      address: address || null,
      passwordHash,
      role,
      status: "ACTIVE",
      mustResetPassword: true,
      createdById: actor.id,
    },
  })

  let emailWarning: string | undefined
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: member.email,
      subject: "Your Akubueze account is ready",
      html: `
        <p>Hi ${member.fullName},</p>
        <p>Your Akubueze account has been created.</p>
        <p><strong>Email:</strong> ${member.email}<br/>
           <strong>Temporary password:</strong> ${tempPassword}</p>
        <p>Log in at: <a href="${process.env.AUTH_URL}/login">${process.env.AUTH_URL}/login</a></p>
        <p>You will be prompted to set a new password on first login.</p>
      `,
    })
  } catch {
    emailWarning =
      "Member created but credentials email failed to send. Reset their password manually."
  }

  revalidatePath("/admin/members")
  return { success: true, memberId: member.id, emailWarning }
}

export async function updateMember(memberId: string, formData: unknown) {
  const actor = await requireRole("ADMIN", "SUPER_ADMIN")

  const target = await prisma.user.findUniqueOrThrow({ where: { id: memberId } })
  if (!canManage(actor.role, target.role)) {
    return { error: { _form: ["You do not have permission to edit this member."] } }
  }

  const parsed = updateMemberSchema.safeParse(formData)
  if (!parsed.success) return { error: z.flattenError(parsed.error).fieldErrors }

  const data = parsed.data

  if (data.role && data.role !== "MEMBER" && actor.role !== "SUPER_ADMIN") {
    return { error: { role: ["Only a Super Admin can assign elevated roles."] } }
  }

  await prisma.user.update({
    where: { id: memberId },
    data: {
      ...(data.fullName && { fullName: data.fullName }),
      phone: data.phone || null,
      gender: data.gender ?? undefined,
      occupation: data.occupation || null,
      address: data.address || null,
      ...(data.role && { role: data.role }),
    },
  })

  revalidatePath("/admin/members")
  revalidatePath(`/admin/members/${memberId}`)
  return { success: true }
}

export async function suspendMember(memberId: string) {
  const actor = await requireRole("ADMIN", "SUPER_ADMIN")
  const target = await prisma.user.findUniqueOrThrow({ where: { id: memberId } })

  if (!canManage(actor.role, target.role)) {
    return { error: "You do not have permission to suspend this member." }
  }
  if (target.status === "SUSPENDED") {
    return { error: "Member is already suspended." }
  }

  await prisma.user.update({
    where: { id: memberId },
    data: { status: "SUSPENDED" },
  })

  revalidatePath("/admin/members")
  revalidatePath(`/admin/members/${memberId}`)
  return { success: true }
}

export async function reactivateMember(memberId: string) {
  const actor = await requireRole("ADMIN", "SUPER_ADMIN")
  const target = await prisma.user.findUniqueOrThrow({ where: { id: memberId } })

  if (!canManage(actor.role, target.role)) {
    return { error: "You do not have permission to reactivate this member." }
  }

  await prisma.user.update({
    where: { id: memberId },
    data: { status: "ACTIVE" },
  })

  revalidatePath("/admin/members")
  revalidatePath(`/admin/members/${memberId}`)
  return { success: true }
}

import { triggerPasswordReset as _triggerPasswordReset } from "@/lib/auth.actions"

export async function triggerPasswordReset(userId: string) {
  return _triggerPasswordReset(userId)
}
