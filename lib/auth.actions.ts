"use server";

import prisma from "@/lib/prisma";
import { signOut } from "@/lib/auth";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Resend } from "resend";
import { redirect } from "next/navigation";
import { requireRole, canManage } from "@/lib/auth.utils";

const resend = new Resend(process.env.RESEND_API_KEY);
const hashToken = (t: string) =>
  crypto.createHash("sha256").update(t).digest("hex");

export async function logout() {
  await signOut({ redirectTo: "/login" });
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  if (!user.passwordHash) return { error: "No password set on this account." };

  const match = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!match) return { error: "Current password is incorrect." };

  const hash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: hash, mustResetPassword: false },
  });

  return { success: true };
}

export async function triggerPasswordReset(targetUserId: string) {
  const actor = await requireRole("ADMIN", "SUPER_ADMIN");

  const target = await prisma.user.findUniqueOrThrow({
    where: { id: targetUserId },
  });

  if (!canManage(actor.role, target.role)) {
    return { error: "You do not have permission to reset this account." };
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = hashToken(rawToken);
  const expiry = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: targetUserId },
    data: { resetToken: hashedToken, resetTokenExpiry: expiry },
  });

  const resetUrl = `${process.env.AUTH_URL}/auth/set-password?token=${rawToken}`;

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: target.email,
    subject: "Reset your Akubueze password",
    html: `
      <p>Hi ${target.fullName},</p>
      <p>A password reset was requested for your Akubueze account.</p>
      <p><a href="${resetUrl}">Click here to set a new password</a></p>
      <p>This link expires in 1 hour.</p>
      <p>If you did not request this, you can ignore this email.</p>
      <p>— Akubueze Management System</p>
    `,
  });

  return { success: true };
}

export async function consumeResetToken(rawToken: string, newPassword: string) {
  const hashedToken = hashToken(rawToken);

  const user = await prisma.user.findFirst({
    where: {
      resetToken: hashedToken,
      resetTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) return { error: "Reset link is invalid or has expired." };

  const hash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: hash,
      mustResetPassword: false,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  redirect("/login?reset=success");
}

export async function createMemberAccount(data: {
  fullName: string;
  email: string;
  role: "MEMBER" | "ADMIN";
  phone?: string;
}) {
  await requireRole("ADMIN", "SUPER_ADMIN");

  const tempPassword = crypto
    .randomBytes(9)
    .toString("base64url")
    .slice(0, 12);
  const hash = await bcrypt.hash(tempPassword, 12);

  const user = await prisma.user.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      passwordHash: hash,
      role: data.role,
      mustResetPassword: true,
    },
  });

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: user.email,
    subject: "Your Akubueze account is ready",
    html: `
      <p>Hi ${user.fullName},</p>
      <p>Your Akubueze Age Grade Association account has been created.</p>
      <p><strong>Email:</strong> ${user.email}<br/>
         <strong>Password:</strong> ${tempPassword}</p>
      <p>Log in at: <a href="${process.env.AUTH_URL}/login">${process.env.AUTH_URL}/login</a></p>
      <p>You will be asked to set a new password on first login.</p>
      <p>— Akubueze Management System</p>
    `,
  });

  return { success: true, userId: user.id };
}
