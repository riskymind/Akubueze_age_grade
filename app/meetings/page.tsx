import { Suspense } from "react";
import { Calendar, MapPin, Pencil, XCircle, Eye } from "lucide-react";
import { getCurrentUser } from "@/lib/dashboard-data";
import { getMeetings } from "@/lib/meetings-data";
import { MeetingsFilterBar } from "@/components/meetings/MeetingsFilterBar";
import { MeetingType, MeetingStatus } from "@/lib/generated/prisma/client";

export const dynamic = "force-dynamic";

function formatDateTime(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }) + " at " + date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

const TYPE_LABELS: Record<MeetingType, string> = {
  GENERAL: "General",
  EXECUTIVE: "Executive",
  EMERGENCY: "Emergency",
  ANNUAL: "Annual",
};

const STATUS_LABELS: Record<MeetingStatus, string> = {
  SCHEDULED: "Scheduled",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

function TypeBadge({ type }: { type: MeetingType }) {
  const colors: Record<MeetingType, string> = {
    GENERAL: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    EXECUTIVE: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    EMERGENCY: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    ANNUAL: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[type]}`}>
      {TYPE_LABELS[type]}
    </span>
  );
}

function StatusBadge({ status }: { status: MeetingStatus }) {
  const colors: Record<MeetingStatus, string> = {
    SCHEDULED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    IN_PROGRESS: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    COMPLETED: "bg-muted text-muted-foreground",
    CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

interface PageProps {
  searchParams: Promise<{ status?: string; type?: string; view?: string }>;
}

export default async function MeetingsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const user = await getCurrentUser();
  const isAdmin = user.role === "SUPER_ADMIN" || user.role === "ADMIN";
  const isCalendar = resolvedParams.view === "calendar";

  const meetings = await getMeetings(resolvedParams.status, resolvedParams.type);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Meetings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage association meetings
        </p>
      </div>

      {/* View toggle + Filters */}
      <Suspense>
        <MeetingsFilterBar />
      </Suspense>

      {/* Content */}
      {isCalendar ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center text-sm text-muted-foreground">
          Calendar view coming soon.
        </div>
      ) : (
        <div className="space-y-3">
          {meetings.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-8 text-center text-sm text-muted-foreground">
              No meetings found.
            </div>
          ) : (
            meetings.map((meeting) => (
              <div
                key={meeting.id}
                className="bg-card border border-border rounded-lg p-5 hover:border-border/80 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: title + meta */}
                  <div className="space-y-1.5 min-w-0">
                    <p className="font-semibold text-foreground text-base leading-snug">
                      {meeting.title}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="size-3.5 shrink-0" />
                        {formatDateTime(meeting.scheduledAt)}
                      </span>
                      {meeting.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="size-3.5 shrink-0" />
                          {meeting.location}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: badges */}
                  <div className="flex items-center gap-2 shrink-0">
                    <TypeBadge type={meeting.type} />
                    <StatusBadge status={meeting.status} />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border rounded-md text-foreground hover:bg-muted transition-colors">
                    <Eye className="size-3.5" />
                    View Details
                  </button>
                  {isAdmin && meeting.status !== "COMPLETED" && meeting.status !== "CANCELLED" && (
                    <>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border rounded-md text-foreground hover:bg-muted transition-colors">
                        <Pencil className="size-3.5" />
                        Edit
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-red-200 dark:border-red-900/50 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <XCircle className="size-3.5" />
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
