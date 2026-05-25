"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { MoreHorizontal, Eye, Pencil, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MeetingTypeBadge } from "./MeetingTypeBadge"
import { MeetingStatusBadge } from "./MeetingStatusBadge"
import type { MeetingListItem } from "@/lib/meetings/meetings.queries"

type RowActionsProps = {
  meeting: MeetingListItem
  onEdit: (meeting: MeetingListItem) => void
  onCancel: (meeting: MeetingListItem) => void
}

function RowActions({ meeting, onEdit, onCancel }: RowActionsProps) {
  const router = useRouter()
  const canModify =
    meeting.status !== "CANCELLED" && meeting.status !== "COMPLETED"

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
            router.push(`/meetings/${meeting.id}`)
          }}
        >
          <Eye className="size-4" />
          View Details
        </DropdownMenuItem>
        {canModify && (
          <>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onEdit(meeting)
              }}
            >
              <Pencil className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation()
                onCancel(meeting)
              }}
            >
              <XCircle className="size-4" />
              Cancel
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function getMeetingsColumns(
  onEdit: (meeting: MeetingListItem) => void,
  onCancel: (meeting: MeetingListItem) => void
): ColumnDef<MeetingListItem>[] {
  return [
    {
      accessorKey: "title",
      header: "Meeting",
      cell: ({ row }) => {
        const m = row.original
        return (
          <div className="min-w-0">
            <p className="font-medium truncate">{m.title}</p>
            {m.host && (
              <p className="text-xs text-muted-foreground truncate">
                Host: {m.host.fullName}
              </p>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => <MeetingTypeBadge type={row.original.type} />,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <MeetingStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "scheduledAt",
      header: "Scheduled",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {format(new Date(row.original.scheduledAt), "MMM d, yyyy 'at' h:mm a")}
        </span>
      ),
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.location ?? "—"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <RowActions
            meeting={row.original}
            onEdit={onEdit}
            onCancel={onCancel}
          />
        </div>
      ),
    },
  ]
}
