import { Skeleton } from "@/components/ui/skeleton"

function MemberRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Skeleton className="size-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <div className="space-y-8 pointer-events-none">
      <div className="space-y-3">
        <Skeleton className="h-3 w-16" />
        <div className="border border-border divide-y divide-border">
          {Array.from({ length: 3 }).map((_, i) => <MemberRow key={i} />)}
        </div>
      </div>
    </div>
  )
}
