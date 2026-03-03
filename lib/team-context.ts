"use server"

import { eq, and } from "drizzle-orm"
import { db } from "./db"
import { teamMembers, teams } from "./schema"
import type { TeamRole } from "./schema"

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
