"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { updateHost, regenerateToken, removeHost, getUpdateLog } from "@/lib/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { CopyTokenButton } from "@/components/copy-token-button"
import type { Host, UpdateLog } from "@/lib/schema"

interface Props {
  host: Host | null
  base: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ManageHostSheet({ host, base, open, onOpenChange }: Props) {
  const router = useRouter()
  const [saveError, setSaveError]     = useState("")
  const [saveSuccess, setSaveSuccess] = useState("")
  const [saving, setSaving]           = useState(false)
  const [regen, setRegen]             = useState(false)
  const [deleting, setDeleting]       = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [log, setLog]                 = useState<UpdateLog[]>([])
  const [logLoading, setLogLoading]   = useState(false)

  useEffect(() => {
    if (!open || !host) return
    setSaveError(""); setSaveSuccess(""); setConfirmDelete(false)
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
    const result = await updateHost(host.id, new FormData(e.currentTarget))
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

  async function handleDelete() {
    if (!host) return
    setDeleting(true)
    await removeHost(host.id)
    onOpenChange(false)
    router.refresh()
  }

  if (!host) return null

  const updateUrl = `https://${base}/api/update?token=${host.token}`

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-3 pr-8">
            <SheetTitle className="truncate">{host.subdomain}.{base}</SheetTitle>
            <Badge variant={host.active ? "default" : "secondary"} className="shrink-0">
              {host.active ? "Active" : "Inactive"}
            </Badge>
          </div>
          <SheetDescription>{host.description ?? "No description"}</SheetDescription>
        </SheetHeader>

        <div className="px-6 pb-6">
          <Tabs defaultValue="settings" onValueChange={v => v === "log" && fetchLog()}>
            <TabsList className="w-full">
              <TabsTrigger value="settings" className="flex-1">Settings</TabsTrigger>
              <TabsTrigger value="status" className="flex-1">Status</TabsTrigger>
              <TabsTrigger value="log" className="flex-1">Log</TabsTrigger>
            </TabsList>

            {/* ── Settings ── */}
            <TabsContent value="settings" className="mt-4 space-y-6">
              <form onSubmit={handleSave} autoComplete="off">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="description">Description</FieldLabel>
                    <Textarea id="description" name="description" defaultValue={host.description ?? ""} rows={2} disabled={saving} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="ttl">TTL (seconds)</FieldLabel>
                    <Input id="ttl" name="ttl" type="number" defaultValue={host.ttl} min={30} max={86400} disabled={saving} />
                  </Field>
                  <Field>
                    <FieldLabel>Status</FieldLabel>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="radio" name="active" value="true" defaultChecked={host.active} /> Active
                      </label>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="radio" name="active" value="false" defaultChecked={!host.active} /> Disabled
                      </label>
                    </div>
                  </Field>
                  {saveError   && <p className="text-sm text-destructive">{saveError}</p>}
                  {saveSuccess && <p className="text-sm text-green-600 dark:text-green-400">{saveSuccess}</p>}
                  <Field orientation="horizontal">
                    <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
                  </Field>
                </FieldGroup>
              </form>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium">Update URL</p>
                <code className="block text-xs bg-muted rounded px-3 py-2 break-all">{updateUrl}</code>
                <div className="flex gap-2">
                  <CopyTokenButton text={updateUrl} label="Copy URL" />
                  <Button variant="outline" size="sm" onClick={handleRegen} disabled={regen}>
                    {regen ? "Regenerating…" : "Regenerate token"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Regenerating the token invalidates the current URL immediately.</p>
              </div>

              <Separator />

              <div className="space-y-3">
                <p className="text-sm font-medium text-destructive">Danger zone</p>
                {confirmDelete ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Are you sure? This cannot be undone.</p>
                    <div className="flex gap-2">
                      <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
                        {deleting ? "Deleting…" : "Yes, delete"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setConfirmDelete(false)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(true)}>Delete host</Button>
                )}
              </div>
            </TabsContent>

            {/* ── Status ── */}
            <TabsContent value="status" className="mt-4">
              <dl className="space-y-3 text-sm">
                {[
                  { label: "IPv4",        value: host.ipv4 ?? "—",                         mono: true  },
                  { label: "IPv6",        value: host.ipv6 ?? "—",                         mono: true  },
                  { label: "Last seen",   value: host.lastSeenAt?.toLocaleString() ?? "Never" },
                  { label: "Caller IP",   value: host.lastSeenIp ?? "—",                   mono: true  },
                  { label: "TTL",         value: `${host.ttl}s`                                        },
                  { label: "Created",     value: new Date(host.createdAt).toLocaleString()             },
                ].map(({ label, value, mono }) => (
                  <div key={label} className="flex justify-between gap-4">
                    <dt className="text-muted-foreground shrink-0">{label}</dt>
                    <dd className={mono ? "font-mono text-xs" : ""}>{value}</dd>
                  </div>
                ))}
              </dl>
            </TabsContent>

            {/* ── Log ── */}
            <TabsContent value="log" className="mt-4">
              {logLoading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : log.length === 0 ? (
                <p className="text-sm text-muted-foreground">No updates recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {log.map(entry => (
                    <div key={entry.id} className="text-xs border rounded px-3 py-2 space-y-0.5">
                      <div className="text-muted-foreground">{entry.createdAt.toLocaleString()}</div>
                      <div className="font-mono">{entry.ipv4 ?? "—"} {entry.ipv6 ? `· ${entry.ipv6}` : ""}</div>
                      <div className="text-muted-foreground">from {entry.callerIp}</div>
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
