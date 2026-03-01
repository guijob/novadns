import { Skeleton } from "@/components/ui/skeleton"

export default function WebhooksLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-4 w-72 mt-1.5" />
      </div>

      {/* Stats */}
      <div className="grid gap-px bg-border sm:grid-cols-2 border border-border">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-background px-5 py-4">
            <Skeleton className="h-3 w-24 mb-3" />
            <Skeleton className="h-8 w-10" />
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-32" />
      </div>

      {/* Table */}
      <div className="border border-border">
        <div className="border-b border-border px-4 py-3 flex gap-8">
          {["w-48", "w-32", "w-12", "w-20"].map((w, i) => (
            <Skeleton key={i} className={`h-4 ${w}`} />
          ))}
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border-b border-border last:border-0 px-4 py-3.5 flex gap-8 items-center">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}
