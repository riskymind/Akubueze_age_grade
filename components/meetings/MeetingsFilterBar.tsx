"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { LayoutList, CalendarDays } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Status" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const TYPE_OPTIONS = [
  { value: "ALL", label: "All Types" },
  { value: "GENERAL", label: "General" },
  { value: "EXECUTIVE", label: "Executive" },
  { value: "EMERGENCY", label: "Emergency" },
  { value: "ANNUAL", label: "Annual" },
];

export function MeetingsFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isCalendar = searchParams.get("view") === "calendar";
  const ignoreNextRef = useRef(false);

  function buildUrl(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === "ALL") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    router.replace(buildUrl({ status: e.target.value }));
  }

  function handleTypeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    router.replace(buildUrl({ type: e.target.value }));
  }

  function setView(view: "list" | "calendar") {
    router.replace(buildUrl({ view: view === "calendar" ? "calendar" : "" }));
  }

  useEffect(() => {
    return () => {
      ignoreNextRef.current = true;
    };
  }, []);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      {/* View toggle */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-md">
        <button
          onClick={() => setView("list")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded transition-colors ${
            !isCalendar
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <LayoutList className="size-4" />
          List View
        </button>
        <button
          onClick={() => setView("calendar")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded transition-colors ${
            isCalendar
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <CalendarDays className="size-4" />
          Calendar View
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 ml-auto">
        <select
          value={searchParams.get("type") ?? "ALL"}
          onChange={handleTypeChange}
          className="px-3 py-2 text-sm bg-card border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={searchParams.get("status") ?? "ALL"}
          onChange={handleStatusChange}
          className="px-3 py-2 text-sm bg-card border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
