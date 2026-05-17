import { Suspense } from "react";
import { Download, Users, TrendingUp, Banknote, AlertCircle } from "lucide-react";
import {
  getReportStats,
  getMembershipTrends,
  getDeltaLabel,
  type Timeframe,
} from "@/lib/reports-data";
import { ReportsFilterBar } from "@/components/reports/ReportsFilterBar";

export const dynamic = "force-dynamic";

function formatAmount(amount: number) {
  return "₦" + amount.toLocaleString("en-NG");
}

function DeltaBadge({
  delta,
  label,
  isAmount = false,
  isPercent = false,
  showDelta,
}: {
  delta: number;
  label: string;
  isAmount?: boolean;
  isPercent?: boolean;
  showDelta: boolean;
}) {
  if (!showDelta || !label) return null;

  const positive = delta >= 0;
  const sign = positive ? "+" : "";
  const formatted = isAmount
    ? `${sign}${formatAmount(Math.abs(delta))}${delta < 0 ? "" : ""}`
    : isPercent
    ? `${sign}${delta}%`
    : `${sign}${delta}`;

  const displayValue = isAmount
    ? `${delta >= 0 ? "+" : "-"}${formatAmount(Math.abs(delta))}`
    : formatted;

  return (
    <span
      className={`text-xs font-medium ${
        positive
          ? "text-green-600 dark:text-green-400"
          : "text-red-600 dark:text-red-400"
      }`}
    >
      {displayValue} {label}
    </span>
  );
}

interface PageProps {
  searchParams: Promise<{ timeframe?: string }>;
}

export default async function ReportsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const timeframe = (resolvedParams.timeframe as Timeframe) ?? "THIS_MONTH";
  const showDelta = timeframe !== "ALL_TIME";
  const deltaLabel = getDeltaLabel(timeframe);

  const [stats, trends] = await Promise.all([
    getReportStats(timeframe),
    getMembershipTrends(),
  ]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Comprehensive analytics and reporting
          </p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-md text-foreground hover:bg-muted transition-colors shrink-0">
          <Download className="size-4" />
          Export Report
        </button>
      </div>

      {/* Filter Bar */}
      <Suspense>
        <ReportsFilterBar />
      </Suspense>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Members */}
        <div className="bg-card border border-border rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total Members</p>
            <div className="size-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
              <Users className="size-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-3xl font-semibold text-foreground">
            {stats.totalMembers}
          </p>
          <DeltaBadge
            delta={stats.totalMembersDelta}
            label={deltaLabel}
            showDelta={showDelta}
          />
        </div>

        {/* Average Attendance */}
        <div className="bg-card border border-border rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Average Attendance</p>
            <div className="size-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
              <TrendingUp className="size-4 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-3xl font-semibold text-foreground">
            {stats.avgAttendance}%
          </p>
          <DeltaBadge
            delta={stats.avgAttendanceDelta}
            label={deltaLabel}
            isPercent
            showDelta={showDelta}
          />
        </div>

        {/* Total Dues Collected */}
        <div className="bg-card border border-border rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total Dues Collected</p>
            <div className="size-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
              <Banknote className="size-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-3xl font-semibold text-foreground">
            {formatAmount(stats.totalDuesCollected)}
          </p>
          <DeltaBadge
            delta={stats.totalDuesCollectedDelta}
            label={deltaLabel}
            isAmount
            showDelta={showDelta}
          />
        </div>

        {/* Outstanding Dues */}
        <div className="bg-card border border-border rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Outstanding Dues</p>
            <div className="size-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
              <AlertCircle className="size-4 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <p className="text-3xl font-semibold text-foreground">
            {formatAmount(stats.outstandingDues)}
          </p>
          <DeltaBadge
            delta={stats.outstandingDuesDelta}
            label={deltaLabel}
            isAmount
            showDelta={showDelta}
          />
        </div>
      </div>

      {/* Membership Trends Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Users className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">
            Membership Trends
          </h2>
        </div>

        {trends.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No membership data available.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-left">
                <th className="px-5 py-3 font-medium">Month</th>
                <th className="px-5 py-3 font-medium">New Members</th>
                <th className="px-5 py-3 font-medium">Active</th>
                <th className="px-5 py-3 font-medium">Inactive</th>
                <th className="px-5 py-3 font-medium">Suspended</th>
              </tr>
            </thead>
            <tbody>
              {trends.map((row) => (
                <tr
                  key={row.month}
                  className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                >
                  <td className="px-5 py-3 font-medium text-foreground">
                    {row.month}
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center justify-center min-w-7 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {row.newMembers}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center justify-center min-w-7 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      {row.active}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center justify-center min-w-7 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                      {row.inactive}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center justify-center min-w-7 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                      {row.suspended}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
