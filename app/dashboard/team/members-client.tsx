"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserIcon, MailIcon, Delete01Icon, CrownIcon, ShieldUserIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

export function TeamMembersClient({
  team,
  members,
  currentUserId,
  currentUserRole,
}: {
  team: Team
  members: TeamMember[]
  currentUserId: number
  currentUserRole: TeamRole
}) {
  const [pending, startTransition] = useTransition()
  const [teamName, setTeamName] = useState(team.name)

  const canManage = currentUserRole === "owner" || currentUserRole === "admin"
  const isOwner = currentUserRole === "owner"

  function handleInvite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await inviteMember(fd)
      if ("error" in res) toast.error(res.error)
      else {
        toast.success("Invitation sent")
        ;(e.target as HTMLFormElement).reset()
      }
    })
  }

  function handleUpdateTeamName(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await updateTeamName(fd)
      if ("error" in res) toast.error(res.error)
      else toast.success("Team name updated")
    })
  }

  function handleRemoveMember(id: number) {
    startTransition(async () => {
      const res = await removeMember(id)
      if ("error" in res) toast.error(res.error)
      else toast.success("Member removed")
    })
  }

  function handleRoleChange(memberId: number, role: string) {
    startTransition(async () => {
      const res = await updateMemberRole(memberId, role as TeamRole)
      if ("error" in res) toast.error(res.error)
      else toast.success("Role updated")
    })
  }

  function handleResendInvite(memberId: number) {
    startTransition(async () => {
      const res = await resendInvite(memberId)
      if ("error" in res) toast.error(res.error)
      else toast.success("Invitation resent")
    })
  }

  function handleLeaveTeam() {
    startTransition(async () => {
      const res = await leaveTeam()
      if ("error" in res) toast.error(res.error)
    })
  }

  function handleDeleteTeam() {
    startTransition(async () => {
      const res = await deleteTeam()
      if ("error" in res) toast.error(res.error)
    })
  }

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

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Team</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your team workspace and members.</p>
      </div>

      {/* Team name */}
      {isOwner && (
        <section className="space-y-3">
          <h2 className="font-semibold">Team name</h2>
          <form onSubmit={handleUpdateTeamName} className="flex gap-2">
            <Input
              name="name"
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              placeholder="Team name"
              className="max-w-xs"
            />
            <Button type="submit" disabled={pending} variant="outline">
              Save
            </Button>
          </form>
        </section>
      )}

      {/* Members list */}
      <section className="space-y-3">
        <h2 className="font-semibold">Members</h2>
        <div className="rounded-md border divide-y">
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

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {/* Role change — owner only, not self, not pending */}
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

                  {/* Resend invite */}
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

                  {/* Remove member */}
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
                            {member.email} will lose access to this team workspace.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRemoveMember(member.id)} className="bg-destructive hover:bg-destructive/90">
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
      </section>

      {/* Invite */}
      {canManage && (
        <section className="space-y-3">
          <h2 className="font-semibold">Invite member</h2>
          <form onSubmit={handleInvite} className="flex gap-2">
            <Input name="email" type="email" placeholder="colleague@example.com" className="max-w-xs" required />
            {isOwner && (
              <Select name="role" defaultValue="member">
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
            )}
            <Button type="submit" disabled={pending}>
              Invite
            </Button>
          </form>
        </section>
      )}

      {/* Danger zone */}
      <section className="space-y-3 pt-4 border-t">
        <h2 className="font-semibold text-destructive">Danger zone</h2>
        <div className="flex flex-col gap-3">
          {!isOwner && (
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button variant="outline" className="w-fit border-destructive text-destructive hover:bg-destructive/10" disabled={pending} />
                }
              >
                Leave team
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Leave team?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will lose access to this team workspace and its hosts.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLeaveTeam} className="bg-destructive hover:bg-destructive/90">
                    Leave
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {isOwner && (
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button variant="outline" className="w-fit border-destructive text-destructive hover:bg-destructive/10" disabled={pending} />
                }
              >
                Delete team
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete team?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the <strong>{team.name}</strong> workspace and all its hosts. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteTeam} className="bg-destructive hover:bg-destructive/90">
                    Delete team
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </section>
    </div>
  )
}
