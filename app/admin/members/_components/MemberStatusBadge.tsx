import { Badge } from "@/components/ui/badge"
import { MemberStatus } from "@/lib/generated/prisma/enums"
import { cn } from "@/lib/utils"

const statusConfig: Record<MemberStatus, { label: string; className: string }> = {
  ACTIVE: {
    label: "Active",
    className: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  },
  SUSPENDED: {
    label: "Suspended",
    className: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  },
  INACTIVE: {
    label: "Inactive",
    className: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
  },
}

export function MemberStatusBadge({ status }: { status: MemberStatus }) {
  const config = statusConfig[status]
  return (
    <Badge variant="outline" className={cn("font-normal", config.className)}>
      {config.label}
    </Badge>
  )
}
