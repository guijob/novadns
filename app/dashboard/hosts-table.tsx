"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { addHost } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon, Settings01Icon, CrownIcon, SearchIcon, ArrowUp01Icon, ArrowDown01Icon, ArrowUpDownIcon, CheckmarkCircle01Icon, Copy01Icon } from "@hugeicons/core-free-icons"
import { CopyTokenButton } from "@/components/copy-token-button"
import { ManageHostSheet } from "@/components/manage-host-sheet"
import type { Host, HostGroup } from "@/lib/schema"

const FREE_LIMIT = 3

type StatusKind   = "online" | "offline" | "never" | "disabled"
type StatusFilter = "all" | StatusKind
type SortCol      = "host" | "status" | "lastSeen" | "ttl" | "created"
type SortDir      = "asc" | "desc"

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all",      label: "All"       },
  { key: "online",   label: "Online"    },
  { key: "offline",  label: "Offline"   },
  { key: "never",    label: "Never seen"},
  { key: "disabled", label: "Inactive"  },
]

const STATUS_CONFIG: Record<StatusKind, { label: string; dot: string; text: string }> = {
  online:   { label: "Online",     dot: "bg-green-500",           text: "text-green-700 dark:text-green-400" },
  offline:  { label: "Offline",    dot: "bg-muted-foreground/40", text: "text-muted-foreground" },
  never:    { label: "Never seen", dot: "bg-muted-foreground/40", text: "text-muted-foreground" },
  disabled: { label: "Inactive",   dot: "bg-muted-foreground/25", text: "text-muted-foreground/60" },
}

const STATUS_ORDER: Record<StatusKind, number> = { online: 0, offline: 1, never: 2, disabled: 3 }

function getStatus(host: Host): StatusKind {
  if (!host.active) return "disabled"
  if (!host.lastSeenAt) return "never"
  return (Date.now() - new Date(host.lastSeenAt).getTime()) / 60000 < 10 ? "online" : "offline"
}

function timeAgo(date: Date | null) {
  if (!date) return "—"
  const secs = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (secs < 60)    return `${secs}s ago`
  if (secs < 3600)  return `${Math.floor(secs / 60)}m ago`
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`
  return `${Math.floor(secs / 86400)}d ago`
}

function SortIcon({ col, sort }: { col: SortCol; sort: { col: SortCol; dir: SortDir } }) {
  if (sort.col !== col) return <HugeiconsIcon icon={ArrowUpDownIcon} strokeWidth={1.5} className="size-3 text-muted-foreground/40" />
  return sort.dir === "asc"
    ? <HugeiconsIcon icon={ArrowUp01Icon}   strokeWidth={2} className="size-3" />
    : <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} className="size-3" />
}

function SortableHead({ col, label, sort, onSort }: { col: SortCol; label: string; sort: { col: SortCol; dir: SortDir }; onSort: (col: SortCol) => void }) {
  return (
    <TableHead>
      <button
        onClick={() => onSort(col)}
        className="flex items-center gap-1.5 hover:text-foreground transition-colors"
      >
        {label}
        <SortIcon col={col} sort={sort} />
      </button>
    </TableHead>
  )
}

function parseDates(raw: Host[]): Host[] {
  return raw.map(h => ({
    ...h,
    createdAt:  new Date(h.createdAt),
    updatedAt:  new Date(h.updatedAt),
    lastSeenAt: h.lastSeenAt ? new Date(h.lastSeenAt) : null,
  }))
}

export function HostsTable({ hosts: initialHosts, base, plan, groups }: { hosts: Host[]; base: string; plan: string; groups: HostGroup[] }) {
  const router = useRouter()
  const [hosts,        setHosts]        = useState(initialHosts)
  const [query,        setQuery]        = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [sort,         setSort]         = useState<{ col: SortCol; dir: SortDir }>({ col: "created", dir: "desc" })
  const [open,         setOpen]         = useState(false)
  const [error,        setError]        = useState("")
  const [loading,      setLoading]      = useState(false)
  const [createdCreds, setCreatedCreds] = useState<{ username: string; password: string } | null>(null)
  const [manageHost,   setManageHost]   = useState<Host | null>(null)
  const [copiedId,     setCopiedId]     = useState<number | null>(null)

  // Sync when server re-fetches (after add/delete)
  useEffect(() => { setHosts(initialHosts) }, [initialHosts])


  // SSE — live updates for IP/lastSeen changes
  useEffect(() => {
    const es = new EventSource("/api/hosts/stream")
    es.onmessage = (e) => {
      if (!e.data || e.data.startsWith(":")) return
      try {
        const updated = parseDates(JSON.parse(e.data) as Host[])
        setHosts(updated)
        setManageHost(prev => prev ? (updated.find(h => h.id === prev.id) ?? prev) : null)
      } catch {}
    }
    es.onerror = () => { /* EventSource will auto-reconnect */ }
    return () => es.close()
  }, [])

  const activeCount = hosts.filter(h => h.active).length
  const atLimit     = plan === "free" && activeCount >= FREE_LIMIT

  function toggleSort(col: SortCol) {
    setSort(s => s.col === col ? { col, dir: s.dir === "asc" ? "desc" : "asc" } : { col, dir: "asc" })
  }

  // 1. search
  const q = query.trim().toLowerCase()
  let rows = q
    ? hosts.filter(h =>
        h.subdomain.includes(q) ||
        h.description?.toLowerCase().includes(q) ||
        h.ipv4?.includes(q) ||
        h.ipv6?.includes(q)
      )
    : [...hosts]

  // 2. status filter
  if (statusFilter !== "all") rows = rows.filter(h => getStatus(h) === statusFilter)

  // 3. sort
  rows.sort((a, b) => {
    let cmp = 0
    switch (sort.col) {
      case "host":     cmp = a.subdomain.localeCompare(b.subdomain); break
      case "status":   cmp = STATUS_ORDER[getStatus(a)] - STATUS_ORDER[getStatus(b)]; break
      case "lastSeen": cmp = (a.lastSeenAt ? new Date(a.lastSeenAt).getTime() : 0) - (b.lastSeenAt ? new Date(b.lastSeenAt).getTime() : 0); break
      case "ttl":      cmp = a.ttl - b.ttl; break
      case "created":  cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); break
    }
    return sort.dir === "asc" ? cmp : -cmp
  })

  const isFiltered = q || statusFilter !== "all"

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(""); setLoading(true)
    const result = await addHost(new FormData(e.currentTarget))
    if ("error" in result && result.error) {
      setError(result.error === "plan_limit" ? "You've reached the free plan limit." : result.error)
      setLoading(false)
      return
    }
    setLoading(false)
    if ("username" in result && result.username) {
      setCreatedCreds({ username: result.username, password: result.password })
    } else {
      setOpen(false)
    }
    router.refresh()
  }

  function handleCredsClose() {
    setCreatedCreds(null)
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
            placeholder="Search hosts…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button onClick={() => { setError(""); setOpen(true) }}>
          <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
          Add host
        </Button>
      </div>

      {/* ── Filters ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1">
          {STATUS_FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${
                statusFilter === key
                  ? "bg-foreground text-background font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {isFiltered && (
          <span className="text-xs text-muted-foreground">
            {rows.length} of {hosts.length} host{hosts.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* ── Table ───────────────────────────────────────────────── */}
      <div className="border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHead col="host"     label="Host"      sort={sort} onSort={toggleSort} />
              <SortableHead col="status"   label="Status"    sort={sort} onSort={toggleSort} />
              <TableHead>Address</TableHead>
              <SortableHead col="lastSeen" label="Last seen" sort={sort} onSort={toggleSort} />
              <SortableHead col="ttl"      label="TTL"       sort={sort} onSort={toggleSort} />
              <SortableHead col="created"  label="Created"   sort={sort} onSort={toggleSort} />
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-16">
                  <div className="flex flex-col items-center gap-2 text-center">
                    {isFiltered ? (
                      <>
                        <p className="text-sm font-medium">No matching hosts</p>
                        <p className="text-xs text-muted-foreground">Try adjusting your search or filters.</p>
                        <button
                          onClick={() => { setQuery(""); setStatusFilter("all") }}
                          className="text-xs text-primary hover:underline mt-1"
                        >
                          Clear filters
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium">No hosts yet</p>
                        <p className="text-xs text-muted-foreground">Add your first host to get started.</p>
                        <Button size="sm" className="mt-2" onClick={() => { setError(""); setOpen(true) }}>
                          <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
                          Add host
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              rows.map(host => {
                const status = getStatus(host)
                const { label, dot, text } = STATUS_CONFIG[status]
                return (
                  <TableRow key={host.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-sm">{host.subdomain}.{base}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`${host.subdomain}.${base}`)
                            setCopiedId(host.id)
                            setTimeout(() => setCopiedId(null), 2000)
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                        >
                          <HugeiconsIcon
                            icon={Copy01Icon}
                            strokeWidth={1.5}
                            className={`size-3.5 ${copiedId === host.id ? "text-green-500" : ""}`}
                          />
                        </button>
                      </div>
                      {host.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{host.description}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`size-1.5 rounded-full shrink-0 ${dot}`} />
                        <span className={`text-xs ${text}`}>{label}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-muted-foreground w-6">v4</span>
                          <span className="font-mono text-xs">{host.ipv4 ?? "—"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-muted-foreground w-6">v6</span>
                          <span className="font-mono text-xs text-muted-foreground truncate max-w-[180px]">{host.ipv6 ?? "—"}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground tabular-nums" suppressHydrationWarning>{timeAgo(host.lastSeenAt)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground tabular-nums">{host.ttl}s</TableCell>
                    <TableCell className="text-xs text-muted-foreground tabular-nums">{new Date(host.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setManageHost(host)}
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

      {/* ── Add host sheet ──────────────────────────────────────── */}
      <Sheet open={open} onOpenChange={open => { if (!open) { setCreatedCreds(null); setOpen(false) } else setOpen(true) }}>
        <SheetContent>
          {createdCreds ? (
            /* ── Credentials reveal ───────────────────────── */
            <>
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={1.5} className="size-4 text-green-500" />
                  <SheetTitle>Host created</SheetTitle>
                </div>
                <SheetDescription>
                  Save these credentials — the password won&apos;t be shown again.
                </SheetDescription>
              </SheetHeader>
              <div className="px-6 space-y-4">
                <div className="border border-border divide-y divide-border">
                  <div className="flex items-center justify-between gap-4 px-3 py-2.5">
                    <span className="text-xs text-muted-foreground shrink-0">Username</span>
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-xs">{createdCreds.username}</code>
                      <CopyTokenButton text={createdCreds.username} label="Copy" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 px-3 py-2.5">
                    <span className="text-xs text-muted-foreground shrink-0">Password</span>
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-xs">{createdCreds.password}</code>
                      <CopyTokenButton text={createdCreds.password} label="Copy" />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Use these with Basic Auth at <code className="font-mono">https://username:password@{base}/api/update</code>,
                  or keep using the token URL from the host settings.
                </p>
              </div>
              <SheetFooter>
                <Button onClick={handleCredsClose}>Done</Button>
              </SheetFooter>
            </>
          ) : atLimit ? (
            /* ── Plan limit ───────────────────────────────── */
            <>
              <SheetHeader>
                <SheetTitle>Add host</SheetTitle>
                <SheetDescription>Create a new dynamic DNS entry under {base}</SheetDescription>
              </SheetHeader>
              <div className="px-6 flex flex-col items-center text-center gap-4 py-8">
                <div className="size-12 flex items-center justify-center border border-border">
                  <HugeiconsIcon icon={CrownIcon} strokeWidth={1.5} className="size-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold">Free plan limit reached</p>
                  <p className="text-sm text-muted-foreground">
                    You&apos;ve used all {FREE_LIMIT} active hosts on the free plan.
                    Upgrade to Pro to continue adding hosts.
                  </p>
                </div>
                <Button className="w-full" disabled>Upgrade to Pro — coming soon</Button>
              </div>
              <SheetFooter>
                <SheetClose render={<Button variant="outline" className="w-full" />}>Close</SheetClose>
              </SheetFooter>
            </>
          ) : (
            /* ── Create form ──────────────────────────────── */
            <>
              <SheetHeader>
                <SheetTitle>Add host</SheetTitle>
                <SheetDescription>Create a new dynamic DNS entry under {base}</SheetDescription>
              </SheetHeader>
              <form id="add-host-form" onSubmit={handleAdd} className="px-6 space-y-4" autoComplete="off">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="subdomain">Subdomain</FieldLabel>
                    <div className="flex items-center gap-2">
                      <Input id="subdomain" name="subdomain" placeholder="home" required className="flex-1" disabled={loading} />
                      <span className="text-sm text-muted-foreground whitespace-nowrap">.{base}</span>
                    </div>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="description">
                      Description <span className="text-muted-foreground font-normal">(optional)</span>
                    </FieldLabel>
                    <Textarea id="description" name="description" placeholder="Home router, office server…" rows={2} disabled={loading} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="ttl">TTL (seconds)</FieldLabel>
                    <Input id="ttl" name="ttl" type="number" defaultValue={60} min={30} max={86400} disabled={loading} />
                  </Field>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                </FieldGroup>
              </form>
              <SheetFooter>
                <Button type="submit" form="add-host-form" disabled={loading}>{loading ? "Creating…" : "Create host"}</Button>
                <SheetClose render={<Button variant="outline" />}>Cancel</SheetClose>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ── Manage host sheet ───────────────────────────────────── */}
      <ManageHostSheet
        host={manageHost}
        base={base}
        groups={groups}
        open={!!manageHost}
        onOpenChange={open => { if (!open) setManageHost(null) }}
      />
    </>
  )
}
