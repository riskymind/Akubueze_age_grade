import { Skeleton } from "@/components/ui/skeleton"

export default function MembersLoading() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-4 w-36" />
        </div>
        <Skeleton className="h-8 w-32" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-4 ring-1 ring-foreground/10 space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-7 w-10" />
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 flex-1 max-w-xs" />
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-8 w-24" />
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="border-b px-4 py-3 flex gap-4">
          {["w-48", "w-28", "w-20", "w-20", "w-24"].map((w, i) => (
            <Skeleton key={i} className={`h-4 ${w}`} />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="border-b last:border-0 px-4 py-4 flex items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="size-8 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-44" />
              </div>
            </div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-6 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}
