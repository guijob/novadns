"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { NativeSelect } from "@/components/ui/native-select"
import { Switch } from "@/components/ui/switch"
import { createMonitor, updateMonitor, deleteMonitor } from "@/lib/monitoring-actions"
import type { Monitor, Host } from "@/lib/schema"
import type { MonitoringLimits } from "@/lib/plans"

interface MonitorWithHost extends Monitor {
  host: Host | null
}

interface Props {
  slug: string
  open: boolean
  onOpenChange: (open: boolean) => void
  monitor?: MonitorWithHost
  plan: string
  limits: MonitoringLimits
}

export function MonitorConfigSheet({ slug, open, onOpenChange, monitor, plan, limits }: Props) {
  const router = useRouter()
  const isEdit = !!monitor
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  // Form state
  const [type, setType] = useState<"http" | "tcp">(monitor?.type ?? "http")
  const [hostId, setHostId] = useState(monitor?.hostId?.toString() ?? "")
  const [httpUrl, setHttpUrl] = useState(monitor?.httpUrl ?? "")
  const [httpMethod, setHttpMethod] = useState(monitor?.httpMethod ?? "GET")
  const [httpExpectedStatus, setHttpExpectedStatus] = useState(monitor?.httpExpectedStatus?.toString() ?? "200")
  const [tcpPort, setTcpPort] = useState(monitor?.tcpPort?.toString() ?? "")
  const [interval, setInterval] = useState(monitor?.intervalSeconds?.toString() ?? limits.minInterval.toString())
  const [timeout, setTimeout] = useState(monitor?.timeoutSeconds?.toString() ?? "10")
  const [retries, setRetries] = useState(monitor?.retries?.toString() ?? "2")
  const [enabled, setEnabled] = useState(monitor?.enabled ?? true)

  // Available hosts (fetched on mount for new monitors)
  const [hosts, setHosts] = useState<Host[]>([])
  useEffect(() => {
    if (!isEdit && open) {
      fetch(`/api/hosts/stream?slug=${slug}`)
        .then(() => {}) // SSE not suitable for this, we'll use the page data
        .catch(() => {})
    }
  }, [isEdit, open, slug])

  // Reset form when monitor changes
  useEffect(() => {
    if (monitor) {
      setType(monitor.type)
      setHostId(monitor.hostId.toString())
      setHttpUrl(monitor.httpUrl ?? "")
      setHttpMethod(monitor.httpMethod ?? "GET")
      setHttpExpectedStatus(monitor.httpExpectedStatus?.toString() ?? "200")
      setTcpPort(monitor.tcpPort?.toString() ?? "")
      setInterval(monitor.intervalSeconds.toString())
      setTimeout(monitor.timeoutSeconds.toString())
      setRetries(monitor.retries.toString())
      setEnabled(monitor.enabled)
    }
  }, [monitor])

  const intervalOptions = [
    { value: "30",  label: "30 seconds",  min: 30  },
    { value: "60",  label: "1 minute",    min: 60  },
    { value: "120", label: "2 minutes",   min: 120 },
    { value: "300", label: "5 minutes",   min: 300 },
    { value: "600", label: "10 minutes",  min: 600 },
  ].filter(o => o.min >= limits.minInterval)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(""); setLoading(true)

    if (isEdit) {
      const result = await updateMonitor(monitor!.id, {
        httpUrl: type === "http" ? httpUrl || undefined : undefined,
        httpMethod: type === "http" ? httpMethod : undefined,
        httpExpectedStatus: type === "http" ? parseInt(httpExpectedStatus) || 200 : undefined,
        tcpPort: type === "tcp" ? parseInt(tcpPort) || undefined : undefined,
        intervalSeconds: parseInt(interval),
        timeoutSeconds: parseInt(timeout),
        retries: parseInt(retries),
        enabled,
      })
      if ("error" in result && result.error) {
        setError(result.error)
        setLoading(false)
        return
      }
    } else {
      if (!hostId) {
        setError("Select a host")
        setLoading(false)
        return
      }
      const result = await createMonitor(slug, parseInt(hostId), {
        type,
        httpUrl: type === "http" ? httpUrl || undefined : undefined,
        httpMethod: type === "http" ? httpMethod : undefined,
        httpExpectedStatus: type === "http" ? parseInt(httpExpectedStatus) || 200 : undefined,
        tcpPort: type === "tcp" ? parseInt(tcpPort) || undefined : undefined,
        intervalSeconds: parseInt(interval),
        timeoutSeconds: parseInt(timeout),
        retries: parseInt(retries),
      })
      if ("error" in result && result.error) {
        setError(result.error)
        setLoading(false)
        return
      }
    }

    setLoading(false)
    onOpenChange(false)
    router.refresh()
  }

  async function handleDelete() {
    if (!monitor) return
    setLoading(true)
    await deleteMonitor(monitor.id)
    setLoading(false)
    onOpenChange(false)
    router.refresh()
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isEdit ? "Configure monitor" : "Add monitor"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? `Edit settings for ${monitor?.host?.subdomain ?? "this"} monitor`
              : "Set up an uptime check for one of your hosts"
            }
          </SheetDescription>
        </SheetHeader>
        <form id="monitor-form" onSubmit={handleSubmit} className="px-6 space-y-4" autoComplete="off">
          <FieldGroup>
            {!isEdit && (
              <Field>
                <FieldLabel htmlFor="hostId">Host</FieldLabel>
                <Input
                  id="hostId"
                  name="hostId"
                  type="number"
                  placeholder="Host ID"
                  value={hostId}
                  onChange={e => setHostId(e.target.value)}
                  required
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground mt-1">Enter the host ID to monitor</p>
              </Field>
            )}

            <Field>
              <FieldLabel>Check type</FieldLabel>
              <RadioGroup value={type} onValueChange={(v) => setType(v as "http" | "tcp")} disabled={isEdit}>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="http" id="type-http" />
                    <Label htmlFor="type-http">HTTP</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="tcp" id="type-tcp" />
                    <Label htmlFor="type-tcp">TCP</Label>
                  </div>
                </div>
              </RadioGroup>
            </Field>

            {type === "http" && (
              <>
                <Field>
                  <FieldLabel htmlFor="httpUrl">URL (optional)</FieldLabel>
                  <Input
                    id="httpUrl"
                    placeholder="https://example.com/health"
                    value={httpUrl}
                    onChange={e => setHttpUrl(e.target.value)}
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Leave blank to use the host IP</p>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field>
                    <FieldLabel htmlFor="httpMethod">Method</FieldLabel>
                    <NativeSelect
                      id="httpMethod"
                      value={httpMethod}
                      onChange={e => setHttpMethod(e.target.value)}
                      disabled={loading}
                    >
                      <option value="GET">GET</option>
                      <option value="HEAD">HEAD</option>
                      <option value="POST">POST</option>
                    </NativeSelect>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="httpExpectedStatus">Expected status</FieldLabel>
                    <Input
                      id="httpExpectedStatus"
                      type="number"
                      value={httpExpectedStatus}
                      onChange={e => setHttpExpectedStatus(e.target.value)}
                      disabled={loading}
                    />
                  </Field>
                </div>
              </>
            )}

            {type === "tcp" && (
              <Field>
                <FieldLabel htmlFor="tcpPort">Port</FieldLabel>
                <Input
                  id="tcpPort"
                  type="number"
                  placeholder="443"
                  value={tcpPort}
                  onChange={e => setTcpPort(e.target.value)}
                  required
                  disabled={loading}
                />
              </Field>
            )}

            <div className="grid grid-cols-3 gap-3">
              <Field>
                <FieldLabel htmlFor="interval">Interval</FieldLabel>
                <NativeSelect
                  id="interval"
                  value={interval}
                  onChange={e => setInterval(e.target.value)}
                  disabled={loading}
                >
                  {intervalOptions.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </NativeSelect>
              </Field>
              <Field>
                <FieldLabel htmlFor="timeout">Timeout (s)</FieldLabel>
                <Input
                  id="timeout"
                  type="number"
                  min={5}
                  max={30}
                  value={timeout}
                  onChange={e => setTimeout(e.target.value)}
                  disabled={loading}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="retries">Retries</FieldLabel>
                <Input
                  id="retries"
                  type="number"
                  min={1}
                  max={5}
                  value={retries}
                  onChange={e => setRetries(e.target.value)}
                  disabled={loading}
                />
              </Field>
            </div>

            {isEdit && (
              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="enabled">Enabled</FieldLabel>
                  <Switch
                    id="enabled"
                    checked={enabled}
                    onCheckedChange={setEnabled}
                    disabled={loading}
                  />
                </div>
              </Field>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}
          </FieldGroup>

          {isEdit && (
            <div className="border-t border-border pt-4 mt-4">
              {deleteConfirm ? (
                <div className="space-y-2">
                  <p className="text-sm text-destructive">Are you sure? This cannot be undone.</p>
                  <div className="flex gap-2">
                    <Button type="button" variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
                      {loading ? "Deleting…" : "Delete monitor"}
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setDeleteConfirm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteConfirm(true)}>
                  Delete monitor
                </Button>
              )}
            </div>
          )}
        </form>
        <SheetFooter>
          <Button type="submit" form="monitor-form" disabled={loading}>
            {loading ? (isEdit ? "Saving…" : "Creating…") : (isEdit ? "Save" : "Create monitor")}
          </Button>
          <SheetClose render={<Button variant="outline" />}>Cancel</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
