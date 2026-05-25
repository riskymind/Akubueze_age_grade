import { notFound } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import {
  ChevronRight,
  Calendar,
  MapPin,
  User,
  FileText,
  ExternalLink,
} from "lucide-react"
import { getCurrentUser } from "@/lib/dashboard-data"
import { getMeetingById } from "@/lib/meetings/meetings.queries"
import { MeetingTypeBadge } from "@/app/admin/meetings/_components/MeetingTypeBadge"
import { MeetingStatusBadge } from "@/app/admin/meetings/_components/MeetingStatusBadge"
import { AttendanceSection } from "./_components/AttendanceSection"

export const dynamic = "force-dynamic"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function MeetingDetailPage({ params }: PageProps) {
  const user = await getCurrentUser()
  const { id } = await params
  const meeting = await getMeetingById(id)

  if (!meeting) notFound()

  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN"

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/meetings" className="hover:text-foreground transition-colors">
          Meetings
        </Link>
        <ChevronRight className="size-4" />
        <span className="text-foreground">{meeting.title}</span>
      </nav>

      {/* Header card */}
      <div className="rounded-xl border bg-card p-6 ring-1 ring-foreground/10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <MeetingTypeBadge type={meeting.type} />
              <MeetingStatusBadge status={meeting.status} />
            </div>
            <h2 className="text-xl font-semibold">{meeting.title}</h2>

            <div className="space-y-1 text-sm text-muted-foreground">
              <p className="flex items-center gap-1.5">
                <Calendar className="size-3.5 shrink-0" />
                {format(new Date(meeting.scheduledAt), "EEEE, MMMM d, yyyy 'at' h:mm a")}
              </p>
              {meeting.location && (
                <p className="flex items-center gap-1.5">
                  <MapPin className="size-3.5 shrink-0" />
                  {meeting.location}
                </p>
              )}
              {meeting.host && (
                <p className="flex items-center gap-1.5">
                  <User className="size-3.5 shrink-0" />
                  Host: {meeting.host.fullName}
                </p>
              )}
            </div>
          </div>

          {isAdmin && (
            <Link
              href={`/admin/meetings`}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
            >
              Manage Meetings →
            </Link>
          )}
        </div>

        {/* Agenda */}
        {meeting.agenda && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Agenda
            </p>
            <p className="text-sm whitespace-pre-wrap">{meeting.agenda}</p>
          </div>
        )}

        {/* Notes */}
        {meeting.notes && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Notes
            </p>
            <p className="text-sm whitespace-pre-wrap text-muted-foreground">
              {meeting.notes}
            </p>
          </div>
        )}
      </div>

      {/* Meeting Minutes */}
      <div className="rounded-xl border bg-card p-6 ring-1 ring-foreground/10">
        <h3 className="font-semibold mb-3">Meeting Minutes</h3>
        {meeting.minutesUrl ? (
          <a
            href={meeting.minutesUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <FileText className="size-4" />
            View Minutes
            <ExternalLink className="size-3" />
          </a>
        ) : (
          <p className="text-sm text-muted-foreground">
            No minutes uploaded yet.
          </p>
        )}
      </div>

      {/* Attendance */}
      <AttendanceSection
        meetingId={meeting.id}
        attendances={meeting.attendances}
        canEdit={isAdmin}
      />
    </div>
  )
}
