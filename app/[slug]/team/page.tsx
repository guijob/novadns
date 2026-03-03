import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { resolveWorkspace } from "@/lib/workspace"
import { getTeamMembers } from "@/lib/team-actions"

export const metadata: Metadata = {
  title: "Team — NovaDNS",
  robots: { index: false },
}
import { PAID_PLANS, getPriceId, type PlanKey } from "@/lib/plans"
import { db } from "@/lib/db"
import { teams } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { TeamMembersClient } from "./members-client"

export default async function TeamPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const session = await getSession()
  if (!session) redirect("/login")

  const workspace = await resolveWorkspace(slug, session.id)
  if (!workspace) redirect("/login")

  // Team page only applies to team workspaces
  if (workspace.type !== "team") redirect(`/${slug}`)

  const [members, team] = await Promise.all([
    getTeamMembers(workspace.teamId),
    db.query.teams.findFirst({ where: eq(teams.id, workspace.teamId) }),
  ])
  if (!team) redirect("/login")

  const priceIds: Partial<Record<PlanKey, string>> = {}
  for (const plan of PAID_PLANS) {
    try { priceIds[plan] = getPriceId(plan) } catch { /* env var not set */ }
  }

  return (
    <TeamMembersClient
      teamId={workspace.teamId}
      teamSlug={slug}
      team={team}
      members={members}
      currentUserId={session.id}
      currentUserRole={workspace.role}
      ownerEmail={session.email}
      priceIds={priceIds}
      personalSlug={session.slug ?? ""}
    />
  )
}
