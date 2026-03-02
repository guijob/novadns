"use server"

import { cookies } from "next/headers"
import { eq, and } from "drizzle-orm"
import { db } from "./db"
import { teamMembers, teams } from "./schema"
import type { Team, TeamRole } from "./schema"

const COOKIE = "nova_team"

export interface TeamContext {
  teamId: number
  role:   TeamRole
  team:   Team
}

export async function getTeamContext(clientId: number): Promise<TeamContext | null> {
  const jar    = await cookies()
  const raw    = jar.get(COOKIE)?.value
  if (!raw) return null
  const teamId = parseInt(raw)
  if (isNaN(teamId)) return null

  const member = await db.query.teamMembers.findFirst({
    where: and(
      eq(teamMembers.teamId, teamId),
      eq(teamMembers.clientId, clientId),
      eq(teamMembers.accepted, true),
    ),
  })
  if (!member) return null

  const team = await db.query.teams.findFirst({ where: eq(teams.id, teamId) })
  if (!team) return null

  return { teamId, role: member.role as TeamRole, team }
}

export async function setTeamCookie(teamId: number | null) {
  const jar = await cookies()
  if (teamId === null) {
    jar.delete(COOKIE)
  } else {
    jar.set(COOKIE, String(teamId), {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      path:     "/",
      maxAge:   60 * 60 * 24 * 365,
    })
  }
}

export async function getUserTeams(clientId: number) {
  const memberships = await db.query.teamMembers.findMany({
    where: and(
      eq(teamMembers.clientId, clientId),
      eq(teamMembers.accepted, true),
    ),
  })
  if (memberships.length === 0) return []

  const teamIds = memberships.map(m => m.teamId)
  const allTeams = await Promise.all(
    teamIds.map(id => db.query.teams.findFirst({ where: eq(teams.id, id) }))
  )

  return memberships.map((m, i) => ({
    team: allTeams[i]!,
    role: m.role as TeamRole,
  })).filter(t => t.team)
}
