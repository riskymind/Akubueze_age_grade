import { auth } from "@/lib/auth";
import { Role } from "@/lib/generated/prisma/enums";
import { redirect } from "next/navigation";
export { ROLE_RANK, canManage } from "@/lib/permissions";

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
