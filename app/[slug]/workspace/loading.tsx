import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-3 pointer-events-none">
      <Skeleton className="h-3 w-24" />
      <div className="border border-border divide-y divide-border">
        <div className="grid grid-cols-[140px_1fr] items-center gap-4 px-4 py-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-7 w-full max-w-xs" />
        </div>
        <div className="flex items-center justify-end px-4 py-3 bg-muted/20">
          <Skeleton className="h-7 w-16" />
        </div>
      </div>
    </div>
  )
}
