import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { eq, and, count, isNull } from "drizzle-orm"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { hosts } from "@/lib/schema"
import { getTeamContext, getUserTeams } from "@/lib/team-context"
import { DashboardShell } from "@/components/sidebar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect("/login")

  const [teamCtx, userTeams] = await Promise.all([
    getTeamContext(session.id),
    getUserTeams(session.id),
  ])

  // Count active hosts in the current workspace
  const hostWhere = teamCtx
    ? and(eq(hosts.teamId, teamCtx.teamId), eq(hosts.active, true))
    : and(eq(hosts.clientId, session.id), isNull(hosts.teamId), eq(hosts.active, true))

  const [{ value: activeCount }] = await db
    .select({ value: count() })
    .from(hosts)
    .where(hostWhere)

  const plan = teamCtx ? teamCtx.team.plan : session.plan

  const cookieStore = await cookies()
  const sidebarOpen = cookieStore.get("sidebar_state")?.value !== "false"

  const teams = userTeams.map(({ team, role }) => ({ id: team.id, name: team.name, role }))

  return (
    <DashboardShell
      email={session.email}
      plan={plan}
      userName={session.name}
      activeCount={activeCount}
      currentTeamId={teamCtx?.teamId ?? null}
      teams={teams}
      sidebarOpen={sidebarOpen}
    >
      {children}
    </DashboardShell>
  )
}
