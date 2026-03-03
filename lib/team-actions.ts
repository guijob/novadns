"use server"

import { randomBytes } from "crypto"
import { eq, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { db } from "./db"
import { teams, teamMembers, hosts, hostGroups } from "./schema"
import { getSession } from "./auth"
import { sendTeamInviteEmail } from "./email"
import { generateSlug, findAvailableSlug } from "./slug"
import type { TeamRole } from "./schema"

// ── Permission helpers ────────────────────────────────────────────

async function canManageMembers(role: TeamRole) {
  return role === "owner" || role === "admin"
}

export async function canManageHosts(role: TeamRole) {
  return role === "owner" || role === "admin"
}

// Resolve the caller's membership for a given teamId
async function getMembership(teamId: number, clientId: number) {
  return db.query.teamMembers.findFirst({
    where: and(
      eq(teamMembers.teamId, teamId),
      eq(teamMembers.clientId, clientId),
      eq(teamMembers.accepted, true),
    ),
  })
}

// ── Create team ───────────────────────────────────────────────────

export async function createTeam(formData: FormData) {
  const session = await getSession()
  if (!session) redirect("/login")

  const name = String(formData.get("name") ?? "").trim()
  if (!name) return { error: "Team name is required" }
  if (name.length > 100) return { error: "Team name too long" }

  const base = generateSlug(name)
  const slug = await findAvailableSlug(base)

  const [team] = await db.insert(teams).values({ name, slug }).returning()

  await db.insert(teamMembers).values({
    teamId:   team.id,
    clientId: session.id,
    email:    session.email,
    role:     "owner",
    accepted: true,
  })

  revalidatePath("/")
  return { ok: true, teamId: team.id, teamSlug: slug }
}

// ── Invite member ─────────────────────────────────────────────────

export async function inviteMember(teamId: number, formData: FormData) {
  const session = await getSession()
  if (!session) redirect("/login")

  const membership = await getMembership(teamId, session.id)
  if (!membership) return { error: "No access to this team" }
  if (!await canManageMembers(membership.role as TeamRole)) return { error: "Insufficient permissions" }

  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const role  = (String(formData.get("role") ?? "member")) as TeamRole

  if (!email) return { error: "Email is required" }
  if (!["admin", "member"].includes(role)) return { error: "Invalid role" }
  if (membership.role === "admin" && role === "admin") return { error: "Admins can only invite members" }

  const existing = await db.query.teamMembers.findFirst({
    where: and(eq(teamMembers.teamId, teamId), eq(teamMembers.email, email)),
  })
  if (existing) return { error: "This email has already been invited" }

  const inviteToken = randomBytes(32).toString("hex")

  await db.insert(teamMembers).values({
    teamId,
    email,
    role,
    inviteToken,
    accepted: false,
  })

  const team = await db.query.teams.findFirst({ where: eq(teams.id, teamId) })
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  await sendTeamInviteEmail(email, session.name, team?.name ?? "", `${appUrl}/invite/${inviteToken}`)

  revalidatePath(`/${team?.slug ?? ""}/team`)
  return { ok: true }
}

// ── Accept invite ─────────────────────────────────────────────────

export async function acceptInvite(token: string) {
  const session = await getSession()
  if (!session) redirect(`/login?next=/invite/${token}`)

  const invite = await db.query.teamMembers.findFirst({
    where: eq(teamMembers.inviteToken, token),
  })

  if (!invite || invite.accepted)                           return { error: "Invalid or expired invite" }
  if (invite.email !== session.email.toLowerCase())         return { error: "This invite was sent to a different email address" }

  await db.update(teamMembers)
    .set({ clientId: session.id, accepted: true, inviteToken: null })
    .where(eq(teamMembers.id, invite.id))

  const team = await db.query.teams.findFirst({ where: eq(teams.id, invite.teamId) })
  revalidatePath("/")
  return { ok: true, teamId: invite.teamId, teamSlug: team?.slug ?? null }
}

// ── Update member role ────────────────────────────────────────────

export async function updateMemberRole(teamId: number, memberId: number, role: TeamRole) {
  const session = await getSession()
  if (!session) redirect("/login")

  const membership = await getMembership(teamId, session.id)
  if (!membership || membership.role !== "owner") return { error: "Only the owner can change roles" }

  const member = await db.query.teamMembers.findFirst({
    where: and(eq(teamMembers.id, memberId), eq(teamMembers.teamId, teamId)),
  })
  if (!member) return { error: "Member not found" }
  if (member.clientId === session.id) return { error: "You cannot change your own role" }

  await db.update(teamMembers).set({ role }).where(eq(teamMembers.id, memberId))
  return { ok: true }
}

// ── Remove member ─────────────────────────────────────────────────

export async function removeMember(teamId: number, memberId: number) {
  const session = await getSession()
  if (!session) redirect("/login")

  const membership = await getMembership(teamId, session.id)
  if (!membership || !await canManageMembers(membership.role as TeamRole)) return { error: "Insufficient permissions" }

  const member = await db.query.teamMembers.findFirst({
    where: and(eq(teamMembers.id, memberId), eq(teamMembers.teamId, teamId)),
  })
  if (!member) return { error: "Member not found" }
  if (member.clientId === session.id) return { error: "You cannot remove yourself" }
  if (member.role === "owner") return { error: "Cannot remove the team owner" }
  if (membership.role === "admin" && member.role === "admin") return { error: "Admins cannot remove other admins" }

  await db.delete(teamMembers).where(eq(teamMembers.id, memberId))
  return { ok: true }
}

// ── Update team name ──────────────────────────────────────────────

export async function updateTeamName(teamId: number, formData: FormData) {
  const session = await getSession()
  if (!session) redirect("/login")

  const membership = await getMembership(teamId, session.id)
  if (!membership || membership.role !== "owner") return { error: "Only the owner can rename the team" }

  const name = String(formData.get("name") ?? "").trim()
  if (!name) return { error: "Name is required" }

  await db.update(teams).set({ name, updatedAt: new Date() }).where(eq(teams.id, teamId))
  return { ok: true }
}

// ── Delete team ───────────────────────────────────────────────────

export async function deleteTeam(teamId: number) {
  const session = await getSession()
  if (!session) redirect("/login")

  const membership = await getMembership(teamId, session.id)
  if (!membership || membership.role !== "owner") return { error: "Only the owner can delete the team" }

  await db.delete(teams).where(eq(teams.id, teamId))

  revalidatePath("/")
  return { ok: true }
}

// ── Leave team ────────────────────────────────────────────────────

export async function leaveTeam(teamId: number) {
  const session = await getSession()
  if (!session) redirect("/login")

  const membership = await getMembership(teamId, session.id)
  if (!membership) return { error: "Not a member of this team" }
  if (membership.role === "owner") return { error: "Transfer ownership before leaving" }

  await db.delete(teamMembers)
    .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.clientId, session.id)))

  revalidatePath("/")
  return { ok: true }
}

// ── Get team members ──────────────────────────────────────────────

export async function getTeamMembers(teamId: number) {
  const session = await getSession()
  if (!session) redirect("/login")

  const membership = await getMembership(teamId, session.id)
  if (!membership) return []

  return db.query.teamMembers.findMany({
    where: eq(teamMembers.teamId, teamId),
    orderBy: (m, { asc }) => [asc(m.createdAt)],
  })
}

// ── Resend invite ─────────────────────────────────────────────────

export async function resendInvite(teamId: number, memberId: number) {
  const session = await getSession()
  if (!session) redirect("/login")

  const membership = await getMembership(teamId, session.id)
  if (!membership || !await canManageMembers(membership.role as TeamRole)) return { error: "Insufficient permissions" }

  const member = await db.query.teamMembers.findFirst({
    where: and(eq(teamMembers.id, memberId), eq(teamMembers.teamId, teamId)),
  })
  if (!member || member.accepted) return { error: "Invite not found or already accepted" }

  const inviteToken = randomBytes(32).toString("hex")
  await db.update(teamMembers).set({ inviteToken }).where(eq(teamMembers.id, memberId))

  const team = await db.query.teams.findFirst({ where: eq(teams.id, teamId) })
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  await sendTeamInviteEmail(member.email, session.name, team?.name ?? "", `${appUrl}/invite/${inviteToken}`)

  return { ok: true }
}
