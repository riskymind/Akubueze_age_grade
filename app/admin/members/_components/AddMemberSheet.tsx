"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { UserPlus, Loader2 } from "lucide-react"
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
import { createMember } from "@/lib/members/members.actions"
import { createMemberSchema, type CreateMemberInput } from "@/lib/members/members.schemas"
import type { Role } from "@/lib/generated/prisma/enums"

type Props = {
  actorRole: Role
}

export function AddMemberSheet({ actorRole }: Props) {
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateMemberInput>({
    resolver: zodResolver(createMemberSchema),
    defaultValues: { role: "MEMBER" },
  })

  const onSubmit = async (data: CreateMemberInput) => {
    const result = await createMember(data)

    if (result.error && typeof result.error === "object") {
      const fieldErrors = result.error as Record<string, string[]>
      for (const [field, msgs] of Object.entries(fieldErrors)) {
        if (field === "_form") {
          toast.error(msgs[0])
        } else {
          setError(field as keyof CreateMemberInput, { message: msgs[0] })
        }
      }
      return
    }

    if (result.emailWarning) {
      toast.warning(result.emailWarning)
    } else {
      toast.success("Member account created. Credentials sent by email.")
    }

    reset()
    setOpen(false)
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <UserPlus className="size-4" />
        Add Member
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add New Member</SheetTitle>
            <SheetDescription>
              Create an account and send login credentials by email.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 px-4 flex-1">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input id="fullName" {...register("fullName")} />
              {errors.fullName && (
                <p className="text-xs text-destructive">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" {...register("phone")} />
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone.message}</p>
              )}
            </div>

            {actorRole === "SUPER_ADMIN" && (
              <div className="space-y-1.5">
                <Label>Role *</Label>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MEMBER">Member</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.role && (
                  <p className="text-xs text-destructive">{errors.role.message}</p>
                )}
              </div>
            )}

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
              <Label htmlFor="occupation">Occupation</Label>
              <Input id="occupation" {...register("occupation")} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" {...register("address")} rows={3} />
            </div>

            <SheetFooter className="px-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                Create Member
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  )
}
