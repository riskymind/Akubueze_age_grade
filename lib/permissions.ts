import { Role } from "@/lib/generated/prisma/enums"

export const ROLE_RANK: Record<Role, number> = {
  MEMBER: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
}

export const canManage = (actor: Role, target: Role) =>
  ROLE_RANK[actor] > ROLE_RANK[target]
