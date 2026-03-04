import { connect } from "net"
import { eq, and, sql } from "drizzle-orm"
import { db } from "./db"
import { monitorChecks, alerts, alertPreferences, hosts, teams, clients } from "./schema"
import type { Monitor, Host } from "./schema"
import { redis } from "./redis"
import { dispatchWebhook } from "./webhooks"
import { sendMonitorDownEmail, sendMonitorRecoveredEmail } from "./email"
import { getMonitoringLimits } from "./plans"

// ── Check execution ──────────────────────────────────────────────

export async function executeCheck(monitor: Monitor, host: Host): Promise<{ status: "up" | "down"; responseTime: number; statusCode?: number; error?: string }> {
  const ip = host.ipv4 ?? host.ipv6
  if (!ip) return { status: "down", responseTime: 0, error: "No IP address assigned" }

  if (monitor.type === "http") {
    return executeHttpCheck(monitor, ip)
  }
  return executeTcpCheck(monitor, ip)
}

export async function executeHttpCheck(monitor: Monitor, ip: string): Promise<{ status: "up" | "down"; responseTime: number; statusCode?: number; error?: string }> {
  const url = monitor.httpUrl ?? `http://${ip}`
  const method = monitor.httpMethod ?? "GET"
  const expectedStatus = monitor.httpExpectedStatus ?? 200
  const timeoutMs = (monitor.timeoutSeconds ?? 10) * 1000

  const start = Date.now()
  try {
    const res = await fetch(url, {
      method,
      signal: AbortSignal.timeout(timeoutMs),
      redirect: "follow",
      headers: { "User-Agent": "NovaDNS-Monitor/1.0" },
    })
    const responseTime = Date.now() - start
    const ok = res.status === expectedStatus
    return {
      status: ok ? "up" : "down",
      responseTime,
      statusCode: res.status,
      error: ok ? undefined : `Expected ${expectedStatus}, got ${res.status}`,
    }
  } catch (err) {
    return {
      status: "down",
      responseTime: Date.now() - start,
      error: err instanceof Error ? err.message : "Request failed",
    }
  }
}

export async function executeTcpCheck(monitor: Monitor, ip: string): Promise<{ status: "up" | "down"; responseTime: number; error?: string }> {
  const port = monitor.tcpPort
  if (!port) return { status: "down", responseTime: 0, error: "No TCP port configured" }

  const timeoutMs = (monitor.timeoutSeconds ?? 10) * 1000
  const start = Date.now()

  return new Promise((resolve) => {
    const socket = connect({ host: ip, port, timeout: timeoutMs })

    socket.on("connect", () => {
      const responseTime = Date.now() - start
      socket.destroy()
      resolve({ status: "up", responseTime })
    })

    socket.on("timeout", () => {
      socket.destroy()
      resolve({ status: "down", responseTime: Date.now() - start, error: "Connection timed out" })
    })

    socket.on("error", (err) => {
      socket.destroy()
      resolve({ status: "down", responseTime: Date.now() - start, error: err.message })
    })
  })
}

// ── Alert evaluation ─────────────────────────────────────────────

export async function evaluateAlerts(
  monitor: Monitor,
  newStatus: "up" | "down",
  prevStatus: string,
) {
  const ownerId = monitor.teamId ?? monitor.clientId
  if (!ownerId) return

  // Host went down (after exhausting retries)
  if (newStatus === "down" && prevStatus !== "down") {
    const host = await db.query.hosts.findFirst({ where: eq(hosts.id, monitor.hostId) })
    const hostname = host?.subdomain ?? "unknown"
    const base = process.env.BASE_DOMAIN ?? "novaip.link"
    const fqdn = `${hostname}.${base}`
    const message = `${fqdn} is down`

    // Create in-app alert
    await db.insert(alerts).values({
      monitorId: monitor.id,
      clientId: monitor.clientId,
      teamId: monitor.teamId,
      type: "host.down",
      message,
    })

    // Signal SSE
    try {
      await redis.set(`monitors:updated:${ownerId}`, "1", { ex: 90 })
    } catch {}

    // Check alert preferences and deliver
    await deliverAlert(monitor, "down", fqdn, message)
  }

  // Host recovered
  if (newStatus === "up" && prevStatus === "down") {
    const host = await db.query.hosts.findFirst({ where: eq(hosts.id, monitor.hostId) })
    const hostname = host?.subdomain ?? "unknown"
    const base = process.env.BASE_DOMAIN ?? "novaip.link"
    const fqdn = `${hostname}.${base}`

    // Resolve active alerts
    const activeAlerts = await db.query.alerts.findMany({
      where: and(eq(alerts.monitorId, monitor.id), eq(alerts.status, "active")),
    })

    for (const alert of activeAlerts) {
      await db.update(alerts).set({
        status: "resolved",
        resolvedAt: new Date(),
      }).where(eq(alerts.id, alert.id))
    }

    // Create recovery alert
    const downSince = monitor.lastStatusChange
    const downtimeMs = downSince ? Date.now() - new Date(downSince).getTime() : 0
    const downtime = formatDuration(downtimeMs)

    await db.insert(alerts).values({
      monitorId: monitor.id,
      clientId: monitor.clientId,
      teamId: monitor.teamId,
      type: "host.recovered",
      message: `${fqdn} is back up (was down for ${downtime})`,
    })

    try {
      await redis.set(`monitors:updated:${ownerId}`, "1", { ex: 90 })
    } catch {}

    await deliverAlert(monitor, "recovered", fqdn, downtime)
  }
}

async function deliverAlert(monitor: Monitor, event: "down" | "recovered", fqdn: string, detail: string) {
  // Get workspace plan
  let plan = "free"
  if (monitor.teamId) {
    const team = await db.query.teams.findFirst({ where: eq(teams.id, monitor.teamId) })
    if (team) plan = team.plan
  } else if (monitor.clientId) {
    const client = await db.query.clients.findFirst({ where: eq(clients.id, monitor.clientId) })
    if (client) plan = client.plan
  }

  const limits = getMonitoringLimits(plan)
  const scope = monitor.teamId
    ? eq(alertPreferences.teamId, monitor.teamId)
    : and(eq(alertPreferences.clientId, monitor.clientId!))

  const prefs = await db.query.alertPreferences.findMany({ where: scope })
  const enabledChannels = prefs.filter(p => p.enabled).map(p => p.channel)

  // Email alerts
  if (enabledChannels.includes("email") && limits.alertChannels.includes("email")) {
    try {
      // Get owner email
      let email: string | undefined
      let name = "there"
      if (monitor.clientId) {
        const client = await db.query.clients.findFirst({ where: eq(clients.id, monitor.clientId) })
        if (client) { email = client.email; name = client.name }
      }
      if (email) {
        if (event === "down") {
          await sendMonitorDownEmail(email, name, fqdn, detail)
        } else {
          await sendMonitorRecoveredEmail(email, name, fqdn, detail)
        }
      }
    } catch {}
  }

  // Webhook alerts
  if (enabledChannels.includes("webhook") && limits.alertChannels.includes("webhook")) {
    const webhookOwner = monitor.teamId
      ? { teamId: monitor.teamId }
      : { clientId: monitor.clientId! }
    const webhookEvent = event === "down" ? "monitor.host_down" : "monitor.host_recovered"
    dispatchWebhook(webhookOwner, webhookEvent, { host: fqdn, detail })
  }
}

// ── Uptime calculation ───────────────────────────────────────────

export async function calculateUptime(monitorId: number, hours: number = 24): Promise<string> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000)
  const checks = await db.query.monitorChecks.findMany({
    where: and(
      eq(monitorChecks.monitorId, monitorId),
      sql`${monitorChecks.checkedAt} > ${since}`,
    ),
  })

  if (checks.length === 0) return "—"
  const upCount = checks.filter(c => c.status === "up").length
  return ((upCount / checks.length) * 100).toFixed(1)
}

// ── Helpers ──────────────────────────────────────────────────────

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const remainMinutes = minutes % 60
  if (hours < 24) return `${hours}h ${remainMinutes}m`
  const days = Math.floor(hours / 24)
  return `${days}d ${hours % 24}h`
}
