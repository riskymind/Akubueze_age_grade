import { Suspense } from "react"
import { requireRole } from "@/lib/auth.utils"
import { getAdminMeetings, getMeetingStats, getActiveMembers } from "@/lib/meetings/meetings.queries"
import { MeetingStatus, MeetingType } from "@/lib/generated/prisma/enums"
import { MeetingsTable } from "./_components/MeetingsTable"
import { MeetingsFilters } from "./_components/MeetingsFilters"
import { AddMeetingSheet } from "./_components/AddMeetingSheet"

export const dynamic = "force-dynamic"

type SearchParams = {
  search?: string
  status?: string
  type?: string
  page?: string
}

type PageProps = {
  searchParams: Promise<SearchParams>
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color?: "green" | "blue" | "red" | "gray"
}) {
  const colorClass =
    color === "green"
      ? "text-green-600 dark:text-green-400"
      : color === "blue"
      ? "text-blue-600 dark:text-blue-400"
      : color === "red"
      ? "text-red-600 dark:text-red-400"
      : color === "gray"
      ? "text-muted-foreground"
      : "text-foreground"

  return (
    <div className="rounded-xl border bg-card p-4 ring-1 ring-foreground/10">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-2xl font-semibold ${colorClass}`}>{value}</p>
    </div>
  )
}

export default async function AdminMeetingsPage({ searchParams }: PageProps) {
  await requireRole("ADMIN", "SUPER_ADMIN")

  const sp = await searchParams

  const [{ meetings, total, totalPages, page }, stats, activeMembers] =
    await Promise.all([
      getAdminMeetings({
        search: sp.search,
        status: sp.status as MeetingStatus | undefined,
        type: sp.type as MeetingType | undefined,
        page: Number(sp.page) || 1,
      }),
      getMeetingStats(),
      getActiveMembers(),
    ])

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Meetings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {total} total meeting{total !== 1 ? "s" : ""}
          </p>
        </div>
        <AddMeetingSheet activeMembers={activeMembers} />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Scheduled" value={stats.scheduled} color="green" />
        <StatCard label="Completed" value={stats.completed} color="blue" />
        <StatCard label="Cancelled" value={stats.cancelled} color="red" />
      </div>

      {/* Filters */}
      <Suspense>
        <MeetingsFilters />
      </Suspense>

      {/* Table */}
      <MeetingsTable
        meetings={meetings}
        activeMembers={activeMembers}
        totalPages={totalPages}
        currentPage={page}
      />
    </div>
  )
}
