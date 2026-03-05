"use client"

import { useState, useRef, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserIcon, MailIcon, Delete01Icon, CrownIcon, ShieldUserIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  inviteMember,
  removeMember,
  updateMemberRole,
  resendInvite,
  updateTeamName,
  deleteTeam,
  leaveTeam,
} from "@/lib/team-actions"
import type { Team, TeamMember, TeamRole } from "@/lib/schema"

// ── General: workspace avatar ─────────────────────────────────────

export function WorkspaceAvatarForm({
  slug,
  initialUrl,
  name,
}: {
  slug: string
  initialUrl: string | null
  name: string
}) {
  const [preview, setPreview] = useState<string | null>(initialUrl)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  function resizeToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        const SIZE = 256
        const canvas = document.createElement("canvas")
        canvas.width = SIZE; canvas.height = SIZE
        const ctx = canvas.getContext("2d")!
        const scale = Math.max(SIZE / img.width, SIZE / img.height)
        const w = img.width * scale, h = img.height * scale
        ctx.drawImage(img, (SIZE - w) / 2, (SIZE - h) / 2, w, h)
        URL.revokeObjectURL(url)
        resolve(canvas.toDataURL("image/jpeg", 0.85))
      }
      img.onerror = reject
      img.src = url
    })
  }

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) { setError("Please select an image file"); return }
    setError(""); setSuccess(""); setLoading(true)
    try {
      const dataUrl = await resizeToDataUrl(file)
      setPreview(dataUrl)
      const res = await fetch(`/api/workspace/${slug}/avatar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: dataUrl }),
      })
      const data = await res.json()
      if (res.ok) setSuccess("Avatar updated")
      else setError(data.error ?? "Something went wrong")
    } catch {
      setError("Failed to process image")
    }
    setLoading(false)
  }

  async function handleRemove() {
    setError(""); setSuccess(""); setLoading(true)
    const res = await fetch(`/api/workspace/${slug}/avatar`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarUrl: null }),
    })
    const data = await res.json()
    if (res.ok) { setPreview(null); setSuccess("Avatar removed") }
    else setError(data.error ?? "Something went wrong")
    setLoading(false)
  }

  const initials = name.split(" ").map(p => p[0]).join("").toUpperCase().slice(0, 2)

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50 select-none">
        Workspace avatar
      </p>
      <div className="border border-border px-4 py-4 flex items-center gap-5">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="relative shrink-0 group cursor-pointer"
          title="Click to change avatar"
        >
          <div className="size-16 rounded-full overflow-hidden border-2 border-border bg-muted flex items-center justify-center text-xl font-semibold text-muted-foreground select-none">
            {preview
              ? <img src={preview} alt="Avatar" className="size-full object-cover" />
              : initials}
          </div>
          <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-[10px] font-medium">Change</span>
          </div>
        </button>
        <div className="space-y-1.5 min-w-0">
          <p className="text-xs text-muted-foreground">JPG, PNG or GIF · max 5 MB · resized to 256×256</p>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()} disabled={loading} className="h-7 text-xs">
              {loading ? "Saving…" : "Upload image"}
            </Button>
            {preview && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={loading}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                Remove
              </button>
            )}
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          {success && <p className="text-xs text-green-600 dark:text-green-400">{success}</p>}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = "" }}
        />
      </div>
    </div>
  )
}

// ── General: team name form ────────────────────────────────────────

export function WorkspaceNameForm({
  teamId,
  initialName,
}: {
  teamId: number
  initialName: string
}) {
  const [name, setName] = useState(initialName)
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await updateTeamName(teamId, fd)
      if ("error" in res) toast.error(res.error)
      else toast.success("Workspace name updated")
    })
  }

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50 select-none">
        Workspace name
      </p>
      <div className="border border-border divide-y divide-border">
        <div className="grid grid-cols-[140px_1fr] items-center gap-4 px-4 py-3">
          <label className="text-sm text-muted-foreground">Name</label>
          <Input
            name="name"
            form="workspace-name-form"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Workspace name"
            className="max-w-xs"
          />
        </div>
        <div className="flex items-center justify-end px-4 py-3 bg-muted/20">
          <form id="workspace-name-form" onSubmit={handleSubmit}>
            <Button type="submit" size="sm" variant="outline" disabled={pending}>
              Save
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

// ── Members: list + invite ─────────────────────────────────────────

function roleIcon(role: string) {
  if (role === "owner") return CrownIcon
  if (role === "admin") return ShieldUserIcon
  return UserIcon
}

function roleLabel(role: string) {
  if (role === "owner") return "Owner"
  if (role === "admin") return "Admin"
  return "Member"
}

export function WorkspaceMembersSection({
  teamId,
  members,
  currentUserId,
  currentUserRole,
}: {
  teamId: number
  members: TeamMember[]
  currentUserId: number
  currentUserRole: TeamRole
}) {
  const [pending, startTransition] = useTransition()
  const canManage = currentUserRole === "owner" || currentUserRole === "admin"
  const isOwner = currentUserRole === "owner"

  function handleInvite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await inviteMember(teamId, fd)
      if ("error" in res) toast.error(res.error)
      else {
        toast.success("Invitation sent")
        ;(e.target as HTMLFormElement).reset()
      }
    })
  }

  function handleRemove(id: number) {
    startTransition(async () => {
      const res = await removeMember(teamId, id)
      if ("error" in res) toast.error(res.error)
      else toast.success("Member removed")
    })
  }

  function handleRoleChange(memberId: number, role: string) {
    startTransition(async () => {
      const res = await updateMemberRole(teamId, memberId, role as TeamRole)
      if ("error" in res) toast.error(res.error)
      else toast.success("Role updated")
    })
  }

  function handleResendInvite(memberId: number) {
    startTransition(async () => {
      const res = await resendInvite(teamId, memberId)
      if ("error" in res) toast.error(res.error)
      else toast.success("Invitation resent")
    })
  }

  return (
    <div className="space-y-8">
      {/* Member list */}
      <div className="space-y-3">
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50 select-none">
          Members
        </p>
        <div className="border border-border divide-y divide-border">
          {members.map(member => {
            const isSelf = member.clientId === currentUserId
            const isPending = !member.accepted

            return (
              <div key={member.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex items-center justify-center size-8 rounded-full bg-muted text-muted-foreground text-sm font-medium shrink-0">
                  {member.email[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{member.email}</span>
                    {isSelf && <Badge variant="secondary" className="text-xs">You</Badge>}
                    {isPending && <Badge variant="outline" className="text-xs text-muted-foreground">Pending</Badge>}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                    <HugeiconsIcon icon={roleIcon(member.role)} strokeWidth={2} className="size-3" />
                    {roleLabel(member.role)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isOwner && !isSelf && !isPending && (
                    <Select
                      defaultValue={member.role ?? "member"}
                      onValueChange={val => { if (val) handleRoleChange(member.id, val) }}
                      disabled={pending}
                    >
                      <SelectTrigger className="h-8 w-24 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                      </SelectContent>
                    </Select>
                  )}

                  {canManage && isPending && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleResendInvite(member.id)}
                      disabled={pending}
                      title="Resend invite"
                    >
                      <HugeiconsIcon icon={MailIcon} strokeWidth={2} className="size-4" />
                    </Button>
                  )}

                  {canManage && !isSelf && member.role !== "owner" && !(currentUserRole === "admin" && member.role === "admin") && (
                    <AlertDialog>
                      <AlertDialogTrigger
                        render={
                          <Button size="sm" variant="ghost" disabled={pending} title="Remove member" className="text-destructive hover:text-destructive" />
                        }
                      >
                        <HugeiconsIcon icon={Delete01Icon} strokeWidth={2} className="size-4" />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove member?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {member.email} will lose access to this workspace.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRemove(member.id)} className="bg-destructive hover:bg-destructive/90">
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Invite */}
      {canManage && (
        <div className="space-y-3">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50 select-none">
            Invite member
          </p>
          <div className="border border-border divide-y divide-border">
            <div className="grid grid-cols-[140px_1fr] items-center gap-4 px-4 py-3">
              <label className="text-sm text-muted-foreground">Email</label>
              <Input name="email" form="invite-form" type="email" placeholder="colleague@example.com" required className="max-w-xs" />
            </div>
            {isOwner && (
              <div className="grid grid-cols-[140px_1fr] items-center gap-4 px-4 py-3">
                <label className="text-sm text-muted-foreground">Role</label>
                <Select name="role" defaultValue="member">
                  <SelectTrigger className="h-8 w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex items-center justify-end px-4 py-3 bg-muted/20">
              <form id="invite-form" onSubmit={handleInvite}>
                <Button type="submit" size="sm" disabled={pending}>
                  Send invite
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Danger zone ────────────────────────────────────────────────────

export function WorkspaceDangerSection({
  teamId,
  teamName,
  isOwner,
  personalSlug,
}: {
  teamId: number
  teamName: string
  isOwner: boolean
  personalSlug: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function handleLeave() {
    startTransition(async () => {
      const res = await leaveTeam(teamId)
      if ("error" in res) toast.error(res.error)
      else router.push(`/${personalSlug}`)
    })
  }

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteTeam(teamId)
      if ("error" in res) toast.error(res.error)
      else router.push(`/${personalSlug}`)
    })
  }

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50 select-none">
        Danger zone
      </p>
      <div className="border border-destructive/30 divide-y divide-border">
        {!isOwner && (
          <div className="grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Leave workspace</p>
              <p className="text-xs text-muted-foreground mt-0.5">You will lose access to all hosts in this workspace.</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button variant="outline" size="sm" className="border-destructive text-destructive hover:bg-destructive/10 shrink-0" disabled={pending} />
                }
              >
                Leave
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Leave workspace?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will lose access to this workspace and its hosts.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLeave} className="bg-destructive hover:bg-destructive/90">
                    Leave
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
        {isOwner && (
          <div className="grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Delete workspace</p>
              <p className="text-xs text-muted-foreground mt-0.5">Permanently delete <strong>{teamName}</strong> and all its hosts. This cannot be undone.</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button variant="outline" size="sm" className="border-destructive text-destructive hover:bg-destructive/10 shrink-0" disabled={pending} />
                }
              >
                Delete
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete workspace?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete <strong>{teamName}</strong> and all its hosts. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                    Delete workspace
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
    </div>
  )
}
