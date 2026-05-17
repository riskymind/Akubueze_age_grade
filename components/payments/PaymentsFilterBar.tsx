"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

const TYPE_OPTIONS = [
  { value: "ALL", label: "All Payments" },
  { value: "MEETING_HOST_FEE", label: "Meeting Host Fee" },
  { value: "MEETING_DUES", label: "Meeting Dues" },
  { value: "DEVELOPMENT_LEVY", label: "Development Levy" },
  { value: "EVENT_CONTRIBUTION", label: "Event Contribution" },
  { value: "FINE", label: "Fine" },
  { value: "DONATION", label: "Donation" },
];

export function PaymentsFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

  function handleTypeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    router.replace(buildUrl({ type: e.target.value }));
  }

  return (
    <div className="flex items-center gap-2">
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
    </div>
  );
}
