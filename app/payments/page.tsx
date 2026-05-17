import { Suspense } from "react";
import { TrendingUp, AlertCircle, ReceiptText, FileText } from "lucide-react";
import { getCurrentUser } from "@/lib/dashboard-data";
import { getPayments, getPaymentStats } from "@/lib/payments-data";
import { PaymentsFilterBar } from "@/components/payments/PaymentsFilterBar";
import { PaymentType, PaymentStatus } from "@/lib/generated/prisma/client";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<PaymentType, string> = {
  MEETING_HOST_FEE: "Meeting Host Fee",
  MEETING_DUES: "Meeting Dues",
  DEVELOPMENT_LEVY: "Development Levy",
  EVENT_CONTRIBUTION: "Event Contribution",
  FINE: "Fine",
  DONATION: "Donation",
};

function formatAmount(amount: number) {
  return "₦" + amount.toLocaleString("en-NG");
}

function formatDate(date: Date | null) {
  if (!date) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: PaymentStatus }) {
  if (status === "PAID") {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-medium">
        Paid
      </span>
    );
  }
  if (status === "PENDING") {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-medium">
        Pending
      </span>
    );
  }
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
      Waived
    </span>
  );
}

interface PageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function PaymentsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const user = await getCurrentUser();
  const isAdmin = user.role === "SUPER_ADMIN" || user.role === "ADMIN";

  const [payments, stats] = await Promise.all([
    getPayments(user.id, isAdmin, resolvedParams.type),
    getPaymentStats(user.id, isAdmin),
  ]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Payments</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage member payments and dues
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Collected</p>
            <p className="text-2xl font-semibold text-foreground mt-1">
              {formatAmount(stats.totalCollected)}
            </p>
          </div>
          <div className="size-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
            <TrendingUp className="size-5 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Outstanding Dues</p>
            <p className="text-2xl font-semibold text-foreground mt-1">
              {formatAmount(stats.outstandingDues)}
            </p>
          </div>
          <div className="size-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
            <AlertCircle className="size-5 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Fines This Month</p>
            <p className="text-2xl font-semibold text-foreground mt-1">
              {formatAmount(stats.finesThisMonth)}
            </p>
          </div>
          <div className="size-10 rounded-full bg-muted flex items-center justify-center shrink-0">
            <ReceiptText className="size-5 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Filter */}
      <Suspense>
        <PaymentsFilterBar />
      </Suspense>

      {/* Payments Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {payments.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No payments found.
          </div>
        ) : (
          <>
            {/* Mobile: card list */}
            <ul className="md:hidden divide-y divide-border">
              {payments.map((payment) => (
                <li key={payment.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-foreground">
                        {payment.user.fullName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {TYPE_LABELS[payment.type]}
                      </p>
                    </div>
                    <StatusBadge status={payment.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {formatAmount(payment.amount)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(payment.paidAt ?? payment.createdAt)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            {/* Desktop: table */}
            <table className="hidden md:table w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-left">
                  <th className="px-4 py-3 font-medium">Member Name</th>
                  <th className="px-4 py-3 font-medium">Payment Type</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium text-center">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      {payment.user.fullName}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {TYPE_LABELS[payment.type]}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {formatAmount(payment.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={payment.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(payment.paidAt ?? payment.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {payment.receiptUrl ? (
                        <a
                          href={payment.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          title="View receipt"
                        >
                          <FileText className="size-4" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
