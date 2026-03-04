import { NextRequest, NextResponse } from "next/server"
import { eq, and, sql, lte } from "drizzle-orm"
import { db } from "@/lib/db"
import { monitors, monitorChecks, hosts } from "@/lib/schema"
import { redis } from "@/lib/redis"
import { executeCheck, evaluateAlerts, calculateUptime } from "@/lib/monitoring"

export const maxDuration = 60

const LOCK_KEY = "monitor:cron:lock"
const LOCK_TTL = 55 // seconds
const BATCH_SIZE = 10
const MAX_MONITORS = 50

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Acquire Redis lock
  try {
    const locked = await redis.set(LOCK_KEY, "1", { nx: true, ex: LOCK_TTL })
    if (!locked) {
      return NextResponse.json({ skipped: true, reason: "lock" })
    }
  } catch {
    // If Redis fails, proceed anyway (single instance likely)
  }

  try {
    // Query due monitors
    const now = new Date()
    const dueMonitors = await db.query.monitors.findMany({
      where: and(
        eq(monitors.enabled, true),
        sql`(${monitors.lastCheckedAt} IS NULL OR ${monitors.lastCheckedAt} + ${monitors.intervalSeconds} * interval '1 second' < ${now})`,
      ),
      orderBy: (m, { asc }) => [asc(m.lastCheckedAt)],
      limit: MAX_MONITORS,
    })

    if (dueMonitors.length === 0) {
      return NextResponse.json({ checked: 0 })
    }

    // Get all hosts for these monitors
    const hostIds = [...new Set(dueMonitors.map(m => m.hostId))]
    const hostRows = await db.query.hosts.findMany({
      where: sql`${hosts.id} IN (${sql.join(hostIds.map(id => sql`${id}`), sql`, `)})`,
    })
    const hostMap = new Map(hostRows.map(h => [h.id, h]))

    // Process in parallel batches
    let checked = 0
    for (let i = 0; i < dueMonitors.length; i += BATCH_SIZE) {
      const batch = dueMonitors.slice(i, i + BATCH_SIZE)
      await Promise.allSettled(
        batch.map(async (monitor) => {
          const host = hostMap.get(monitor.hostId)
          if (!host) return

          const result = await executeCheck(monitor, host)

          // Insert check result
          await db.insert(monitorChecks).values({
            monitorId: monitor.id,
            status: result.status,
            responseTime: result.responseTime,
            statusCode: result.statusCode ?? null,
            error: result.error ?? null,
          })

          // Handle retries for down status
          let newStatus = result.status
          if (result.status === "down") {
            const newFails = monitor.consecutiveFails + 1
            if (newFails < monitor.retries) {
              // Not enough failures yet, keep current status
              await db.update(monitors).set({
                consecutiveFails: newFails,
                lastCheckedAt: now,
                updatedAt: now,
              }).where(eq(monitors.id, monitor.id))
              checked++
              return
            }
          }

          // Calculate uptime
          const uptimePercent = await calculateUptime(monitor.id)

          // Update monitor state
          const prevStatus = monitor.status
          const statusChanged = newStatus !== prevStatus
          await db.update(monitors).set({
            status: newStatus,
            lastCheckedAt: now,
            consecutiveFails: newStatus === "down" ? monitor.consecutiveFails + 1 : 0,
            uptimePercent,
            ...(statusChanged ? { lastStatusChange: now } : {}),
            updatedAt: now,
          }).where(eq(monitors.id, monitor.id))

          // Evaluate alerts on status change
          if (statusChanged) {
            await evaluateAlerts(monitor, newStatus, prevStatus)
          }

          // Signal Redis for SSE
          const ownerId = monitor.teamId ?? monitor.clientId
          if (ownerId) {
            try {
              await redis.set(`monitors:updated:${ownerId}`, "1", { ex: 90 })
            } catch {}
          }

          checked++
        }),
      )
    }

    return NextResponse.json({ checked })
  } finally {
    try {
      await redis.del(LOCK_KEY)
    } catch {}
  }
}
