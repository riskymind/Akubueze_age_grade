"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Loader2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { cancelMeeting } from "@/lib/meetings/meetings.actions"

type Props = {
  meetingId: string
  meetingTitle: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CancelMeetingDialog({
  meetingId,
  meetingTitle,
  open,
  onOpenChange,
}: Props) {
  const [pending, setPending] = useState(false)

  const handleConfirm = async () => {
    setPending(true)
    try {
      const result = await cancelMeeting(meetingId)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success("Meeting cancelled.")
      onOpenChange(false)
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setPending(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel this meeting?</AlertDialogTitle>
          <AlertDialogDescription>
            Cancelling <strong>{meetingTitle}</strong> is permanent and cannot
            be undone. Members will no longer see it as an upcoming meeting.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Keep</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={pending}
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            <XCircle className="size-4" />
            Cancel Meeting
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
