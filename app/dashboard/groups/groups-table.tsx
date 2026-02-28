"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { addGroup } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon, Settings01Icon, SearchIcon, ArrowUp01Icon, ArrowDown01Icon, ArrowUpDownIcon, CheckmarkCircle01Icon } from "@hugeicons/core-free-icons"
import { CopyTokenButton } from "@/components/copy-token-button"
import { ManageGroupSheet } from "@/components/manage-group-sheet"
import type { HostGroup } from "@/lib/schema"

type GroupWithCount = HostGroup & { hostCount: number }

type SortCol = "name" | "hosts" | "created"
type SortDir = "asc" | "desc"

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

export function GroupsTable({ groups: initialGroups, base }: { groups: GroupWithCount[]; base: string }) {
  const router = useRouter()
  const [groups,       setGroups]       = useState(initialGroups)
  const [query,        setQuery]        = useState("")
  const [sort,         setSort]         = useState<{ col: SortCol; dir: SortDir }>({ col: "created", dir: "desc" })
  const [open,         setOpen]         = useState(false)
  const [error,        setError]        = useState("")
  const [loading,      setLoading]      = useState(false)
  const [createdCreds, setCreatedCreds] = useState<{ username: string; password: string } | null>(null)
  const [manageGroup,  setManageGroup]  = useState<GroupWithCount | null>(null)

  useEffect(() => { setGroups(initialGroups) }, [initialGroups])

  function toggleSort(col: SortCol) {
    setSort(s => s.col === col ? { col, dir: s.dir === "asc" ? "desc" : "asc" } : { col, dir: "asc" })
  }

  const q = query.trim().toLowerCase()
  let rows = q
    ? groups.filter(g =>
        g.name.toLowerCase().includes(q) ||
        g.description?.toLowerCase().includes(q) ||
        g.username?.includes(q)
      )
    : [...groups]

  rows.sort((a, b) => {
    let cmp = 0
    switch (sort.col) {
      case "name":    cmp = a.name.localeCompare(b.name); break
      case "hosts":   cmp = a.hostCount - b.hostCount; break
      case "created": cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); break
    }
    return sort.dir === "asc" ? cmp : -cmp
  })

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(""); setLoading(true)
    const result = await addGroup(new FormData(e.currentTarget))
    if ("error" in result && result.error) {
      setError(result.error)
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
            placeholder="Search groups…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button onClick={() => { setError(""); setOpen(true) }}>
          <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
          Add group
        </Button>
      </div>

      {/* ── Table ───────────────────────────────────────────────── */}
      <div className="border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHead col="name"    label="Name"    sort={sort} onSort={toggleSort} />
              <TableHead>Username</TableHead>
              <SortableHead col="hosts"   label="Hosts"   sort={sort} onSort={toggleSort} />
              <SortableHead col="created" label="Created" sort={sort} onSort={toggleSort} />
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
                        <p className="text-sm font-medium">No matching groups</p>
                        <p className="text-xs text-muted-foreground">Try adjusting your search.</p>
                        <button onClick={() => setQuery("")} className="text-xs text-primary hover:underline mt-1">
                          Clear search
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium">No groups yet</p>
                        <p className="text-xs text-muted-foreground">Create a group to share one set of credentials across multiple hosts.</p>
                        <Button size="sm" className="mt-2" onClick={() => { setError(""); setOpen(true) }}>
                          <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
                          Add group
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              rows.map(group => (
                <TableRow key={group.id} className="group">
                  <TableCell>
                    <span className="font-medium text-sm">{group.name}</span>
                    {group.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{group.description}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <code className="font-mono text-xs text-muted-foreground">{group.username ?? "—"}</code>
                  </TableCell>
                  <TableCell className="text-sm tabular-nums">{group.hostCount}</TableCell>
                  <TableCell className="text-xs text-muted-foreground tabular-nums">
                    {new Date(group.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setManageGroup(group)}
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

      {/* ── Add group sheet ──────────────────────────────────────── */}
      <Sheet open={open} onOpenChange={o => { if (!o) { setCreatedCreds(null); setOpen(false) } else setOpen(true) }}>
        <SheetContent>
          {createdCreds ? (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={1.5} className="size-4 text-green-500" />
                  <SheetTitle>Group created</SheetTitle>
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
                  Use these with Basic Auth and <code className="font-mono">?hostname=</code> to update any host in this group.
                </p>
              </div>
              <SheetFooter>
                <Button onClick={handleCredsClose}>Done</Button>
              </SheetFooter>
            </>
          ) : (
            <>
              <SheetHeader>
                <SheetTitle>Add group</SheetTitle>
                <SheetDescription>Create a named group with shared credentials for multiple hosts.</SheetDescription>
              </SheetHeader>
              <form id="add-group-form" onSubmit={handleAdd} className="px-6 space-y-4" autoComplete="off">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="name">Name</FieldLabel>
                    <Input id="name" name="name" placeholder="Home network" required disabled={loading} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="description">
                      Description <span className="text-muted-foreground font-normal">(optional)</span>
                    </FieldLabel>
                    <Textarea id="description" name="description" placeholder="All home routers…" rows={2} disabled={loading} />
                  </Field>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                </FieldGroup>
              </form>
              <SheetFooter>
                <Button type="submit" form="add-group-form" disabled={loading}>{loading ? "Creating…" : "Create group"}</Button>
                <SheetClose render={<Button variant="outline" />}>Cancel</SheetClose>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ── Manage group sheet ───────────────────────────────────── */}
      <ManageGroupSheet
        group={manageGroup}
        base={base}
        open={!!manageGroup}
        onOpenChange={o => { if (!o) setManageGroup(null) }}
      />
    </>
  )
}
