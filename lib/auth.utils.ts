import { auth } from "@/lib/auth";
import { Role } from "@/lib/generated/prisma/enums";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
}

export async function requireRole(...roles: Role[]) {
  const user = await getCurrentUser();
  if (!roles.includes(user.role)) redirect("/unauthorized");
  return user;
}

export const ROLE_RANK: Record<Role, number> = {
  MEMBER: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
};

export const canManage = (actor: Role, target: Role) =>
  ROLE_RANK[actor] > ROLE_RANK[target];
