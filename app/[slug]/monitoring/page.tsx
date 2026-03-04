import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { resolveWorkspace } from "@/lib/workspace"
import { getMonitors, getMonitoringStats, getAlerts, getStaleHosts, getWorkspaceUpdateActivity } from "@/lib/monitoring-actions"
import { getMonitoringLimits } from "@/lib/plans"
import { MonitoringOverview } from "./monitoring-overview"

export const metadata: Metadata = {
  title: "Monitoring — NovaDNS",
  robots: { index: false },
}

export default async function MonitoringPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const session = await getSession()
  if (!session) redirect("/login")

  const workspace = await resolveWorkspace(slug, session.id)
  if (!workspace) redirect("/login")

  const limits = getMonitoringLimits(workspace.plan)

  const [monitorList, stats, activeAlerts, staleHosts, updateActivity] = await Promise.all([
    getMonitors(slug),
    getMonitoringStats(slug),
    getAlerts(slug, "active"),
    getStaleHosts(slug),
    getWorkspaceUpdateActivity(slug, limits.activeProbing ? 7 : 1),
  ])

  const canManage = workspace.type === "personal" || workspace.role !== "member"

  return (
    <MonitoringOverview
      slug={slug}
      monitors={monitorList}
      stats={stats}
      activeAlerts={activeAlerts}
      staleHosts={staleHosts}
      updateActivity={updateActivity}
      plan={workspace.plan}
      limits={limits}
      canManage={canManage}
    />
  )
}
