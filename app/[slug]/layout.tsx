import { cookies } from "next/headers"
import { redirect, notFound } from "next/navigation"
import { count, eq, and, isNull } from "drizzle-orm"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { hosts } from "@/lib/schema"
import { resolveWorkspace, getUserWorkspaces } from "@/lib/workspace"
import { DashboardShell } from "@/components/sidebar"

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const session = await getSession()
  if (!session) redirect("/login")

  const workspace = await resolveWorkspace(slug, session.id)
  if (!workspace) notFound()

  // Count active hosts in this workspace
  const hostWhere =
    workspace.type === "team"
      ? and(eq(hosts.teamId, workspace.teamId), eq(hosts.active, true))
      : and(eq(hosts.clientId, workspace.clientId), isNull(hosts.teamId), eq(hosts.active, true))

  const [{ value: activeCount }] = await db
    .select({ value: count() })
    .from(hosts)
    .where(hostWhere)

  const userWorkspaces = await getUserWorkspaces(session.id)
  const jar = await cookies()
  const sidebarOpen = jar.get("sidebar_state")?.value !== "false"

  return (
    <DashboardShell
      slug={slug}
      workspace={workspace}
      email={session.email}
      userName={session.name}
      activeCount={activeCount}
      workspaces={userWorkspaces}
      sidebarOpen={sidebarOpen}
    >
      {children}
    </DashboardShell>
  )
}
