"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { addHost } from "@/lib/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon, Settings01Icon } from "@hugeicons/core-free-icons"
import type { Host } from "@/lib/schema"

function statusBadge(lastSeen: Date | null, active: boolean) {
  if (!active) return <Badge variant="secondary">Disabled</Badge>
  if (!lastSeen) return <Badge variant="secondary">Never seen</Badge>
  const mins = (Date.now() - new Date(lastSeen).getTime()) / 60000
  return mins < 10
    ? <Badge className="bg-green-500/15 text-green-700 dark:text-green-400">Online</Badge>
    : <Badge variant="secondary">Offline</Badge>
}

function timeAgo(date: Date | null) {
  if (!date) return "—"
  const secs = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (secs < 60)    return `${secs}s ago`
  if (secs < 3600)  return `${Math.floor(secs / 60)}m ago`
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`
  return `${Math.floor(secs / 86400)}d ago`
}

export function HostsTable({ hosts, base }: { hosts: Host[]; base: string }) {
  const router = useRouter()
  const [query, setQuery]   = useState("")
  const [open, setOpen]     = useState(false)
  const [error, setError]   = useState("")
  const [loading, setLoading] = useState(false)

  const filtered = query.trim()
    ? hosts.filter(h =>
        h.subdomain.includes(query.toLowerCase()) ||
        h.description?.toLowerCase().includes(query.toLowerCase()) ||
        h.ipv4?.includes(query)
      )
    : hosts

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(""); setLoading(true)
    const result = await addHost(new FormData(e.currentTarget))
    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }
    setOpen(false)
    setLoading(false)
    router.refresh()
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Search hosts…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => { setError(""); setOpen(true) }}>
          <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
          Add host
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subdomain</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>IPv4</TableHead>
              <TableHead>Last seen</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>TTL</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                  {query ? "No hosts match your search." : "No hosts yet."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(host => (
                <TableRow key={host.id} className={host.active ? "" : "opacity-60"}>
                  <TableCell>
                    <div className="font-medium">{host.subdomain}.{base}</div>
                    {host.description && (
                      <div className="text-xs text-muted-foreground">{host.description}</div>
                    )}
                  </TableCell>
                  <TableCell>{statusBadge(host.lastSeenAt, host.active)}</TableCell>
                  <TableCell className="font-mono">{host.ipv4 ?? "—"}</TableCell>
                  <TableCell>{timeAgo(host.lastSeenAt)}</TableCell>
                  <TableCell>{new Date(host.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{host.ttl}s</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" nativeButton={false} render={<Link href={`/dashboard/hosts/${host.id}`} />}>
                      <HugeiconsIcon icon={Settings01Icon} strokeWidth={2} />
                      Manage
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add host</SheetTitle>
            <SheetDescription>Create a new dynamic DNS entry under {base}</SheetDescription>
          </SheetHeader>
          <form id="add-host-form" onSubmit={handleAdd} className="px-6 space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="subdomain">Subdomain</FieldLabel>
                <div className="flex items-center gap-1">
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
            <Button type="submit" form="add-host-form" disabled={loading}>
              {loading ? "Creating…" : "Create host"}
            </Button>
            <SheetClose render={<Button variant="outline" />}>Cancel</SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
