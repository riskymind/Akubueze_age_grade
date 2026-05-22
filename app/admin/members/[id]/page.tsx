import { notFound } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { ChevronRight, Mail, Phone, Briefcase, MapPin } from "lucide-react"
import { requireRole, canManage } from "@/lib/auth.utils"
import { auth } from "@/lib/auth"
import { getMemberById, getMemberStats } from "@/lib/members/members.queries"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Role } from "@/lib/generated/prisma/enums"
import { MemberStatusBadge } from "../_components/MemberStatusBadge"
import { MemberRoleBadge } from "../_components/MemberRoleBadge"
import { MemberActions } from "../_components/MemberActions"
import { MemberAttendanceCard } from "../_components/MemberAttendanceCard"
import { MemberPaymentsCard } from "../_components/MemberPaymentsCard"
import { type MemberListItem } from "@/lib/members/members.queries"

export const dynamic = "force-dynamic"

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("")
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string
  value: string | number
  color?: "green" | "amber"
}) {
  const colorClass =
    color === "green"
      ? "text-green-600 dark:text-green-400"
      : color === "amber"
      ? "text-amber-600 dark:text-amber-400"
      : "text-foreground"

  return (
    <div className="rounded-xl border bg-card p-4 ring-1 ring-foreground/10">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-2xl font-semibold ${colorClass}`}>{value}</p>
    </div>
  )
}

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function MemberDetailPage({ params }: PageProps) {
  await requireRole("ADMIN", "SUPER_ADMIN")
  const session = await auth()
  const actorRole = session!.user.role as Role

  const { id } = await params
  const [member, stats] = await Promise.all([
    getMemberById(id),
    getMemberStats(id),
  ])

  if (!member) notFound()

  const canAct = canManage(actorRole, member.role)
  const initials = getInitials(member.fullName)

  const memberAsListItem: MemberListItem = {
    id: member.id,
    fullName: member.fullName,
    email: member.email,
    phone: member.phone,
    gender: member.gender,
    role: member.role,
    status: member.status,
    occupation: member.occupation,
    dateJoined: member.dateJoined,
    profileImageUrl: member.profileImageUrl,
  }

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link
          href="/admin/members"
          className="hover:text-foreground transition-colors"
        >
          Members
        </Link>
        <ChevronRight className="size-4" />
        <span className="text-foreground">{member.fullName}</span>
      </nav>

      {/* Profile header */}
      <div className="rounded-xl border bg-card p-6 ring-1 ring-foreground/10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <Avatar className="size-16 text-xl">
              <AvatarImage src={member.profileImageUrl ?? undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1.5">
              <h2 className="text-xl font-semibold">{member.fullName}</h2>
              <div className="flex flex-wrap gap-2">
                <MemberRoleBadge role={member.role} />
                <MemberStatusBadge status={member.status} />
              </div>
              <div className="space-y-0.5 mt-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Mail className="size-3.5" />
                  {member.email}
                </p>
                {member.phone && (
                  <p className="text-sm flex items-center gap-1.5">
                    <Phone className="size-3.5 text-muted-foreground" />
                    {member.phone}
                  </p>
                )}
                {member.occupation && (
                  <p className="text-sm flex items-center gap-1.5">
                    <Briefcase className="size-3.5 text-muted-foreground" />
                    {member.occupation}
                  </p>
                )}
                {member.address && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="size-3.5" />
                    {member.address}
                  </p>
                )}
                <p className="text-xs text-muted-foreground pt-0.5">
                  Joined{" "}
                  {formatDistanceToNow(member.dateJoined, { addSuffix: true })}
                </p>
              </div>
            </div>
          </div>

          {canAct && (
            <div className="flex flex-wrap gap-2">
              <MemberActions member={memberAsListItem} actorRole={actorRole} />
            </div>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Attendance Rate" value={`${stats.attendanceRate}%`} />
        <StatCard
          label="Meetings Attended"
          value={`${stats.attended} / ${stats.totalMeetings}`}
        />
        <StatCard label="Dues Paid" value={stats.paidDues} color="green" />
        <StatCard
          label="Dues Pending"
          value={stats.pendingDues}
          color={stats.pendingDues > 0 ? "amber" : undefined}
        />
      </div>

      {/* History cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <MemberAttendanceCard attendances={member.attendances} />
        <MemberPaymentsCard payments={member.payments} />
      </div>
    </div>
  )
}
