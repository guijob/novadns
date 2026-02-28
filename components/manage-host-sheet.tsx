"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { updateHost, regenerateToken, regenerateHostPassword, removeHost, getUpdateLog, assignHostToGroup } from "@/lib/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { CopyTokenButton } from "@/components/copy-token-button"
import type { Host, HostGroup, UpdateLog } from "@/lib/schema"

interface Props {
  host: Host | null
  base: string
  groups: HostGroup[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

function timeAgo(date: Date | string) {
  const secs = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (secs < 60)    return `${secs}s ago`
  if (secs < 3600)  return `${Math.floor(secs / 60)}m ago`
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`
  return `${Math.floor(secs / 86400)}d ago`
}

export function ManageHostSheet({ host, base, groups, open, onOpenChange }: Props) {
  const router = useRouter()
  const [saveError,     setSaveError]     = useState("")
  const [saveSuccess,   setSaveSuccess]   = useState("")
  const [saving,        setSaving]        = useState(false)
  const [regen,         setRegen]         = useState(false)
  const [regenPwd,      setRegenPwd]      = useState(false)
  const [newPassword,   setNewPassword]   = useState<string | null>(null)
  const [deleting,      setDeleting]      = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [log,           setLog]           = useState<UpdateLog[]>([])
  const [logLoading,    setLogLoading]    = useState(false)

  useEffect(() => {
    if (!open || !host) return
    setSaveError(""); setSaveSuccess(""); setConfirmDelete(false); setNewPassword(null)
  }, [open, host?.id])

  async function fetchLog() {
    if (!host) return
    setLogLoading(true)
    const entries = await getUpdateLog(host.id)
    setLog(entries)
    setLogLoading(false)
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!host) return
    setSaveError(""); setSaveSuccess(""); setSaving(true)
    const fd = new FormData(e.currentTarget)
    const groupVal = fd.get("groupId")
    const newGroupId = groupVal === "" || groupVal === null ? null : Number(groupVal)
    const [result] = await Promise.all([
      updateHost(host.id, fd),
      assignHostToGroup(host.id, newGroupId),
    ])
    if (result?.error) setSaveError(result.error)
    else { setSaveSuccess("Saved"); router.refresh() }
    setSaving(false)
  }

  async function handleRegen() {
    if (!host) return
    setRegen(true)
    await regenerateToken(host.id)
    router.refresh()
    setRegen(false)
  }

  async function handleRegenPassword() {
    if (!host) return
    setRegenPwd(true)
    const result = await regenerateHostPassword(host.id)
    setNewPassword(result.password)
    setRegenPwd(false)
  }

  async function handleDelete() {
    if (!host) return
    setDeleting(true)
    await removeHost(host.id)
    onOpenChange(false)
    router.refresh()
  }

  if (!host) return null

  const updateUrl = `https://${base}/api/update?token=${host.token}`

  const isOnline = host.active && host.lastSeenAt &&
    (Date.now() - new Date(host.lastSeenAt).getTime()) < 10 * 60 * 1000

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-2.5 pr-8">
            <span
              className={`size-2 rounded-full shrink-0 ${
                !host.active ? "bg-muted-foreground/30" :
                isOnline     ? "bg-green-500" :
                               "bg-muted-foreground/40"
              }`}
            />
            <SheetTitle className="truncate text-base">{host.subdomain}.{base}</SheetTitle>
            <Badge
              variant={host.active ? "default" : "secondary"}
              className="shrink-0 text-xs"
            >
              {host.active ? "Active" : "Inactive"}
            </Badge>
          </div>
          {host.description && (
            <SheetDescription className="pl-4">{host.description}</SheetDescription>
          )}
        </SheetHeader>

        <div className="px-6 pb-6">
          <Tabs defaultValue="settings" onValueChange={v => v === "log" && fetchLog()}>
            <TabsList className="w-full">
              <TabsTrigger value="settings" className="flex-1">Settings</TabsTrigger>
              <TabsTrigger value="status"   className="flex-1">Status</TabsTrigger>
              <TabsTrigger value="log"      className="flex-1">Log</TabsTrigger>
            </TabsList>

            {/* ── Settings ─────────────────────────────────────── */}
            <TabsContent value="settings" className="mt-4 space-y-6">
              <form onSubmit={handleSave} autoComplete="off">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="description">Description</FieldLabel>
                    <Textarea
                      id="description"
                      name="description"
                      defaultValue={host.description ?? ""}
                      rows={2}
                      disabled={saving}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="ttl">TTL (seconds)</FieldLabel>
                    <Input
                      id="ttl"
                      name="ttl"
                      type="number"
                      defaultValue={host.ttl}
                      min={30}
                      max={86400}
                      disabled={saving}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Status</FieldLabel>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="radio" name="active" value="true"  defaultChecked={host.active}  /> Active
                      </label>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="radio" name="active" value="false" defaultChecked={!host.active} /> Disabled
                      </label>
                    </div>
                  </Field>
                  {groups.length > 0 && (
                    <Field>
                      <FieldLabel htmlFor="groupId">Group</FieldLabel>
                      <select
                        id="groupId"
                        name="groupId"
                        defaultValue={host.groupId ?? ""}
                        disabled={saving}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">None</option>
                        {groups.map(g => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                      </select>
                    </Field>
                  )}
                  {saveError   && <p className="text-sm text-destructive">{saveError}</p>}
                  {saveSuccess && <p className="text-sm text-green-600 dark:text-green-400">{saveSuccess}</p>}
                  <Field orientation="horizontal">
                    <Button type="submit" disabled={saving}>
                      {saving ? "Saving…" : "Save changes"}
                    </Button>
                  </Field>
                </FieldGroup>
              </form>

              <Separator />

              {/* Update URL */}
              <div className="space-y-2.5">
                <p className="text-sm font-medium">Token URL</p>
                <div className="border border-border bg-muted/30 px-3 py-2.5">
                  <code className="text-xs font-mono break-all text-muted-foreground">{updateUrl}</code>
                </div>
                <div className="flex gap-2">
                  <CopyTokenButton text={updateUrl} label="Copy URL" />
                  <Button variant="outline" size="sm" onClick={handleRegen} disabled={regen}>
                    {regen ? "Regenerating…" : "Regenerate token"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Regenerating the token invalidates the current URL immediately.
                </p>
              </div>

              <Separator />

              {/* Basic Auth credentials */}
              <div className="space-y-2.5">
                <p className="text-sm font-medium">Basic Auth credentials</p>
                <div className="border border-border divide-y divide-border">
                  <div className="flex items-center justify-between gap-4 px-3 py-2">
                    <span className="text-xs text-muted-foreground shrink-0">Username</span>
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-xs">{host.username ?? "—"}</code>
                      {host.username && <CopyTokenButton text={host.username} label="Copy" />}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 px-3 py-2">
                    <span className="text-xs text-muted-foreground shrink-0">Password</span>
                    {newPassword ? (
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-xs text-green-600 dark:text-green-400">{newPassword}</code>
                        <CopyTokenButton text={newPassword} label="Copy" />
                      </div>
                    ) : (
                      <span className="font-mono text-xs text-muted-foreground">••••••••••••</span>
                    )}
                  </div>
                </div>
                {newPassword && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Save this password now — it won&apos;t be shown again.
                  </p>
                )}
                <Button variant="outline" size="sm" onClick={handleRegenPassword} disabled={regenPwd}>
                  {regenPwd ? "Regenerating…" : "Regenerate password"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Use with <code className="font-mono">https://username:password@{base}/api/update</code>
                </p>
              </div>

              <Separator />

              {/* Danger zone */}
              <div className="space-y-3">
                <p className="text-xs font-mono uppercase tracking-wide text-destructive">Danger zone</p>
                {confirmDelete ? (
                  <div className="border border-destructive/30 bg-destructive/5 p-3 space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Delete <span className="font-medium text-foreground">{host.subdomain}.{base}</span>? This cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
                        {deleting ? "Deleting…" : "Yes, delete"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setConfirmDelete(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(true)}>
                    Delete host
                  </Button>
                )}
              </div>
            </TabsContent>

            {/* ── Status ───────────────────────────────────────── */}
            <TabsContent value="status" className="mt-4">
              <div className="border border-border divide-y divide-border">
                {[
                  { label: "IPv4",      value: host.ipv4 ?? "—",                              mono: true  },
                  { label: "IPv6",      value: host.ipv6 ?? "—",                              mono: true  },
                  { label: "Last seen", value: host.lastSeenAt ? host.lastSeenAt.toLocaleString() : "Never" },
                  { label: "Caller IP", value: host.lastSeenIp ?? "—",                        mono: true  },
                  { label: "TTL",       value: `${host.ttl}s`                                             },
                  { label: "Created",   value: new Date(host.createdAt).toLocaleString()                  },
                ].map(({ label, value, mono }) => (
                  <div key={label} className="flex items-start justify-between gap-6 px-3 py-2.5">
                    <span className="text-xs text-muted-foreground shrink-0 pt-px">{label}</span>
                    <span className={`text-xs text-right break-all ${mono ? "font-mono" : ""}`}>{value}</span>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* ── Log ──────────────────────────────────────────── */}
            <TabsContent value="log" className="mt-4">
              {logLoading ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Loading…</p>
              ) : log.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm text-muted-foreground">No updates recorded yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">Updates will appear here once the host starts reporting.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {log.map((entry, i) => (
                    <div key={entry.id} className="border border-border p-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium">{timeAgo(entry.createdAt)}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          from {entry.callerIp}
                        </span>
                      </div>
                      <div className="flex gap-4">
                        <div>
                          <p className="text-[10px] text-muted-foreground mb-0.5">IPv4</p>
                          <p className="font-mono text-xs">{entry.ipv4 ?? "—"}</p>
                        </div>
                        {entry.ipv6 && (
                          <div>
                            <p className="text-[10px] text-muted-foreground mb-0.5">IPv6</p>
                            <p className="font-mono text-xs">{entry.ipv6}</p>
                          </div>
                        )}
                      </div>
                      {i === 0 && (
                        <span className="inline-block text-[10px] font-mono bg-primary/10 text-primary px-1.5 py-0.5">
                          latest
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}
