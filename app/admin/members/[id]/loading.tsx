import { Skeleton } from "@/components/ui/skeleton"

export default function MemberDetailLoading() {
  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-36" />
      </div>

      {/* Profile header */}
      <div className="rounded-xl border bg-card p-6 ring-1 ring-foreground/10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Skeleton className="size-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-4 ring-1 ring-foreground/10 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-16" />
          </div>
        ))}
      </div>

      {/* History cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-4 ring-1 ring-foreground/10 space-y-4">
            <Skeleton className="h-5 w-36" />
            {Array.from({ length: 5 }).map((_, j) => (
              <div key={j} className="flex items-center gap-3">
                <Skeleton className="size-4 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-full max-w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
