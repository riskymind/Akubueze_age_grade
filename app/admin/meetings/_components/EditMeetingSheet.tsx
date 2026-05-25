"use client"

import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateMeeting } from "@/lib/meetings/meetings.actions"
import {
  updateMeetingSchema,
  type UpdateMeetingInput,
} from "@/lib/meetings/meetings.schemas"
import type { MeetingListItem, ActiveMember } from "@/lib/meetings/meetings.queries"

type Props = {
  meeting: MeetingListItem
  activeMembers: ActiveMember[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditMeetingSheet({
  meeting,
  activeMembers,
  open,
  onOpenChange,
}: Props) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UpdateMeetingInput>({
    resolver: zodResolver(updateMeetingSchema),
  })

  useEffect(() => {
    if (open) {
      reset({
        title: meeting.title,
        type: meeting.type,
        scheduledAt: format(new Date(meeting.scheduledAt), "yyyy-MM-dd'T'HH:mm"),
        location: meeting.location ?? "",
        hostId: meeting.hostId ?? "",
        agenda: meeting.agenda ?? "",
        notes: meeting.notes ?? "",
      })
    }
  }, [open, meeting, reset])

  const onSubmit = async (data: UpdateMeetingInput) => {
    const result = await updateMeeting(meeting.id, data)

    if (result.error && typeof result.error === "object") {
      const fieldErrors = result.error as Record<string, string[]>
      for (const [field, msgs] of Object.entries(fieldErrors)) {
        if (field === "_form") {
          toast.error(msgs[0])
        } else {
          setError(field as keyof UpdateMeetingInput, { message: msgs[0] })
        }
      }
      return
    }

    toast.success("Meeting updated.")
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Meeting</SheetTitle>
          <SheetDescription>Update the details for this meeting.</SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 px-4 flex-1"
        >
          <div className="space-y-1.5">
            <Label htmlFor="edit-title">Title *</Label>
            <Input id="edit-title" {...register("title")} />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Type *</Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GENERAL">General</SelectItem>
                    <SelectItem value="EXECUTIVE">Executive</SelectItem>
                    <SelectItem value="EMERGENCY">Emergency</SelectItem>
                    <SelectItem value="ANNUAL">Annual</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && (
              <p className="text-xs text-destructive">{errors.type.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-scheduledAt">Date & Time *</Label>
            <Input
              id="edit-scheduledAt"
              type="datetime-local"
              {...register("scheduledAt")}
            />
            {errors.scheduledAt && (
              <p className="text-xs text-destructive">
                {errors.scheduledAt.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-location">Location</Label>
            <Input id="edit-location" {...register("location")} />
          </div>

          <div className="space-y-1.5">
            <Label>Host</Label>
            <Controller
              name="hostId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select host (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeMembers.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-agenda">Agenda</Label>
            <Textarea id="edit-agenda" {...register("agenda")} rows={4} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea id="edit-notes" {...register("notes")} rows={3} />
          </div>

          <SheetFooter className="px-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Save Changes
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
