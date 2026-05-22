"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
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
import { updateMember } from "@/lib/members/members.actions"
import { updateMemberSchema, type UpdateMemberInput } from "@/lib/members/members.schemas"
import type { MemberListItem } from "@/lib/members/members.queries"
import type { Role } from "@/lib/generated/prisma/enums"

type Props = {
  member: MemberListItem
  actorRole: Role
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditMemberSheet({ member, actorRole, open, onOpenChange }: Props) {
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UpdateMemberInput>({
    resolver: zodResolver(updateMemberSchema),
    defaultValues: {
      fullName: member.fullName,
      phone: member.phone ?? "",
      gender: (member.gender as UpdateMemberInput["gender"]) ?? undefined,
      occupation: member.occupation ?? "",
      address: "",
      role: member.role,
    },
  })

  const onSubmit = async (data: UpdateMemberInput) => {
    const result = await updateMember(member.id, data)

    if (result.error && typeof result.error === "object") {
      const fieldErrors = result.error as Record<string, string[]>
      for (const [field, msgs] of Object.entries(fieldErrors)) {
        if (field === "_form") {
          toast.error(msgs[0])
        } else {
          setError(field as keyof UpdateMemberInput, { message: msgs[0] })
        }
      }
      return
    }

    toast.success("Member profile updated.")
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Member</SheetTitle>
          <SheetDescription>
            Update profile details for {member.fullName}.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 px-4 flex-1">
          {/* Read-only email */}
          <div className="space-y-1.5">
            <Label>Email</Label>
            <p className="text-sm text-muted-foreground py-1.5 px-2.5 rounded-lg border border-border bg-muted/30">
              {member.email}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-fullName">Full Name</Label>
            <Input id="edit-fullName" {...register("fullName")} />
            {errors.fullName && (
              <p className="text-xs text-destructive">{errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-phone">Phone</Label>
            <Input id="edit-phone" type="tel" {...register("phone")} />
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Gender</Label>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-occupation">Occupation</Label>
            <Input id="edit-occupation" {...register("occupation")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-address">Address</Label>
            <Textarea id="edit-address" {...register("address")} rows={3} />
          </div>

          {actorRole === "SUPER_ADMIN" && (
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MEMBER">Member</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && (
                <p className="text-xs text-destructive">{errors.role.message}</p>
              )}
            </div>
          )}

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
