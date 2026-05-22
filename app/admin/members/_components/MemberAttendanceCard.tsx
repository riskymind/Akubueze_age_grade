import { formatDistanceToNow, format } from "date-fns"
import { CheckCircle2, XCircle, MinusCircle, CalendarDays } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MemberRoleBadge } from "./MemberRoleBadge"
import type { MemberDetail } from "@/lib/members/members.queries"

type Attendance = MemberDetail["attendances"][number]

const meetingTypeLabel: Record<string, string> = {
  GENERAL: "General",
  EXECUTIVE: "Executive",
  EMERGENCY: "Emergency",
  ANNUAL: "Annual",
}

function AttendanceRow({ a }: { a: Attendance }) {
  const icon =
    a.status === "PRESENT" ? (
      <CheckCircle2 className="size-4 text-green-500 shrink-0" />
    ) : a.status === "EXCUSED" ? (
      <MinusCircle className="size-4 text-amber-500 shrink-0" />
    ) : (
      <XCircle className="size-4 text-red-500 shrink-0" />
    )

  return (
    <div className="flex items-start gap-3 py-2.5 border-b last:border-0">
      {icon}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">{a.meeting.title}</span>
          <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
            {meetingTypeLabel[a.meeting.type] ?? a.meeting.type}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {format(a.meeting.scheduledAt, "d MMM yyyy")} ·{" "}
          {formatDistanceToNow(a.meeting.scheduledAt, { addSuffix: true })}
        </p>
        {a.remarks && (
          <p className="text-xs text-muted-foreground italic mt-0.5">
            {a.remarks}
          </p>
        )}
      </div>
      <span
        className={`text-xs font-medium shrink-0 ${
          a.status === "PRESENT"
            ? "text-green-600 dark:text-green-400"
            : a.status === "EXCUSED"
            ? "text-amber-600 dark:text-amber-400"
            : "text-red-600 dark:text-red-400"
        }`}
      >
        {a.status}
      </span>
    </div>
  )
}

type Props = {
  attendances: MemberDetail["attendances"]
}

export function MemberAttendanceCard({ attendances }: Props) {
  const shown = attendances.slice(0, 10)
  const hasMore = attendances.length > 10

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="size-4" />
          Attendance History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {shown.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No attendance records.
          </p>
        ) : (
          <>
            <div>
              {shown.map((a) => (
                <AttendanceRow key={a.id} a={a} />
              ))}
            </div>
            {hasMore && (
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Showing 10 of {attendances.length} records
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
