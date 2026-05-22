"use client"

import { ColumnDef } from "@tanstack/react-table"
import { formatDistanceToNow } from "date-fns"
import { MoreHorizontal, Eye, Pencil, KeyRound, ShieldOff, ShieldCheck } from "lucide-react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MemberStatusBadge } from "./MemberStatusBadge"
import { MemberRoleBadge } from "./MemberRoleBadge"
import type { MemberListItem } from "@/lib/members/members.queries"
import type { Role } from "@/lib/generated/prisma/enums"
import { canManage } from "@/lib/permissions"

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("")
}

type RowActionsProps = {
  member: MemberListItem
  actorRole: Role
  onEdit: (member: MemberListItem) => void
  onSuspend: (member: MemberListItem) => void
  onReset: (member: MemberListItem) => void
}

function RowActions({ member, actorRole, onEdit, onSuspend, onReset }: RowActionsProps) {
  const router = useRouter()
  const canAct = canManage(actorRole, member.role)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => e.stopPropagation()}
          />
        }
      >
        <MoreHorizontal className="size-4" />
        <span className="sr-only">Row actions</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation()
            router.push(`/admin/members/${member.id}`)
          }}
        >
          <Eye className="size-4" />
          View Profile
        </DropdownMenuItem>
        {canAct && (
          <>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onEdit(member)
              }}
            >
              <Pencil className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onReset(member)
              }}
            >
              <KeyRound className="size-4" />
              Reset Password
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {member.status === "ACTIVE" ? (
              <DropdownMenuItem
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  onSuspend(member)
                }}
              >
                <ShieldOff className="size-4" />
                Suspend
              </DropdownMenuItem>
            ) : member.status === "SUSPENDED" ? (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onSuspend(member)
                }}
              >
                <ShieldCheck className="size-4" />
                Reactivate
              </DropdownMenuItem>
            ) : null}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function getMembersColumns(
  actorRole: Role,
  onEdit: (member: MemberListItem) => void,
  onSuspend: (member: MemberListItem) => void,
  onReset: (member: MemberListItem) => void
): ColumnDef<MemberListItem>[] {
  return [
    {
      accessorKey: "fullName",
      header: "Member",
      cell: ({ row }) => {
        const m = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-8">
              <AvatarFallback className="text-xs">
                {getInitials(m.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-medium truncate">{m.fullName}</p>
              <p className="text-xs text-muted-foreground truncate">{m.email}</p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.phone ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => <MemberRoleBadge role={row.original.role} />,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <MemberStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "dateJoined",
      header: "Joined",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs">
          {formatDistanceToNow(row.original.dateJoined, { addSuffix: true })}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <RowActions
            member={row.original}
            actorRole={actorRole}
            onEdit={onEdit}
            onSuspend={onSuspend}
            onReset={onReset}
          />
        </div>
      ),
    },
  ]
}
