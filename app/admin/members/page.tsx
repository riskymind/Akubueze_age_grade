import { Suspense } from "react"
import { requireRole } from "@/lib/auth.utils"
import { auth } from "@/lib/auth"
import { getMembers } from "@/lib/members/members.queries"
import prisma from "@/lib/prisma"
import { MemberStatus, Role } from "@/lib/generated/prisma/enums"
import { MembersTable } from "./_components/MembersTable"
import { MembersFilters } from "./_components/MembersFilters"
import { AddMemberSheet } from "./_components/AddMemberSheet"

export const dynamic = "force-dynamic"

type SearchParams = {
  search?: string
  status?: string
  role?: string
  gender?: string
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
  color?: "green" | "red" | "gray"
}) {
  const colorClass =
    color === "green"
      ? "text-green-600 dark:text-green-400"
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

export default async function AdminMembersPage({ searchParams }: PageProps) {
  await requireRole("ADMIN", "SUPER_ADMIN")
  const session = await auth()
  const actorRole = session!.user.role as Role

  const sp = await searchParams

  const { members, total, totalPages, page } = await getMembers({
    search: sp.search,
    status: sp.status as MemberStatus | undefined,
    role: sp.role as Role | undefined,
    gender: sp.gender,
    page: Number(sp.page) || 1,
  })

  const [activeCount, suspendedCount, inactiveCount] = await Promise.all([
    prisma.user.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { status: "SUSPENDED" } }),
    prisma.user.count({ where: { status: "INACTIVE" } }),
  ])

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Members</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {total} total member{total !== 1 ? "s" : ""}
          </p>
        </div>
        <AddMemberSheet actorRole={actorRole} />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total" value={total} />
        <StatCard label="Active" value={activeCount} color="green" />
        <StatCard label="Suspended" value={suspendedCount} color="red" />
        <StatCard label="Inactive" value={inactiveCount} color="gray" />
      </div>

      {/* Filters */}
      <Suspense>
        <MembersFilters />
      </Suspense>

      {/* Table */}
      <MembersTable
        members={members}
        actorRole={actorRole}
        totalPages={totalPages}
        currentPage={page}
      />
    </div>
  )
}
