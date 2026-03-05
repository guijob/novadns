import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-3 pointer-events-none">
      <Skeleton className="h-3 w-16" />
      <div className="border border-border divide-y divide-border">
        {/* Current plan row */}
        <div className="flex items-center justify-between px-4 py-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
        {/* Tier rows */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-6">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-7 w-20" />
            </div>
          </div>
        ))}
        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 bg-muted/20">
          <Skeleton className="h-3 w-48" />
          <Skeleton className="h-7 w-36" />
        </div>
      </div>
    </div>
  )
}
