import { Badge } from "@/components/ui/badge"
import { Role } from "@/lib/generated/prisma/enums"
import { cn } from "@/lib/utils"

const roleConfig: Record<Role, { label: string; className: string }> = {
  SUPER_ADMIN: {
    label: "Super Admin",
    className: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
  },
  ADMIN: {
    label: "Admin",
    className: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  },
  MEMBER: {
    label: "Member",
    className: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
  },
}

export function MemberRoleBadge({ role }: { role: Role }) {
  const config = roleConfig[role]
  return (
    <Badge variant="outline" className={cn("font-normal", config.className)}>
      {config.label}
    </Badge>
  )
}
