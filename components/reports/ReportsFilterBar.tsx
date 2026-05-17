"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Timeframe } from "@/lib/reports-data";

const TIMEFRAME_OPTIONS: { value: Timeframe; label: string }[] = [
  { value: "THIS_MONTH", label: "This Month" },
  { value: "LAST_MONTH", label: "Last Month" },
  { value: "THIS_YEAR", label: "This Year" },
  { value: "ALL_TIME", label: "All Time" },
];

export function ReportsFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentTimeframe =
    (searchParams.get("timeframe") as Timeframe) ?? "THIS_MONTH";

  function handleTimeframeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("timeframe", e.target.value);
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground font-medium">
          Report Type
        </label>
        <select
          className="px-3 py-2 text-sm bg-card border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          defaultValue="OVERVIEW"
        >
          <option value="OVERVIEW">Overview</option>
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground font-medium">
          Timeframe
        </label>
        <select
          value={currentTimeframe}
          onChange={handleTimeframeChange}
          className="px-3 py-2 text-sm bg-card border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {TIMEFRAME_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
