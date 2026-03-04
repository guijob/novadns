"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { getMonitorDetail } from "@/lib/monitoring-actions"
import type { MonitorCheck } from "@/lib/schema"

const chartConfig = {
  responseTime: {
    label: "Response time",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

const STATUS_COLORS = {
  up: "#22c55e",
  down: "#ef4444",
  degraded: "#eab308",
  pending: "#a1a1aa",
}

interface Props {
  monitorId: number
  hostname: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UptimeChart({ monitorId, hostname, open, onOpenChange }: Props) {
  const [checks, setChecks] = useState<MonitorCheck[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (open) {
      setLoading(true)
      getMonitorDetail(monitorId).then(detail => {
        if (detail) setChecks(detail.checks)
        setLoading(false)
      })
    }
  }, [open, monitorId])

  const chartData = checks
    .slice()
    .reverse()
    .map(c => ({
      time: new Date(c.checkedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      responseTime: c.responseTime ?? 0,
      status: c.status,
      fill: STATUS_COLORS[c.status as keyof typeof STATUS_COLORS] ?? STATUS_COLORS.pending,
    }))

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{hostname}</SheetTitle>
          <SheetDescription>Response times and check results</SheetDescription>
        </SheetHeader>
        <div className="px-6 space-y-4">
          {/* Status heatmap */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Recent checks</p>
            <div className="flex gap-0.5 flex-wrap">
              {checks.slice().reverse().map((c, i) => (
                <div
                  key={i}
                  className="size-3 rounded-sm"
                  style={{ backgroundColor: STATUS_COLORS[c.status as keyof typeof STATUS_COLORS] ?? STATUS_COLORS.pending }}
                  title={`${c.status} — ${new Date(c.checkedAt).toLocaleString()}${c.responseTime ? ` — ${c.responseTime}ms` : ""}${c.error ? ` — ${c.error}` : ""}`}
                />
              ))}
              {checks.length === 0 && !loading && (
                <p className="text-xs text-muted-foreground">No checks recorded yet</p>
              )}
            </div>
          </div>

          {/* Response time chart */}
          {chartData.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Response time (ms)</p>
              <ChartContainer config={chartConfig} className="h-[180px] w-full">
                <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="time"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10 }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="responseTime" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </div>
          )}

          {/* Recent check details */}
          {checks.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Latest checks</p>
              <div className="border border-border divide-y divide-border max-h-[200px] overflow-y-auto">
                {checks.slice(0, 20).map((c, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 text-xs">
                    <span
                      className="size-2 rounded-full shrink-0"
                      style={{ backgroundColor: STATUS_COLORS[c.status as keyof typeof STATUS_COLORS] }}
                    />
                    <span className="text-muted-foreground tabular-nums">
                      {new Date(c.checkedAt).toLocaleTimeString()}
                    </span>
                    {c.responseTime !== null && (
                      <span className="tabular-nums">{c.responseTime}ms</span>
                    )}
                    {c.statusCode && (
                      <span className="text-muted-foreground">{c.statusCode}</span>
                    )}
                    {c.error && (
                      <span className="text-destructive truncate">{c.error}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">Loading check history…</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
