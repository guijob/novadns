"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { updateWebhook, removeWebhook, regenerateWebhookSecret } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { CopyTokenButton } from "@/components/copy-token-button"
import type { Webhook } from "@/lib/schema"

const ALL_EVENTS = [
  { value: "host.ip_updated",     label: "IP Updated"     },
  { value: "host.created",        label: "Host Created"   },
  { value: "host.deleted",        label: "Host Deleted"   },
  { value: "host.status_changed", label: "Status Changed" },
]

interface Props {
  webhook: Webhook | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ManageWebhookSheet({ webhook, open, onOpenChange }: Props) {
  const router = useRouter()
  const [saveError,     setSaveError]     = useState("")
  const [saveSuccess,   setSaveSuccess]   = useState("")
  const [saving,        setSaving]        = useState(false)
  const [regenLoading,  setRegenLoading]  = useState(false)
  const [newSecret,     setNewSecret]     = useState<string | null>(null)
  const [deleting,      setDeleting]      = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmInput,  setConfirmInput]  = useState("")

  useEffect(() => {
    if (!open || !webhook) return
    setSaveError(""); setSaveSuccess(""); setConfirmDelete(false)
    setConfirmInput(""); setNewSecret(null)
  }, [open, webhook?.id])

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!webhook) return
    setSaveError(""); setSaveSuccess(""); setSaving(true)
    const result = await updateWebhook(webhook.id, new FormData(e.currentTarget))
    if (result?.error) setSaveError(result.error)
    else { setSaveSuccess("Saved"); router.refresh() }
    setSaving(false)
  }

  async function handleRegenSecret() {
    if (!webhook) return
    setRegenLoading(true)
    const result = await regenerateWebhookSecret(webhook.id)
    setNewSecret(result.secret)
    setRegenLoading(false)
  }

  async function handleDelete() {
    if (!webhook) return
    setDeleting(true)
    await removeWebhook(webhook.id)
    onOpenChange(false)
    router.refresh()
  }

  if (!webhook) return null

  const selectedEvents = new Set(webhook.events.split(","))

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="truncate text-base pr-8 font-mono text-sm font-medium">{webhook.url}</SheetTitle>
          <SheetDescription>Manage webhook endpoint and settings</SheetDescription>
        </SheetHeader>

        <div className="px-6 pb-6 space-y-6">
          {/* ── Settings form ────────────────────────────────── */}
          <form onSubmit={handleSave} autoComplete="off">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="url">Endpoint URL</FieldLabel>
                <Input
                  id="url"
                  name="url"
                  type="url"
                  defaultValue={webhook.url}
                  required
                  disabled={saving}
                />
              </Field>
              <Field>
                <FieldLabel>Events</FieldLabel>
                <div className="space-y-2">
                  {ALL_EVENTS.map(ev => (
                    <label key={ev.value} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        name="events"
                        value={ev.value}
                        defaultChecked={selectedEvents.has(ev.value)}
                        disabled={saving}
                      />
                      <span className="text-sm">{ev.label}</span>
                      <code className="text-xs text-muted-foreground font-mono">{ev.value}</code>
                    </label>
                  ))}
                </div>
              </Field>
              <Field orientation="horizontal" className="justify-between">
                <FieldLabel htmlFor="active">Active</FieldLabel>
                <Switch
                  id="active"
                  name="active"
                  value="true"
                  defaultChecked={webhook.active}
                  disabled={saving}
                />
              </Field>
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

          {/* ── Secret ───────────────────────────────────────── */}
          <div className="space-y-2.5">
            <p className="text-sm font-medium">Signing secret</p>
            <p className="text-xs text-muted-foreground">
              NovaDNS signs each payload with <code className="font-mono">HMAC-SHA256</code> using this secret.
              Verify the <code className="font-mono">X-NovaDNS-Signature</code> header on incoming requests.
            </p>
            <div className="border border-border divide-y divide-border">
              <div className="flex items-center justify-between gap-4 px-3 py-2">
                <span className="text-xs text-muted-foreground shrink-0">Secret</span>
                {newSecret ? (
                  <div className="flex items-center gap-2 min-w-0">
                    <code className="font-mono text-xs text-green-600 dark:text-green-400 truncate">{newSecret}</code>
                    <CopyTokenButton text={newSecret} label="Copy" />
                  </div>
                ) : (
                  <span className="font-mono text-xs text-muted-foreground">••••••••••••••••</span>
                )}
              </div>
            </div>
            {newSecret && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Copy this secret now — it won&apos;t be shown again.
              </p>
            )}
            <Button variant="outline" size="sm" onClick={handleRegenSecret} disabled={regenLoading}>
              {regenLoading ? "Regenerating…" : "Regenerate secret"}
            </Button>
          </div>

          <Separator />

          {/* ── Danger zone ──────────────────────────────────── */}
          <div className="space-y-3">
            <p className="text-xs font-mono uppercase tracking-wide text-destructive">Danger zone</p>
            {confirmDelete ? (
              <div className="border border-destructive/30 bg-destructive/5 p-3 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Type <span className="font-medium text-foreground">delete</span> to confirm removing this webhook.
                </p>
                <Input
                  placeholder="delete"
                  value={confirmInput}
                  onChange={e => setConfirmInput(e.target.value)}
                  className="h-8 text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={deleting || confirmInput !== "delete"}
                  >
                    {deleting ? "Deleting…" : "Yes, delete"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setConfirmDelete(false); setConfirmInput("") }}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(true)}>
                Delete webhook
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
