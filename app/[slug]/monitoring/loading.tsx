import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-6 pointer-events-none">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>

      {/* Stats cards */}
      <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4 border border-border">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-background px-5 py-4 space-y-3">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="border border-border p-4 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    </div>
  )
}
