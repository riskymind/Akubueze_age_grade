"use client"

import { formatDistanceToNow, format } from "date-fns"
import { CreditCard } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import type { MemberDetail } from "@/lib/members/members.queries"

type Payment = MemberDetail["payments"][number]

const MEETING_DUES_TYPES = ["MEETING_DUES", "MEETING_HOST_FEE"] as const

const typeLabel: Record<string, string> = {
  MEETING_DUES: "Meeting Dues",
  MEETING_HOST_FEE: "Meeting Host Fee",
  DEVELOPMENT_LEVY: "Development Levy",
  EVENT_CONTRIBUTION: "Event Contribution",
  FINE: "Fine",
  DONATION: "Donation",
}

function formatAmount(amount: number) {
  return `₦${amount.toLocaleString("en-NG")}`
}

function PaymentRow({ p }: { p: Payment }) {
  const isPaid = p.status === "PAID"
  const isWaived = p.status === "WAIVED"

  return (
    <div className="flex items-start gap-3 py-2.5 border-b last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {p.description ?? typeLabel[p.type] ?? p.type}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {format(p.createdAt, "d MMM yyyy")} ·{" "}
          {formatDistanceToNow(p.createdAt, { addSuffix: true })}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p
          className={`text-sm font-medium ${
            isWaived ? "line-through text-muted-foreground" : ""
          }`}
        >
          {formatAmount(p.amount)}
        </p>
        <span
          className={`text-xs font-medium ${
            isPaid
              ? "text-green-600 dark:text-green-400"
              : isWaived
              ? "text-muted-foreground"
              : "text-amber-600 dark:text-amber-400"
          }`}
        >
          {p.status}
        </span>
      </div>
    </div>
  )
}

function PaymentList({ payments }: { payments: Payment[] }) {
  const shown = payments.slice(0, 10)
  const hasMore = payments.length > 10

  if (shown.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No payments found.
      </p>
    )
  }

  return (
    <>
      <div>
        {shown.map((p) => (
          <PaymentRow key={p.id} p={p} />
        ))}
      </div>
      {hasMore && (
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Showing 10 of {payments.length} payments
        </p>
      )}
    </>
  )
}

type Props = {
  payments: MemberDetail["payments"]
}

export function MemberPaymentsCard({ payments }: Props) {
  const meetingDues = payments.filter((p) =>
    (MEETING_DUES_TYPES as readonly string[]).includes(p.type)
  )
  const otherPayments = payments.filter(
    (p) => !(MEETING_DUES_TYPES as readonly string[]).includes(p.type)
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="size-4" />
          Payment History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="dues">
          <TabsList className="mb-4">
            <TabsTrigger value="dues">
              Meeting Dues ({meetingDues.length})
            </TabsTrigger>
            <TabsTrigger value="other">
              Other ({otherPayments.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="dues">
            <PaymentList payments={meetingDues} />
          </TabsContent>
          <TabsContent value="other">
            <PaymentList payments={otherPayments} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
