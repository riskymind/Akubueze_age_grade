import { Suspense } from "react";
import { Download } from "lucide-react";
import { getCurrentUser } from "@/lib/dashboard-data";
import { getAttendance, getMeetingOptions } from "@/lib/attendance-data";
import { AttendanceFilterBar } from "@/components/attendance/AttendanceFilterBar";
import { AttendanceStatus } from "@/lib/generated/prisma/client";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: AttendanceStatus }) {
  if (status === "PRESENT") {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-medium">
        Present
      </span>
    );
  }
  if (status === "ABSENT") {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 font-medium">
        Absent
      </span>
    );
  }
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-medium">
      Excused
    </span>
  );
}

interface PageProps {
  searchParams: Promise<{
    search?: string;
    meeting?: string;
    status?: string;
  }>;
}

export default async function AttendancePage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const user = await getCurrentUser();
  const isAdmin = user.role === "SUPER_ADMIN" || user.role === "ADMIN";

  const [records, meetingOptions] = await Promise.all([
    getAttendance(
      user.id,
      isAdmin,
      resolvedParams.search,
      resolvedParams.meeting,
      resolvedParams.status
    ),
    getMeetingOptions(),
  ]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Attendance</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track member attendance across meetings
          </p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-md text-foreground hover:bg-muted transition-colors shrink-0">
          <Download className="size-4" />
          Export
        </button>
      </div>

      {/* Filter bar */}
      <Suspense>
        <AttendanceFilterBar meetings={meetingOptions} />
      </Suspense>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {records.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No attendance records found.
          </div>
        ) : (
          <>
            {/* Mobile: card list */}
            <ul className="md:hidden divide-y divide-border">
              {records.map((record) => (
                <li key={record.id} className="p-4 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-foreground">
                      {record.user.fullName}
                    </p>
                    <StatusBadge status={record.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {record.meeting.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(record.meeting.scheduledAt)}
                  </p>
                </li>
              ))}
            </ul>

            {/* Desktop: table */}
            <table className="hidden md:table w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-left">
                  <th className="px-4 py-3 font-medium">Member</th>
                  <th className="px-4 py-3 font-medium">Meeting</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      {record.user.fullName}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {record.meeting.title}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(record.meeting.scheduledAt)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={record.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
