import { MeetingType } from "@/lib/generated/prisma/enums"

const TYPE_LABELS: Record<MeetingType, string> = {
  GENERAL: "General",
  EXECUTIVE: "Executive",
  EMERGENCY: "Emergency",
  ANNUAL: "Annual",
}

const TYPE_COLORS: Record<MeetingType, string> = {
  GENERAL: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  EXECUTIVE:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  EMERGENCY: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  ANNUAL:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
}

export function MeetingTypeBadge({ type }: { type: MeetingType }) {
  return (
    <span
      className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[type]}`}
    >
      {TYPE_LABELS[type]}
    </span>
  )
}
