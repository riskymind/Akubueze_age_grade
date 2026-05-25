"use client"

import { useState } from "react"
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table"
import { useRouter } from "next/navigation"
import { CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getMeetingsColumns } from "./MeetingsTableColumns"
import { EditMeetingSheet } from "./EditMeetingSheet"
import { CancelMeetingDialog } from "./CancelMeetingDialog"
import type { MeetingListItem, ActiveMember } from "@/lib/meetings/meetings.queries"

type Props = {
  meetings: MeetingListItem[]
  activeMembers: ActiveMember[]
  totalPages: number
  currentPage: number
}

export function MeetingsTable({
  meetings,
  activeMembers,
  totalPages,
  currentPage,
}: Props) {
  const router = useRouter()

  const [editMeeting, setEditMeeting] = useState<MeetingListItem | null>(null)
  const [cancelMeeting, setCancelMeeting] = useState<MeetingListItem | null>(null)

  const columns = getMeetingsColumns(setEditMeeting, setCancelMeeting)

  const table = useReactTable({
    data: meetings,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const navigatePage = (page: number) => {
    const params = new URLSearchParams(window.location.search)
    params.set("page", String(page))
    router.push(`?${params.toString()}`)
  }

  if (meetings.length === 0) {
    return (
      <div className="rounded-xl border bg-card">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CalendarDays className="size-10 text-muted-foreground/40 mb-3" />
          <p className="font-medium text-foreground">No meetings found</p>
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
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
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
                  router.push(`/meetings/${row.original.id}`)
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
      {editMeeting && (
        <EditMeetingSheet
          meeting={editMeeting}
          activeMembers={activeMembers}
          open={!!editMeeting}
          onOpenChange={(open) => !open && setEditMeeting(null)}
        />
      )}

      {/* Cancel Dialog */}
      {cancelMeeting && (
        <CancelMeetingDialog
          meetingId={cancelMeeting.id}
          meetingTitle={cancelMeeting.title}
          open={!!cancelMeeting}
          onOpenChange={(open) => !open && setCancelMeeting(null)}
        />
      )}
    </>
  )
}
