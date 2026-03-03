import { db } from "./db"
import { clients, teams, teamMembers } from "./schema"
import { eq, and } from "drizzle-orm"
import type { TeamRole } from "./schema"

export type WorkspaceContext =
  | { type: "personal"; clientId: number; plan: string; slug: string }
  | { type: "team"; teamId: number; plan: string; slug: string; role: TeamRole }

export async function resolveWorkspace(
  slug: string,
  clientId: number,
): Promise<WorkspaceContext | null> {
  // Check clients first
  const client = await db.query.clients.findFirst({
    where: eq(clients.slug, slug),
  })
  if (client) {
    if (client.id !== clientId) return null
    return { type: "personal", clientId: client.id, plan: client.plan, slug }
  }

  // Check teams
  const team = await db.query.teams.findFirst({
    where: eq(teams.slug, slug),
  })
  if (!team) return null

  const membership = await db.query.teamMembers.findFirst({
    where: and(
      eq(teamMembers.teamId, team.id),
      eq(teamMembers.clientId, clientId),
      eq(teamMembers.accepted, true),
    ),
  })
  if (!membership) return null

  return { type: "team", teamId: team.id, plan: team.plan, slug, role: membership.role as TeamRole }
}

export async function getUserWorkspaces(clientId: number): Promise<WorkspaceContext[]> {
  const workspaces: WorkspaceContext[] = []

  const client = await db.query.clients.findFirst({
    where: eq(clients.id, clientId),
  })
  if (client?.slug) {
    workspaces.push({ type: "personal", clientId: client.id, plan: client.plan, slug: client.slug })
  }

  const memberships = await db.query.teamMembers.findMany({
    where: and(eq(teamMembers.clientId, clientId), eq(teamMembers.accepted, true)),
    orderBy: (m, { asc }) => [asc(m.createdAt)],
  })

  for (const membership of memberships) {
    const team = await db.query.teams.findFirst({ where: eq(teams.id, membership.teamId) })
    if (team?.slug) {
      workspaces.push({
        type: "team",
        teamId: team.id,
        plan: team.plan,
        slug: team.slug,
        role: membership.role as TeamRole,
      })
    }
  }

  return workspaces
}
