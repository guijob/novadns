"use server"

import { eq, and, count, desc, sql, isNull } from "drizzle-orm"
import { redirect } from "next/navigation"
import { db } from "./db"
import { monitors, monitorChecks, alerts, alertPreferences, hosts, updateLog, teams } from "./schema"
import { getSession } from "./auth"
import { resolveWorkspace } from "./workspace"
import { getMonitoringLimits, isPaidPlan } from "./plans"
import type { WorkspaceContext } from "./workspace"

// ── Helpers ──────────────────────────────────────────────────────

function workspaceToScope(workspace: WorkspaceContext) {
  if (workspace.type === "team") return { teamId: workspace.teamId, clientId: null as null }
  return { teamId: null as null, clientId: workspace.clientId }
}

function monitorScope(scope: { teamId: number | null; clientId: number | null }) {
  if (scope.teamId !== null) return eq(monitors.teamId, scope.teamId)
  return and(eq(monitors.clientId, scope.clientId!), isNull(monitors.teamId))
}

function alertScope(scope: { teamId: number | null; clientId: number | null }) {
  if (scope.teamId !== null) return eq(alerts.teamId, scope.teamId)
  return and(eq(alerts.clientId, scope.clientId!), isNull(alerts.teamId))
}

async function getWorkspace(slug: string, session: NonNullable<Awaited<ReturnType<typeof getSession>>>) {
  const workspace = await resolveWorkspace(slug, session.id)
  if (!workspace) redirect("/login")
  return workspace
}

async function verifyMonitorAccess(monitorId: number, session: NonNullable<Awaited<ReturnType<typeof getSession>>>) {
  const monitor = await db.query.monitors.findFirst({ where: eq(monitors.id, monitorId) })
  if (!monitor) return null
  if (monitor.clientId === session.id) return monitor
  if (monitor.teamId !== null) {
    const { teamMembers } = await import("./schema")
    const membership = await db.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.teamId, monitor.teamId),
        eq(teamMembers.clientId, session.id),
        eq(teamMembers.accepted, true),
      ),
    })
    if (membership) return monitor
  }
  return null
}

// ── Monitor CRUD ─────────────────────────────────────────────────

export async function getMonitors(slug: string) {
  const session = await getSession()
  if (!session) redirect("/login")

  const workspace = await getWorkspace(slug, session)
  const scope = workspaceToScope(workspace)

  const monitorList = await db.query.monitors.findMany({
    where: monitorScope(scope),
    orderBy: (m, { desc }) => [desc(m.createdAt)],
  })

  // Attach host info
  const hostIds = [...new Set(monitorList.map(m => m.hostId))]
  const hostRows = hostIds.length > 0
    ? await db.query.hosts.findMany({
        where: sql`${hosts.id} IN (${sql.join(hostIds.map(id => sql`${id}`), sql`, `)})`,
      })
    : []
  const hostMap = new Map(hostRows.map(h => [h.id, h]))

  return monitorList.map(m => ({
    ...m,
    host: hostMap.get(m.hostId) ?? null,
  }))
}

export async function getMonitorDetail(monitorId: number) {
  const session = await getSession()
  if (!session) redirect("/login")

  const monitor = await verifyMonitorAccess(monitorId, session)
  if (!monitor) return null

  const recentChecks = await db.query.monitorChecks.findMany({
    where: eq(monitorChecks.monitorId, monitorId),
    orderBy: (c, { desc }) => [desc(c.checkedAt)],
    limit: 100,
  })

  const host = await db.query.hosts.findFirst({ where: eq(hosts.id, monitor.hostId) })

  return { monitor, checks: recentChecks, host }
}

export async function createMonitor(
  slug: string,
  hostId: number,
  config: {
    type: "http" | "tcp"
    httpUrl?: string
    httpMethod?: string
    httpExpectedStatus?: number
    tcpPort?: number
    intervalSeconds?: number
    timeoutSeconds?: number
    retries?: number
  },
) {
  const session = await getSession()
  if (!session) redirect("/login")

  const workspace = await getWorkspace(slug, session)
  const scope = workspaceToScope(workspace)
  const limits = getMonitoringLimits(workspace.plan)

  // Check if active probing is allowed
  if (!limits.activeProbing) {
    return { error: "Active monitoring requires a paid plan" }
  }

  // Check monitor count limit
  const [{ value: monitorCount }] = await db.select({ value: count() }).from(monitors)
    .where(monitorScope(scope))
  if (monitorCount >= limits.maxMonitors) {
    return { error: `Monitor limit of ${limits.maxMonitors} reached` }
  }

  // Validate host ownership
  const host = await db.query.hosts.findFirst({ where: eq(hosts.id, hostId) })
  if (!host) return { error: "Host not found" }
  if (scope.teamId !== null && host.teamId !== scope.teamId) return { error: "Host not found" }
  if (scope.clientId !== null && host.clientId !== scope.clientId) return { error: "Host not found" }

  // Validate interval
  const interval = Math.max(limits.minInterval, config.intervalSeconds ?? 300)
  const timeout = Math.max(5, Math.min(30, config.timeoutSeconds ?? 10))
  const retries = Math.max(1, Math.min(5, config.retries ?? 2))

  const [inserted] = await db.insert(monitors).values({
    hostId,
    clientId: scope.clientId,
    teamId: scope.teamId,
    type: config.type,
    httpUrl: config.type === "http" ? config.httpUrl ?? null : null,
    httpMethod: config.type === "http" ? config.httpMethod ?? "GET" : null,
    httpExpectedStatus: config.type === "http" ? config.httpExpectedStatus ?? 200 : null,
    tcpPort: config.type === "tcp" ? config.tcpPort ?? null : null,
    intervalSeconds: interval,
    timeoutSeconds: timeout,
    retries,
  }).returning()

  return { ok: true, monitor: inserted }
}

export async function updateMonitor(
  monitorId: number,
  config: {
    httpUrl?: string
    httpMethod?: string
    httpExpectedStatus?: number
    tcpPort?: number
    intervalSeconds?: number
    timeoutSeconds?: number
    retries?: number
    enabled?: boolean
  },
) {
  const session = await getSession()
  if (!session) redirect("/login")

  const monitor = await verifyMonitorAccess(monitorId, session)
  if (!monitor) return { error: "Not found" }

  // Get plan limits
  let plan = session.plan
  if (monitor.teamId !== null) {
    const team = await db.query.teams.findFirst({ where: eq(teams.id, monitor.teamId) })
    if (team) plan = team.plan
  }
  const limits = getMonitoringLimits(plan)

  const updates: Record<string, unknown> = { updatedAt: new Date() }

  if (config.httpUrl !== undefined) updates.httpUrl = config.httpUrl
  if (config.httpMethod !== undefined) updates.httpMethod = config.httpMethod
  if (config.httpExpectedStatus !== undefined) updates.httpExpectedStatus = config.httpExpectedStatus
  if (config.tcpPort !== undefined) updates.tcpPort = config.tcpPort
  if (config.intervalSeconds !== undefined) updates.intervalSeconds = Math.max(limits.minInterval, config.intervalSeconds)
  if (config.timeoutSeconds !== undefined) updates.timeoutSeconds = Math.max(5, Math.min(30, config.timeoutSeconds))
  if (config.retries !== undefined) updates.retries = Math.max(1, Math.min(5, config.retries))
  if (config.enabled !== undefined) updates.enabled = config.enabled

  await db.update(monitors).set(updates).where(eq(monitors.id, monitorId))

  return { ok: true }
}

export async function deleteMonitor(monitorId: number) {
  const session = await getSession()
  if (!session) redirect("/login")

  const monitor = await verifyMonitorAccess(monitorId, session)
  if (!monitor) return { error: "Not found" }

  await db.delete(monitors).where(eq(monitors.id, monitorId))
  return { ok: true }
}

// ── Alerts ───────────────────────────────────────────────────────

export async function getAlerts(slug: string, status?: "active" | "resolved") {
  const session = await getSession()
  if (!session) redirect("/login")

  const workspace = await getWorkspace(slug, session)
  const scope = workspaceToScope(workspace)

  const conditions = [alertScope(scope)]
  if (status) conditions.push(eq(alerts.status, status))

  return db.query.alerts.findMany({
    where: and(...conditions),
    orderBy: (a, { desc }) => [desc(a.createdAt)],
    limit: 50,
  })
}

export async function resolveAlert(alertId: number) {
  const session = await getSession()
  if (!session) redirect("/login")

  const alert = await db.query.alerts.findFirst({ where: eq(alerts.id, alertId) })
  if (!alert) return { error: "Not found" }

  // Verify access
  if (alert.clientId !== session.id && alert.teamId === null) return { error: "Not found" }

  await db.update(alerts).set({
    status: "resolved",
    resolvedAt: new Date(),
  }).where(eq(alerts.id, alertId))

  return { ok: true }
}

// ── Update activity (for all plans) ──────────────────────────────

export async function getUpdateActivity(hostId: number, days: number = 1) {
  const session = await getSession()
  if (!session) redirect("/login")

  // Verify host access
  const host = await db.query.hosts.findFirst({ where: eq(hosts.id, hostId) })
  if (!host) return []
  if (host.clientId !== session.id && host.teamId === null) return []

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const activity = await db
    .select({
      hour: sql<string>`date_trunc('hour', ${updateLog.createdAt})`,
      count: count(),
    })
    .from(updateLog)
    .where(and(
      eq(updateLog.hostId, hostId),
      sql`${updateLog.createdAt} > ${since}`,
    ))
    .groupBy(sql`date_trunc('hour', ${updateLog.createdAt})`)
    .orderBy(sql`date_trunc('hour', ${updateLog.createdAt})`)

  return activity.map(row => ({
    time: row.hour,
    updates: row.count,
  }))
}

export async function getWorkspaceUpdateActivity(slug: string, days: number = 1) {
  const session = await getSession()
  if (!session) redirect("/login")

  const workspace = await getWorkspace(slug, session)
  const scope = workspaceToScope(workspace)

  // Get all host IDs for this workspace
  const hostWhere = scope.teamId !== null
    ? eq(hosts.teamId, scope.teamId)
    : and(eq(hosts.clientId, scope.clientId!), isNull(hosts.teamId))

  const workspaceHosts = await db.query.hosts.findMany({
    where: hostWhere,
    columns: { id: true },
  })
  const hostIds = workspaceHosts.map(h => h.id)
  if (hostIds.length === 0) return []

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const activity = await db
    .select({
      hour: sql<string>`date_trunc('hour', ${updateLog.createdAt})`,
      count: count(),
    })
    .from(updateLog)
    .where(and(
      sql`${updateLog.hostId} IN (${sql.join(hostIds.map(id => sql`${id}`), sql`, `)})`,
      sql`${updateLog.createdAt} > ${since}`,
    ))
    .groupBy(sql`date_trunc('hour', ${updateLog.createdAt})`)
    .orderBy(sql`date_trunc('hour', ${updateLog.createdAt})`)

  return activity.map(row => ({
    time: row.hour,
    updates: row.count,
  }))
}

// ── Stale hosts ──────────────────────────────────────────────────

export async function getStaleHosts(slug: string) {
  const session = await getSession()
  if (!session) redirect("/login")

  const workspace = await getWorkspace(slug, session)
  const scope = workspaceToScope(workspace)

  const hostWhere = scope.teamId !== null
    ? eq(hosts.teamId, scope.teamId)
    : and(eq(hosts.clientId, scope.clientId!), isNull(hosts.teamId))

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

  return db.query.hosts.findMany({
    where: and(
      hostWhere,
      eq(hosts.active, true),
      sql`${hosts.lastSeenAt} < ${oneHourAgo}`,
    ),
    orderBy: (h, { asc }) => [asc(h.lastSeenAt)],
  })
}

// ── Alert preferences ────────────────────────────────────────────

export async function getAlertPreferences(slug: string) {
  const session = await getSession()
  if (!session) redirect("/login")

  const workspace = await getWorkspace(slug, session)
  const scope = workspaceToScope(workspace)

  const prefWhere = scope.teamId !== null
    ? eq(alertPreferences.teamId, scope.teamId)
    : and(eq(alertPreferences.clientId, scope.clientId!), isNull(alertPreferences.teamId))

  return db.query.alertPreferences.findMany({ where: prefWhere })
}

export async function updateAlertPreferences(
  slug: string,
  prefs: { channel: "email" | "webhook" | "in_app"; enabled: boolean }[],
) {
  const session = await getSession()
  if (!session) redirect("/login")

  const workspace = await getWorkspace(slug, session)
  const scope = workspaceToScope(workspace)
  const limits = getMonitoringLimits(workspace.plan)

  const prefWhere = scope.teamId !== null
    ? eq(alertPreferences.teamId, scope.teamId)
    : and(eq(alertPreferences.clientId, scope.clientId!), isNull(alertPreferences.teamId))

  // Delete existing prefs
  await db.delete(alertPreferences).where(prefWhere)

  // Insert new ones (filtered by plan)
  const validPrefs = prefs.filter(p => limits.alertChannels.includes(p.channel))
  if (validPrefs.length > 0) {
    await db.insert(alertPreferences).values(
      validPrefs.map(p => ({
        clientId: scope.clientId,
        teamId: scope.teamId,
        channel: p.channel,
        enabled: p.enabled,
      })),
    )
  }

  return { ok: true }
}

// ── Monitoring stats ─────────────────────────────────────────────

export async function getMonitoringStats(slug: string) {
  const session = await getSession()
  if (!session) redirect("/login")

  const workspace = await getWorkspace(slug, session)
  const scope = workspaceToScope(workspace)

  const monitorList = await db.query.monitors.findMany({
    where: monitorScope(scope),
  })

  const [{ value: activeAlertCount }] = await db.select({ value: count() }).from(alerts)
    .where(and(alertScope(scope), eq(alerts.status, "active")))

  const total = monitorList.length
  const upCount = monitorList.filter(m => m.status === "up").length
  const overallUptime = total > 0
    ? monitorList.reduce((sum, m) => sum + (parseFloat(m.uptimePercent ?? "0") || 0), 0) / total
    : 0

  // Average response time from recent checks
  let avgResponseTime = 0
  if (total > 0) {
    const monitorIds = monitorList.map(m => m.id)
    const recentChecks = await db
      .select({ avg: sql<string>`avg(${monitorChecks.responseTime})` })
      .from(monitorChecks)
      .where(and(
        sql`${monitorChecks.monitorId} IN (${sql.join(monitorIds.map(id => sql`${id}`), sql`, `)})`,
        sql`${monitorChecks.checkedAt} > ${new Date(Date.now() - 24 * 60 * 60 * 1000)}`,
      ))
    avgResponseTime = parseFloat(recentChecks[0]?.avg ?? "0") || 0
  }

  return {
    totalMonitors: total,
    overallUptime: overallUptime.toFixed(1),
    activeAlerts: activeAlertCount,
    avgResponseTime: Math.round(avgResponseTime),
  }
}
