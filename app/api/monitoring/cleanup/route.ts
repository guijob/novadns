import { NextRequest, NextResponse } from "next/server"
import { eq, and, sql, lt } from "drizzle-orm"
import { db } from "@/lib/db"
import { monitors, monitorChecks, clients, teams } from "@/lib/schema"
import { getMonitoringLimits } from "@/lib/plans"

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get all monitors grouped by owner
  const allMonitors = await db.query.monitors.findMany({
    columns: { id: true, clientId: true, teamId: true },
  })

  // Build owner → monitor IDs map
  const ownerMap = new Map<string, { plan: string; monitorIds: number[] }>()

  for (const m of allMonitors) {
    const key = m.teamId ? `team:${m.teamId}` : `client:${m.clientId}`
    if (!ownerMap.has(key)) {
      let plan = "free"
      if (m.teamId) {
        const team = await db.query.teams.findFirst({ where: eq(teams.id, m.teamId) })
        if (team) plan = team.plan
      } else if (m.clientId) {
        const client = await db.query.clients.findFirst({ where: eq(clients.id, m.clientId) })
        if (client) plan = client.plan
      }
      ownerMap.set(key, { plan, monitorIds: [] })
    }
    ownerMap.get(key)!.monitorIds.push(m.id)
  }

  let deleted = 0

  for (const [, { plan, monitorIds }] of ownerMap) {
    const limits = getMonitoringLimits(plan)
    const cutoff = new Date(Date.now() - limits.historyDays * 24 * 60 * 60 * 1000)

    for (const monitorId of monitorIds) {
      const result = await db.delete(monitorChecks).where(
        and(
          eq(monitorChecks.monitorId, monitorId),
          lt(monitorChecks.checkedAt, cutoff),
        ),
      )
      deleted++
    }
  }

  return NextResponse.json({ ok: true, ownersProcessed: ownerMap.size })
}
