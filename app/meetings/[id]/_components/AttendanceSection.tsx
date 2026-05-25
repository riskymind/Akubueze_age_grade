"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { markAttendance } from "@/lib/meetings/meetings.actions"
import type { MeetingDetail } from "@/lib/meetings/meetings.queries"
import type { AttendanceStatus } from "@/lib/generated/prisma/enums"

type AttendanceRow = MeetingDetail["attendances"][number]

const STATUS_LABELS: Record<AttendanceStatus, string> = {
  PRESENT: "Present",
  ABSENT: "Absent",
  EXCUSED: "Excused",
}

const STATUS_COLORS: Record<AttendanceStatus, string> = {
  PRESENT: "text-green-600 dark:text-green-400",
  ABSENT: "text-red-600 dark:text-red-400",
  EXCUSED: "text-amber-600 dark:text-amber-400",
}

type Props = {
  meetingId: string
  attendances: AttendanceRow[]
  canEdit: boolean
}

export function AttendanceSection({ meetingId, attendances, canEdit }: Props) {
  const [localAttendances, setLocalAttendances] = useState<
    Record<string, AttendanceStatus>
  >(Object.fromEntries(attendances.map((a) => [a.user.id, a.status])))

  const [pending, setPending] = useState(false)

  const handleStatusChange = (userId: string, status: AttendanceStatus) => {
    setLocalAttendances((prev) => ({ ...prev, [userId]: status }))
  }

  const handleSave = async () => {
    setPending(true)
    try {
      const data = {
        attendances: Object.entries(localAttendances).map(([userId, status]) => ({
          userId,
          status,
        })),
      }
      const result = await markAttendance(meetingId, data)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success("Attendance saved.")
    } catch {
      toast.error("Something went wrong.")
    } finally {
      setPending(false)
    }
  }

  if (attendances.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6 ring-1 ring-foreground/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Attendance</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          No attendance records yet.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card p-6 ring-1 ring-foreground/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">
          Attendance
          <span className="text-sm font-normal text-muted-foreground ml-2">
            ({attendances.filter((a) => localAttendances[a.user.id] === "PRESENT").length}/
            {attendances.length} present)
          </span>
        </h3>
        {canEdit && (
          <Button size="sm" onClick={handleSave} disabled={pending}>
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Save
          </Button>
        )}
      </div>

      <div className="divide-y divide-border">
        {attendances.map((a) => {
          const status = localAttendances[a.user.id] ?? a.status
          return (
            <div
              key={a.user.id}
              className="flex items-center justify-between py-2.5 gap-4"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{a.user.fullName}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {a.user.email}
                </p>
              </div>

              {canEdit ? (
                <Select
                  value={status}
                  onValueChange={(v) =>
                    handleStatusChange(a.user.id, v as AttendanceStatus)
                  }
                >
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRESENT">Present</SelectItem>
                    <SelectItem value="ABSENT">Absent</SelectItem>
                    <SelectItem value="EXCUSED">Excused</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <span
                  className={`text-xs font-medium ${STATUS_COLORS[status]}`}
                >
                  {STATUS_LABELS[status]}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
