"use server"

import { randomBytes } from "crypto"
import { eq, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { db } from "./db"
import { teams, teamMembers, hosts, hostGroups } from "./schema"
import { getSession } from "./auth"
import { getTeamContext, setTeamCookie } from "./team-context"
import { sendTeamInviteEmail } from "./email"
import type { TeamRole } from "./schema"

// ── Permission helpers ────────────────────────────────────────────

async function canManageMembers(role: TeamRole) {
  return role === "owner" || role === "admin"
}

export async function canManageHosts(role: TeamRole) {
  return role === "owner" || role === "admin"
}

// ── Create team ───────────────────────────────────────────────────

export async function createTeam(formData: FormData) {
  const session = await getSession()
  if (!session) redirect("/login")

  const name = String(formData.get("name") ?? "").trim()
  if (!name) return { error: "Team name is required" }
  if (name.length > 100) return { error: "Team name too long" }

  const [team] = await db.insert(teams).values({ name }).returning()

  await db.insert(teamMembers).values({
    teamId:   team.id,
    clientId: session.id,
    email:    session.email,
    role:     "owner",
    accepted: true,
  })

  await setTeamCookie(team.id)

  revalidatePath("/dashboard")
  return { ok: true, teamId: team.id }
}

// ── Switch workspace ──────────────────────────────────────────────

export async function switchWorkspace(teamId: number | null) {
  const session = await getSession()
  if (!session) redirect("/login")

  if (teamId !== null) {
    const member = await db.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.teamId, teamId),
        eq(teamMembers.clientId, session.id),
        eq(teamMembers.accepted, true),
      ),
    })
    if (!member) return { error: "Not a member of this team" }
  }

  await setTeamCookie(teamId)
  revalidatePath("/dashboard")
  return { ok: true }
}

// ── Invite member ─────────────────────────────────────────────────

export async function inviteMember(formData: FormData) {
  const session = await getSession()
  if (!session) redirect("/login")

  const ctx = await getTeamContext(session.id)
  if (!ctx) return { error: "No active team" }
  if (!await canManageMembers(ctx.role)) return { error: "Insufficient permissions" }

  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const role  = (String(formData.get("role") ?? "member")) as TeamRole

  if (!email) return { error: "Email is required" }
  if (!["admin", "member"].includes(role)) return { error: "Invalid role" }
  // Admins can only invite members, not other admins
  if (ctx.role === "admin" && role === "admin") return { error: "Admins can only invite members" }

  const existing = await db.query.teamMembers.findFirst({
    where: and(eq(teamMembers.teamId, ctx.teamId), eq(teamMembers.email, email)),
  })
  if (existing) return { error: "This email has already been invited" }

  const inviteToken = randomBytes(32).toString("hex")

  await db.insert(teamMembers).values({
    teamId: ctx.teamId,
    email,
    role,
    inviteToken,
    accepted: false,
  })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  await sendTeamInviteEmail(email, session.name, ctx.team.name, `${appUrl}/invite/${inviteToken}`)

  revalidatePath("/dashboard/team")
  return { ok: true }
}

// ── Accept invite ─────────────────────────────────────────────────

export async function acceptInvite(token: string) {
  const session = await getSession()
  if (!session) redirect(`/login?next=/invite/${token}`)

  const invite = await db.query.teamMembers.findFirst({
    where: eq(teamMembers.inviteToken, token),
  })

  if (!invite || invite.accepted)              return { error: "Invalid or expired invite" }
  if (invite.email !== session.email.toLowerCase()) return { error: "This invite was sent to a different email address" }

  await db.update(teamMembers)
    .set({ clientId: session.id, accepted: true, inviteToken: null })
    .where(eq(teamMembers.id, invite.id))

  await setTeamCookie(invite.teamId)
  revalidatePath("/dashboard")
  return { ok: true, teamId: invite.teamId }
}

// ── Update member role ────────────────────────────────────────────

export async function updateMemberRole(memberId: number, role: TeamRole) {
  const session = await getSession()
  if (!session) redirect("/login")

  const ctx = await getTeamContext(session.id)
  if (!ctx || ctx.role !== "owner") return { error: "Only the owner can change roles" }

  const member = await db.query.teamMembers.findFirst({
    where: and(eq(teamMembers.id, memberId), eq(teamMembers.teamId, ctx.teamId)),
  })
  if (!member) return { error: "Member not found" }
  if (member.clientId === session.id) return { error: "You cannot change your own role" }

  await db.update(teamMembers).set({ role }).where(eq(teamMembers.id, memberId))
  revalidatePath("/dashboard/team")
  return { ok: true }
}

// ── Remove member ─────────────────────────────────────────────────

export async function removeMember(memberId: number) {
  const session = await getSession()
  if (!session) redirect("/login")

  const ctx = await getTeamContext(session.id)
  if (!ctx || !await canManageMembers(ctx.role)) return { error: "Insufficient permissions" }

  const member = await db.query.teamMembers.findFirst({
    where: and(eq(teamMembers.id, memberId), eq(teamMembers.teamId, ctx.teamId)),
  })
  if (!member) return { error: "Member not found" }
  if (member.clientId === session.id) return { error: "You cannot remove yourself" }
  if (member.role === "owner") return { error: "Cannot remove the team owner" }
  // Admins cannot remove other admins
  if (ctx.role === "admin" && member.role === "admin") return { error: "Admins cannot remove other admins" }

  await db.delete(teamMembers).where(eq(teamMembers.id, memberId))
  revalidatePath("/dashboard/team")
  return { ok: true }
}

// ── Update team name ──────────────────────────────────────────────

export async function updateTeamName(formData: FormData) {
  const session = await getSession()
  if (!session) redirect("/login")

  const ctx = await getTeamContext(session.id)
  if (!ctx || ctx.role !== "owner") return { error: "Only the owner can rename the team" }

  const name = String(formData.get("name") ?? "").trim()
  if (!name) return { error: "Name is required" }

  await db.update(teams).set({ name, updatedAt: new Date() }).where(eq(teams.id, ctx.teamId))
  revalidatePath("/dashboard/team")
  return { ok: true }
}

// ── Delete team ───────────────────────────────────────────────────

export async function deleteTeam() {
  const session = await getSession()
  if (!session) redirect("/login")

  const ctx = await getTeamContext(session.id)
  if (!ctx || ctx.role !== "owner") return { error: "Only the owner can delete the team" }

  // Delete all team hosts and groups first (cascade handles it, but also clean DNS)
  await db.delete(teams).where(eq(teams.id, ctx.teamId))
  await setTeamCookie(null)

  revalidatePath("/dashboard")
  return { ok: true }
}

// ── Leave team ────────────────────────────────────────────────────

export async function leaveTeam() {
  const session = await getSession()
  if (!session) redirect("/login")

  const ctx = await getTeamContext(session.id)
  if (!ctx) return { error: "No active team" }
  if (ctx.role === "owner") return { error: "Transfer ownership before leaving" }

  await db.delete(teamMembers)
    .where(and(eq(teamMembers.teamId, ctx.teamId), eq(teamMembers.clientId, session.id)))

  await setTeamCookie(null)
  revalidatePath("/dashboard")
  return { ok: true }
}

// ── Get team members ──────────────────────────────────────────────

export async function getTeamMembers() {
  const session = await getSession()
  if (!session) redirect("/login")

  const ctx = await getTeamContext(session.id)
  if (!ctx) return []

  return db.query.teamMembers.findMany({
    where: eq(teamMembers.teamId, ctx.teamId),
    orderBy: (m, { asc }) => [asc(m.createdAt)],
  })
}

// ── Resend invite ─────────────────────────────────────────────────

export async function resendInvite(memberId: number) {
  const session = await getSession()
  if (!session) redirect("/login")

  const ctx = await getTeamContext(session.id)
  if (!ctx || !await canManageMembers(ctx.role)) return { error: "Insufficient permissions" }

  const member = await db.query.teamMembers.findFirst({
    where: and(eq(teamMembers.id, memberId), eq(teamMembers.teamId, ctx.teamId)),
  })
  if (!member || member.accepted) return { error: "Invite not found or already accepted" }

  const inviteToken = randomBytes(32).toString("hex")
  await db.update(teamMembers).set({ inviteToken }).where(eq(teamMembers.id, memberId))

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  await sendTeamInviteEmail(member.email, session.name, ctx.team.name, `${appUrl}/invite/${inviteToken}`)

  return { ok: true }
}

