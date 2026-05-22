"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Loader2, ShieldOff, ShieldCheck } from "lucide-react"
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
import { suspendMember, reactivateMember } from "@/lib/members/members.actions"
import type { MemberStatus } from "@/lib/generated/prisma/enums"

type Props = {
  memberId: string
  memberName: string
  currentStatus: MemberStatus
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SuspendMemberDialog({
  memberId,
  memberName,
  currentStatus,
  open,
  onOpenChange,
}: Props) {
  const [pending, setPending] = useState(false)
  const isSuspended = currentStatus === "SUSPENDED"

  const handleConfirm = async () => {
    setPending(true)
    try {
      const result = isSuspended
        ? await reactivateMember(memberId)
        : await suspendMember(memberId)

      if (result.error) {
        toast.error(typeof result.error === "string" ? result.error : "Something went wrong.")
        return
      }

      toast.success(isSuspended ? "Member reactivated." : "Member suspended.")
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
          <AlertDialogTitle>
            {isSuspended ? "Reactivate this member?" : "Suspend this member?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isSuspended
              ? `Reactivating ${memberName} will restore their access to the platform. They will be able to log in immediately.`
              : `Suspending ${memberName} will immediately block them from logging in. They will see a suspension notice page until reactivated. This does not delete any of their records.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <Button
            variant={isSuspended ? "default" : "destructive"}
            onClick={handleConfirm}
            disabled={pending}
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            {isSuspended ? (
              <>
                <ShieldCheck className="size-4" />
                Reactivate
              </>
            ) : (
              <>
                <ShieldOff className="size-4" />
                Suspend
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
