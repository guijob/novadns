import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-4 w-52 mt-1.5" />
      </div>

      {/* Stats */}
      <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4 border border-border">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-background px-5 py-4">
            <Skeleton className="h-3 w-20 mb-3" />
            <Skeleton className="h-8 w-10" />
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-24" />
      </div>

      {/* Filter chips */}
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-14 rounded" />
        ))}
      </div>

      {/* Table */}
      <div className="border border-border">
        <div className="border-b border-border px-4 py-3 flex gap-8">
          {["w-32", "w-16", "w-24", "w-20", "w-10", "w-20"].map((w, i) => (
            <Skeleton key={i} className={`h-4 ${w}`} />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border-b border-border last:border-0 px-4 py-3.5 flex gap-8 items-center">
            <div className="space-y-1.5 w-32">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}
