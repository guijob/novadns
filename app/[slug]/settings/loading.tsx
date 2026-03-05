import { Skeleton } from "@/components/ui/skeleton"

function SettingBlock({ rows = 1 }: { rows?: number }) {
  return (
    <div className="space-y-3 pointer-events-none">
      <Skeleton className="h-3 w-20" />
      <div className="border border-border divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="grid grid-cols-[140px_1fr] items-center gap-4 px-4 py-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-full" />
          </div>
        ))}
        <div className="flex items-center justify-end px-4 py-3 bg-muted/20">
          <Skeleton className="h-7 w-20" />
        </div>
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <div className="space-y-8">
      {/* Avatar */}
      <div className="space-y-3 pointer-events-none">
        <Skeleton className="h-3 w-14" />
        <div className="border border-border px-4 py-4 flex items-center gap-5">
          <Skeleton className="size-16 rounded-full shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-7 w-28" />
          </div>
        </div>
      </div>
      <SettingBlock rows={1} />
      <SettingBlock rows={1} />
      <SettingBlock rows={1} />
    </div>
  )
}
