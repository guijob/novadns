import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-3 pointer-events-none">
      <Skeleton className="h-3 w-20" />
      <div className="border border-destructive/30 divide-y divide-border">
        <div className="grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-3">
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-56" />
          </div>
          <Skeleton className="h-8 w-20 shrink-0" />
        </div>
      </div>
    </div>
  )
}
