"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Loader2, KeyRound } from "lucide-react"
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
import { triggerPasswordReset } from "@/lib/members/members.actions"

type ButtonProps = {
  memberId: string
  memberName: string
}

export function ResetPasswordButton({ memberId, memberName }: ButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <KeyRound className="size-4" />
        Reset Password
      </Button>
      <ResetPasswordDialog
        memberId={memberId}
        memberName={memberName}
        memberEmail=""
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}

type DialogProps = {
  memberId: string
  memberName: string
  memberEmail: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ResetPasswordDialog({
  memberId,
  memberName,
  open,
  onOpenChange,
}: DialogProps) {
  const [pending, setPending] = useState(false)

  const handleConfirm = async () => {
    setPending(true)
    try {
      const result = await triggerPasswordReset(memberId)

      if (result?.error) {
        toast.error(typeof result.error === "string" ? result.error : "Something went wrong.")
        return
      }

      toast.success(`Password reset email sent to ${memberName}.`)
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
          <AlertDialogTitle>Reset password?</AlertDialogTitle>
          <AlertDialogDescription>
            This will send {memberName} an email with a link to set a new
            password. The link expires in 1 hour.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <Button onClick={handleConfirm} disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            Send Reset Email
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
