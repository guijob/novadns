import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-3 pointer-events-none">
      <Skeleton className="h-3 w-36" />
      <div className="border border-border divide-y divide-border">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Skeleton className="size-5 rounded" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <Skeleton className="h-7 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}
