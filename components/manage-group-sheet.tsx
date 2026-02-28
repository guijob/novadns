"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { updateGroup, removeGroup, regenerateGroupPassword, assignHostToGroup, getGroupHosts, getHosts } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { CopyTokenButton } from "@/components/copy-token-button"
import type { HostGroup, Host } from "@/lib/schema"

interface Props {
  group: HostGroup | null
  base: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ManageGroupSheet({ group, base, open, onOpenChange }: Props) {
  const router = useRouter()
  const [saveError,     setSaveError]     = useState("")
  const [saveSuccess,   setSaveSuccess]   = useState("")
  const [saving,        setSaving]        = useState(false)
  const [regenPwd,      setRegenPwd]      = useState(false)
  const [newPassword,   setNewPassword]   = useState<string | null>(null)
  const [deleting,      setDeleting]      = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [members,       setMembers]       = useState<Host[]>([])
  const [allHosts,      setAllHosts]      = useState<Host[]>([])
  const [membersTab,    setMembersTab]    = useState(false)
  const [removing,      setRemoving]      = useState<number | null>(null)
  const [adding,        setAdding]        = useState<number | null>(null)

  useEffect(() => {
    if (!open || !group) return
    setSaveError(""); setSaveSuccess(""); setConfirmDelete(false); setNewPassword(null)
    setMembersTab(false)
  }, [open, group?.id])

  async function fetchMembers() {
    if (!group) return
    const [groupHosts, hosts] = await Promise.all([getGroupHosts(group.id), getHosts()])
    setMembers(groupHosts)
    setAllHosts(hosts)
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!group) return
    setSaveError(""); setSaveSuccess(""); setSaving(true)
    const result = await updateGroup(group.id, new FormData(e.currentTarget))
    if (result?.error) setSaveError(result.error)
    else { setSaveSuccess("Saved"); router.refresh() }
    setSaving(false)
  }

  async function handleRegenPassword() {
    if (!group) return
    setRegenPwd(true)
    const result = await regenerateGroupPassword(group.id)
    setNewPassword(result.password)
    setRegenPwd(false)
  }

  async function handleDelete() {
    if (!group) return
    setDeleting(true)
    await removeGroup(group.id)
    onOpenChange(false)
    router.refresh()
  }

  async function handleRemoveMember(hostId: number) {
    setRemoving(hostId)
    await assignHostToGroup(hostId, null)
    await fetchMembers()
    router.refresh()
    setRemoving(null)
  }

  async function handleAddMember(hostId: number) {
    if (!group) return
    setAdding(hostId)
    await assignHostToGroup(hostId, group.id)
    await fetchMembers()
    router.refresh()
    setAdding(null)
  }

  if (!group) return null

  const memberIds = new Set(members.map(h => h.id))
  const unassigned = allHosts.filter(h => !h.groupId && !memberIds.has(h.id))

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="truncate text-base pr-8">{group.name}</SheetTitle>
          {group.description && (
            <SheetDescription>{group.description}</SheetDescription>
          )}
        </SheetHeader>

        <div className="px-6 pb-6">
          <Tabs
            defaultValue="settings"
            onValueChange={v => {
              if (v === "members" && !membersTab) {
                setMembersTab(true)
                fetchMembers()
              }
            }}
          >
            <TabsList className="w-full">
              <TabsTrigger value="settings" className="flex-1">Settings</TabsTrigger>
              <TabsTrigger value="members"  className="flex-1">Members</TabsTrigger>
            </TabsList>

            {/* ── Settings ─────────────────────────────────────── */}
            <TabsContent value="settings" className="mt-4 space-y-6">
              <form onSubmit={handleSave} autoComplete="off">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="name">Name</FieldLabel>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={group.name}
                      required
                      disabled={saving}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="description">Description</FieldLabel>
                    <Textarea
                      id="description"
                      name="description"
                      defaultValue={group.description ?? ""}
                      rows={2}
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

              {/* Credentials */}
              <div className="space-y-2.5">
                <p className="text-sm font-medium">Group credentials</p>
                <p className="text-xs text-muted-foreground">
                  Use these with Basic Auth and <code className="font-mono">?hostname=</code> to update any host in this group.
                </p>
                <div className="border border-border divide-y divide-border">
                  <div className="flex items-center justify-between gap-4 px-3 py-2">
                    <span className="text-xs text-muted-foreground shrink-0">Username</span>
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-xs">{group.username ?? "—"}</code>
                      {group.username && <CopyTokenButton text={group.username} label="Copy" />}
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
                  Example: <code className="font-mono">https://username:password@{base}/api/update?hostname=home.{base}</code>
                </p>
              </div>

              <Separator />

              {/* Danger zone */}
              <div className="space-y-3">
                <p className="text-xs font-mono uppercase tracking-wide text-destructive">Danger zone</p>
                {confirmDelete ? (
                  <div className="border border-destructive/30 bg-destructive/5 p-3 space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Delete group <span className="font-medium text-foreground">{group.name}</span>?
                      Member hosts will be unassigned but not deleted.
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
                    Delete group
                  </Button>
                )}
              </div>
            </TabsContent>

            {/* ── Members ──────────────────────────────────────── */}
            <TabsContent value="members" className="mt-4 space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Member hosts</p>
                {members.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center border border-border">
                    No hosts assigned to this group yet.
                  </p>
                ) : (
                  <div className="border border-border divide-y divide-border">
                    {members.map(h => (
                      <div key={h.id} className="flex items-center justify-between gap-3 px-3 py-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`size-1.5 rounded-full shrink-0 ${
                              !h.active ? "bg-muted-foreground/25" :
                              h.lastSeenAt && (Date.now() - new Date(h.lastSeenAt).getTime()) < 10 * 60 * 1000
                                ? "bg-green-500"
                                : "bg-muted-foreground/40"
                            }`}
                          />
                          <span className="text-xs font-mono truncate">{h.subdomain}.{base}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-muted-foreground hover:text-destructive shrink-0"
                          onClick={() => handleRemoveMember(h.id)}
                          disabled={removing === h.id}
                        >
                          {removing === h.id ? "Removing…" : "Remove"}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {unassigned.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Add hosts</p>
                  <div className="border border-border divide-y divide-border">
                    {unassigned.map(h => (
                      <div key={h.id} className="flex items-center justify-between gap-3 px-3 py-2">
                        <span className="text-xs font-mono truncate">{h.subdomain}.{base}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs shrink-0"
                          onClick={() => handleAddMember(h.id)}
                          disabled={adding === h.id}
                        >
                          {adding === h.id ? "Adding…" : "Add"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}
