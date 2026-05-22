"use client"

import { useState } from "react"
import { EditMemberSheet } from "./EditMemberSheet"
import { SuspendMemberDialog } from "./SuspendMemberDialog"
import { ResetPasswordButton } from "./ResetPasswordButton"
import type { MemberListItem } from "@/lib/members/members.queries"
import type { Role, MemberStatus } from "@/lib/generated/prisma/enums"

type Props = {
  member: MemberListItem
  actorRole: Role
}

export function MemberActions({ member, actorRole }: Props) {
  const [editOpen, setEditOpen] = useState(false)
  const [suspendOpen, setSuspendOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setEditOpen(true)}
        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-input bg-transparent px-2.5 text-sm font-medium transition-colors hover:bg-muted"
      >
        Edit
      </button>

      <ResetPasswordButton
        memberId={member.id}
        memberName={member.fullName}
      />

      <button
        onClick={() => setSuspendOpen(true)}
        className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-sm font-medium transition-colors ${
          member.status === "SUSPENDED"
            ? "border-input bg-transparent hover:bg-muted"
            : "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20"
        }`}
      >
        {member.status === "SUSPENDED" ? "Reactivate" : "Suspend"}
      </button>

      <EditMemberSheet
        member={member}
        actorRole={actorRole}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <SuspendMemberDialog
        memberId={member.id}
        memberName={member.fullName}
        currentStatus={member.status}
        open={suspendOpen}
        onOpenChange={setSuspendOpen}
      />
    </>
  )
}
