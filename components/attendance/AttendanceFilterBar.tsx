"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";

type MeetingOption = {
  id: string;
  title: string;
  scheduledAt: Date;
};

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Status" },
  { value: "PRESENT", label: "Present" },
  { value: "ABSENT", label: "Absent" },
  { value: "EXCUSED", label: "Excused" },
];

export function AttendanceFilterBar({
  meetings,
}: {
  meetings: MeetingOption[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function buildUrl(newSearch: string, newMeeting: string, newStatus: string) {
    const params = new URLSearchParams();
    if (newSearch) params.set("search", newSearch);
    if (newMeeting && newMeeting !== "ALL") params.set("meeting", newMeeting);
    if (newStatus && newStatus !== "ALL") params.set("status", newStatus);
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      router.replace(
        buildUrl(
          value,
          searchParams.get("meeting") ?? "ALL",
          searchParams.get("status") ?? "ALL"
        )
      );
    }, 300);
  }

  function handleMeetingChange(e: React.ChangeEvent<HTMLSelectElement>) {
    router.replace(
      buildUrl(search, e.target.value, searchParams.get("status") ?? "ALL")
    );
  }

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    router.replace(
      buildUrl(search, searchParams.get("meeting") ?? "ALL", e.target.value)
    );
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1 sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by member name or meeting..."
          className="w-full pl-9 pr-3 py-2 text-sm bg-card border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>
      <select
        value={searchParams.get("meeting") ?? "ALL"}
        onChange={handleMeetingChange}
        className="w-full sm:w-auto px-3 py-2 text-sm bg-card border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      >
        <option value="ALL">All Meetings</option>
        {meetings.map((m) => (
          <option key={m.id} value={m.id}>
            {m.title}
          </option>
        ))}
      </select>
      <select
        value={searchParams.get("status") ?? "ALL"}
        onChange={handleStatusChange}
        className="w-full sm:w-auto px-3 py-2 text-sm bg-card border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
