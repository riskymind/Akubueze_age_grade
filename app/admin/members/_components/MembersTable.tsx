"use client"

import { useState } from "react"
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table"
import { useRouter } from "next/navigation"
import { Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getMembersColumns } from "./MembersTableColumns"
import { EditMemberSheet } from "./EditMemberSheet"
import { SuspendMemberDialog } from "./SuspendMemberDialog"
import { ResetPasswordDialog } from "./ResetPasswordButton"
import type { MemberListItem } from "@/lib/members/members.queries"
import type { Role } from "@/lib/generated/prisma/enums"

type Props = {
  members: MemberListItem[]
  actorRole: Role
  totalPages: number
  currentPage: number
}

export function MembersTable({ members, actorRole, totalPages, currentPage }: Props) {
  const router = useRouter()

  const [editMember, setEditMember] = useState<MemberListItem | null>(null)
  const [suspendMember, setSuspendMember] = useState<MemberListItem | null>(null)
  const [resetMember, setResetMember] = useState<MemberListItem | null>(null)

  const columns = getMembersColumns(
    actorRole,
    setEditMember,
    setSuspendMember,
    setResetMember
  )

  const table = useReactTable({
    data: members,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const navigatePage = (page: number) => {
    const params = new URLSearchParams(window.location.search)
    params.set("page", String(page))
    router.push(`?${params.toString()}`)
  }

  if (members.length === 0) {
    return (
      <div className="rounded-xl border bg-card">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="size-10 text-muted-foreground/40 mb-3" />
          <p className="font-medium text-foreground">No members found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your search or filters.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="hover:bg-transparent border-b">
                {hg.headers.map((header) => (
                  <TableHead key={header.id} className="px-4">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="cursor-pointer"
                onClick={() =>
                  router.push(`/admin/members/${row.original.id}`)
                }
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => navigatePage(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => navigatePage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Edit Sheet */}
      {editMember && (
        <EditMemberSheet
          member={editMember}
          actorRole={actorRole}
          open={!!editMember}
          onOpenChange={(open) => !open && setEditMember(null)}
        />
      )}

      {/* Suspend/Reactivate Dialog */}
      {suspendMember && (
        <SuspendMemberDialog
          memberId={suspendMember.id}
          memberName={suspendMember.fullName}
          currentStatus={suspendMember.status}
          open={!!suspendMember}
          onOpenChange={(open) => !open && setSuspendMember(null)}
        />
      )}

      {/* Reset Password Dialog */}
      {resetMember && (
        <ResetPasswordDialog
          memberId={resetMember.id}
          memberName={resetMember.fullName}
          memberEmail={resetMember.email}
          open={!!resetMember}
          onOpenChange={(open) => !open && setResetMember(null)}
        />
      )}
    </>
  )
}
