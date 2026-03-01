"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { addWebhook } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon, Settings01Icon, SearchIcon, CheckmarkCircle01Icon } from "@hugeicons/core-free-icons"
import { CopyTokenButton } from "@/components/copy-token-button"
import { ManageWebhookSheet } from "@/components/manage-webhook-sheet"
import type { Webhook } from "@/lib/schema"

const ALL_EVENTS = [
  { value: "host.ip_updated",    label: "IP Updated"     },
  { value: "host.created",       label: "Host Created"   },
  { value: "host.deleted",       label: "Host Deleted"   },
  { value: "host.status_changed", label: "Status Changed" },
]

export function WebhooksTable({ webhooks: initialWebhooks }: { webhooks: Webhook[] }) {
  const router = useRouter()
  const [webhooks,      setWebhooks]      = useState(initialWebhooks)
  const [query,         setQuery]         = useState("")
  const [open,          setOpen]          = useState(false)
  const [error,         setError]         = useState("")
  const [loading,       setLoading]       = useState(false)
  const [createdSecret, setCreatedSecret] = useState<string | null>(null)
  const [manageWebhook, setManageWebhook] = useState<Webhook | null>(null)

  useEffect(() => { setWebhooks(initialWebhooks) }, [initialWebhooks])

  const q = query.trim().toLowerCase()
  const rows = q
    ? webhooks.filter(w => w.url.toLowerCase().includes(q) || w.events.toLowerCase().includes(q))
    : [...webhooks]

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(""); setLoading(true)
    const result = await addWebhook(new FormData(e.currentTarget))
    if ("error" in result && result.error) {
      setError(result.error)
      setLoading(false)
      return
    }
    setLoading(false)
    if ("secret" in result && result.secret) {
      setCreatedSecret(result.secret)
    } else {
      setOpen(false)
    }
    router.refresh()
  }

  function handleSecretClose() {
    setCreatedSecret(null)
    setOpen(false)
  }

  return (
    <>
      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-xs w-full">
          <HugeiconsIcon
            icon={SearchIcon}
            strokeWidth={1.5}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none"
          />
          <Input
            placeholder="Search webhooks…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button onClick={() => { setError(""); setOpen(true) }}>
          <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
          Add webhook
        </Button>
      </div>

      {/* ── Table ───────────────────────────────────────────────── */}
      <div className="border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>URL</TableHead>
              <TableHead>Events</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-16">
                  <div className="flex flex-col items-center gap-2 text-center">
                    {q ? (
                      <>
                        <p className="text-sm font-medium">No matching webhooks</p>
                        <p className="text-xs text-muted-foreground">Try adjusting your search.</p>
                        <button onClick={() => setQuery("")} className="text-xs text-primary hover:underline mt-1">
                          Clear search
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium">No webhooks yet</p>
                        <p className="text-xs text-muted-foreground">Register an endpoint to receive events when hosts change.</p>
                        <Button size="sm" className="mt-2" onClick={() => { setError(""); setOpen(true) }}>
                          <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
                          Add webhook
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              rows.map(webhook => (
                <TableRow key={webhook.id} className="group">
                  <TableCell className="max-w-xs">
                    <span
                      className="font-mono text-xs truncate block"
                      title={webhook.url}
                    >
                      {webhook.url}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {webhook.events.split(",").map(ev => (
                        <Badge key={ev} variant="secondary" className="text-xs font-mono px-1.5 py-0">
                          {ev}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex size-2 rounded-full ${webhook.active ? "bg-green-500" : "bg-muted-foreground/30"}`}
                      title={webhook.active ? "Active" : "Inactive"}
                    />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground tabular-nums">
                    {new Date(webhook.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setManageWebhook(webhook)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <HugeiconsIcon icon={Settings01Icon} strokeWidth={1.5} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Add webhook sheet ──────────────────────────────────────── */}
      <Sheet open={open} onOpenChange={o => { if (!o) { setCreatedSecret(null); setOpen(false) } else setOpen(true) }}>
        <SheetContent>
          {createdSecret ? (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={1.5} className="size-4 text-green-500" />
                  <SheetTitle>Webhook created</SheetTitle>
                </div>
                <SheetDescription>
                  Copy your signing secret now — it won&apos;t be shown again.
                </SheetDescription>
              </SheetHeader>
              <div className="px-6 space-y-4">
                <div className="border border-border divide-y divide-border">
                  <div className="flex items-center justify-between gap-4 px-3 py-2.5">
                    <span className="text-xs text-muted-foreground shrink-0">Secret</span>
                    <div className="flex items-center gap-2 min-w-0">
                      <code className="font-mono text-xs truncate">{createdSecret}</code>
                      <CopyTokenButton text={createdSecret} label="Copy" />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Use this secret to verify the <code className="font-mono">X-NovaDNS-Signature</code> header on incoming payloads.
                </p>
              </div>
              <SheetFooter>
                <Button onClick={handleSecretClose}>Done</Button>
              </SheetFooter>
            </>
          ) : (
            <>
              <SheetHeader>
                <SheetTitle>Add webhook</SheetTitle>
                <SheetDescription>Register an endpoint to receive HTTP callbacks for DNS events.</SheetDescription>
              </SheetHeader>
              <form id="add-webhook-form" onSubmit={handleAdd} className="px-6 space-y-4" autoComplete="off">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="url">Endpoint URL</FieldLabel>
                    <Input
                      id="url"
                      name="url"
                      type="url"
                      placeholder="https://example.com/hooks/novadns"
                      required
                      disabled={loading}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Events</FieldLabel>
                    <div className="space-y-2">
                      {ALL_EVENTS.map(ev => (
                        <label key={ev.value} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox name="events" value={ev.value} disabled={loading} />
                          <span className="text-sm">{ev.label}</span>
                          <code className="text-xs text-muted-foreground font-mono">{ev.value}</code>
                        </label>
                      ))}
                    </div>
                  </Field>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                </FieldGroup>
              </form>
              <SheetFooter>
                <Button type="submit" form="add-webhook-form" disabled={loading}>{loading ? "Creating…" : "Create webhook"}</Button>
                <SheetClose render={<Button variant="outline" />}>Cancel</SheetClose>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ── Manage webhook sheet ───────────────────────────────────── */}
      <ManageWebhookSheet
        webhook={manageWebhook}
        open={!!manageWebhook}
        onOpenChange={o => { if (!o) setManageWebhook(null) }}
      />
    </>
  )
}
