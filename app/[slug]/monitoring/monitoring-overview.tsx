"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Activity03Icon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  Timer01Icon,
  PlusSignIcon,
  Settings01Icon,
  ArrowUp01Icon,
  AlertDiamondIcon,
} from "@hugeicons/core-free-icons"
import { resolveAlert } from "@/lib/monitoring-actions"
import { MonitorConfigSheet } from "./monitor-config-sheet"
import { UpdateActivityChart } from "./update-activity-chart"
import { UptimeChart } from "./uptime-chart"
import type { Monitor, Host, Alert } from "@/lib/schema"
import type { MonitoringLimits } from "@/lib/plans"

interface MonitorWithHost extends Monitor {
  host: Host | null
}

interface Props {
  slug: string
  monitors: MonitorWithHost[]
  stats: {
    totalMonitors: number
    overallUptime: string
    activeAlerts: number
    avgResponseTime: number
  }
  activeAlerts: Alert[]
  staleHosts: Host[]
  updateActivity: { time: string; updates: number }[]
  plan: string
  limits: MonitoringLimits
  canManage: boolean
}

const STATUS_CONFIG = {
  up:       { label: "Up",       color: "bg-green-500",  textColor: "text-green-700 dark:text-green-400", bgColor: "bg-green-500/10" },
  down:     { label: "Down",     color: "bg-red-500",    textColor: "text-red-700 dark:text-red-400",     bgColor: "bg-red-500/10" },
  degraded: { label: "Degraded", color: "bg-yellow-500", textColor: "text-yellow-700 dark:text-yellow-400", bgColor: "bg-yellow-500/10" },
  pending:  { label: "Pending",  color: "bg-muted-foreground/30", textColor: "text-muted-foreground", bgColor: "bg-muted/50" },
} as const

function timeAgo(date: Date | string | null): string {
  if (!date) return "Never"
  const ms = Date.now() - new Date(date).getTime()
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

export function MonitoringOverview({
  slug,
  monitors: initialMonitors,
  stats,
  activeAlerts: initialAlerts,
  staleHosts,
  updateActivity,
  plan,
  limits,
  canManage,
}: Props) {
  const router = useRouter()
  const [monitors, setMonitors] = useState(initialMonitors)
  const [activeAlerts, setActiveAlerts] = useState(initialAlerts)
  const [addOpen, setAddOpen] = useState(false)
  const [editMonitor, setEditMonitor] = useState<MonitorWithHost | null>(null)
  const [detailMonitor, setDetailMonitor] = useState<MonitorWithHost | null>(null)

  // SSE for live updates
  useEffect(() => {
    const es = new EventSource(`/api/monitoring/stream?slug=${slug}`)
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        if (data.monitors) {
          // Merge with host data from initial load
          const hostMap = new Map(initialMonitors.map(m => [m.id, m.host]))
          setMonitors(data.monitors.map((m: Monitor) => ({
            ...m,
            host: hostMap.get(m.id) ?? null,
          })))
        }
      } catch {}
    }
    return () => es.close()
  }, [slug, initialMonitors])

  useEffect(() => { setMonitors(initialMonitors) }, [initialMonitors])
  useEffect(() => { setActiveAlerts(initialAlerts) }, [initialAlerts])

  async function handleResolve(alertId: number) {
    await resolveAlert(alertId)
    setActiveAlerts(prev => prev.filter(a => a.id !== alertId))
    router.refresh()
  }

  const base = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? "novaip.link"

  const statCards = [
    { label: "Monitors",       value: stats.totalMonitors, icon: Activity03Icon,        accent: false },
    { label: "Uptime",         value: `${stats.overallUptime}%`, icon: ArrowUp01Icon,    accent: true },
    { label: "Active alerts",  value: stats.activeAlerts,  icon: AlertCircleIcon,        accent: stats.activeAlerts > 0 },
    { label: "Avg response",   value: limits.activeProbing ? `${stats.avgResponseTime}ms` : "—", icon: Timer01Icon, accent: false },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Monitoring</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Uptime checks, alerts, and update activity</p>
        </div>
        {canManage && limits.activeProbing && (
          <Button onClick={() => setAddOpen(true)}>
            <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
            Add monitor
          </Button>
        )}
      </div>

      {/* Stats cards */}
      <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4 border border-border">
        {statCards.map(({ label, value, icon, accent }) => (
          <div key={label} className="bg-background px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">{label}</p>
              <HugeiconsIcon icon={icon} strokeWidth={1.5} className={`size-3.5 ${accent ? "text-green-500" : "text-muted-foreground/40"}`} />
            </div>
            <div className="flex items-end gap-2">
              <span className={`text-3xl font-bold tabular-nums leading-none ${accent && typeof value === "number" && value > 0 ? "text-red-600 dark:text-red-400" : accent ? "text-green-600 dark:text-green-400" : ""}`}>
                {value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Upgrade prompt for free plan */}
      {!limits.activeProbing && (
        <div className="border border-border bg-muted/30 p-5">
          <div className="flex items-start gap-3">
            <HugeiconsIcon icon={ArrowUp01Icon} strokeWidth={1.5} className="size-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Active monitoring requires a paid plan</p>
              <p className="text-xs text-muted-foreground mt-1">
                Upgrade to get HTTP and TCP health checks, email/webhook alerts, and longer history retention.
                Free plans include update activity charts and stale host detection.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Monitor table (paid plans) */}
      {limits.activeProbing && (
        <div className="border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Host</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Uptime (24h)</TableHead>
                <TableHead>Avg Response</TableHead>
                <TableHead>Last Check</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {monitors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-16">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <p className="text-sm font-medium">No monitors yet</p>
                      <p className="text-xs text-muted-foreground">Add a monitor to start tracking host uptime.</p>
                      {canManage && (
                        <Button size="sm" className="mt-2" onClick={() => setAddOpen(true)}>
                          <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
                          Add monitor
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                monitors.map(monitor => {
                  const cfg = STATUS_CONFIG[monitor.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending
                  const hostname = monitor.host?.subdomain ? `${monitor.host.subdomain}.${base}` : "—"
                  return (
                    <TableRow key={monitor.id} className="group cursor-pointer" onClick={() => setDetailMonitor(monitor)}>
                      <TableCell>
                        <span className="font-mono text-xs">{hostname}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs font-mono px-1.5 py-0 uppercase">
                          {monitor.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex size-2 rounded-full ${cfg.color}`} />
                          <span className={`text-xs font-medium ${cfg.textColor}`}>{cfg.label}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs tabular-nums">
                        {monitor.uptimePercent ? `${monitor.uptimePercent}%` : "—"}
                      </TableCell>
                      <TableCell className="text-xs tabular-nums text-muted-foreground">
                        —
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {timeAgo(monitor.lastCheckedAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={(e) => { e.stopPropagation(); setEditMonitor(monitor) }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <HugeiconsIcon icon={Settings01Icon} strokeWidth={1.5} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Update activity chart (all plans) */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold">Update activity</h2>
        <UpdateActivityChart data={updateActivity} />
      </div>

      {/* Stale hosts */}
      {staleHosts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <HugeiconsIcon icon={AlertDiamondIcon} strokeWidth={1.5} className="size-4 text-yellow-500" />
            Stale hosts
          </h2>
          <div className="border border-border divide-y divide-border">
            {staleHosts.map(host => (
              <div key={host.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <span className="font-mono text-sm">{host.subdomain}.{base}</span>
                  {host.description && (
                    <span className="text-xs text-muted-foreground ml-2">{host.description}</span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  Last seen {timeAgo(host.lastSeenAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active alerts */}
      {activeAlerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={1.5} className="size-4 text-red-500" />
            Active alerts
          </h2>
          <div className="space-y-2">
            {activeAlerts.map(alert => {
              const isDown = alert.type === "host.down"
              return (
                <div
                  key={alert.id}
                  className={`border p-4 flex items-center justify-between gap-4 ${isDown ? "border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30" : "border-border"}`}
                >
                  <div className="min-w-0">
                    <p className={`text-sm font-medium ${isDown ? "text-red-700 dark:text-red-400" : ""}`}>
                      {alert.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {canManage && (
                    <Button size="sm" variant="outline" onClick={() => handleResolve(alert.id)}>
                      Resolve
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Uptime chart for selected monitor */}
      {detailMonitor && (
        <UptimeChart
          monitorId={detailMonitor.id}
          hostname={detailMonitor.host?.subdomain ? `${detailMonitor.host.subdomain}.${base}` : "Monitor"}
          open={!!detailMonitor}
          onOpenChange={(o) => { if (!o) setDetailMonitor(null) }}
        />
      )}

      {/* Add monitor sheet */}
      <MonitorConfigSheet
        slug={slug}
        open={addOpen}
        onOpenChange={setAddOpen}
        plan={plan}
        limits={limits}
      />

      {/* Edit monitor sheet */}
      {editMonitor && (
        <MonitorConfigSheet
          slug={slug}
          open={!!editMonitor}
          onOpenChange={(o) => { if (!o) setEditMonitor(null) }}
          monitor={editMonitor}
          plan={plan}
          limits={limits}
        />
      )}
    </div>
  )
}
