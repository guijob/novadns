import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-8 pointer-events-none">
      {/* Password */}
      <div className="space-y-3">
        <Skeleton className="h-3 w-20" />
        <div className="border border-border divide-y divide-border">
          <div className="grid grid-cols-[140px_1fr] items-center gap-4 px-4 py-3">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-7 w-full" />
          </div>
          <div className="grid grid-cols-[140px_1fr] items-center gap-4 px-4 py-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-full" />
          </div>
          <div className="flex justify-end px-4 py-3 bg-muted/20">
            <Skeleton className="h-7 w-28" />
          </div>
        </div>
      </div>

      {/* 2FA */}
      <div className="space-y-3">
        <Skeleton className="h-3 w-36" />
        <div className="border border-border divide-y divide-border">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-52" />
            </div>
          </div>
          <div className="px-4 py-3">
            <Skeleton className="h-7 w-36" />
          </div>
        </div>
      </div>
    </div>
  )
}
