import { NextRequest } from "next/server"
import { eq, and, isNull } from "drizzle-orm"
import { db } from "@/lib/db"
import { monitors, alerts } from "@/lib/schema"
import { getSession } from "@/lib/auth"
import { redis } from "@/lib/redis"
import { resolveWorkspace } from "@/lib/workspace"
import { count } from "drizzle-orm"

export const maxDuration = 60

const REDIS_POLL_MS = 2_000
const DB_POLL_MS = 30_000

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return new Response("Unauthorized", { status: 401 })

  const slug = req.nextUrl.searchParams.get("slug")
  const workspace = slug ? await resolveWorkspace(slug, session.id) : null
  if (!workspace) return new Response("Not Found", { status: 404 })

  const ownerId = workspace.type === "team" ? workspace.teamId : workspace.clientId
  const encoder = new TextEncoder()
  const key = `monitors:updated:${ownerId}`

  const monitorWhere =
    workspace.type === "team"
      ? eq(monitors.teamId, workspace.teamId)
      : and(eq(monitors.clientId, workspace.clientId), isNull(monitors.teamId))

  const alertWhere =
    workspace.type === "team"
      ? and(eq(alerts.teamId, workspace.teamId), eq(alerts.status, "active"))
      : and(eq(alerts.clientId, workspace.clientId), isNull(alerts.teamId), eq(alerts.status, "active"))

  const stream = new ReadableStream({
    async start(controller) {
      function send(data: unknown) {
        if (req.signal.aborted) return
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch {}
      }

      function keepAlive() {
        if (req.signal.aborted) return
        try {
          controller.enqueue(encoder.encode(": ping\n\n"))
        } catch {}
      }

      async function fetchData() {
        const [monitorList, [{ value: alertCount }]] = await Promise.all([
          db.query.monitors.findMany({
            where: monitorWhere,
            orderBy: (m, { desc }) => [desc(m.createdAt)],
          }),
          db.select({ value: count() }).from(alerts).where(alertWhere),
        ])
        return { monitors: monitorList, activeAlerts: alertCount }
      }

      // Send initial snapshot
      send(await fetchData())

      let lastDbPoll = Date.now()

      while (!req.signal.aborted) {
        await new Promise(r => setTimeout(r, REDIS_POLL_MS))
        if (req.signal.aborted) break

        let signalled = false
        try {
          const val = await redis.get(key)
          if (val !== null) {
            await redis.del(key)
            signalled = true
          }
        } catch {}

        const now = Date.now()
        const dbPollDue = now - lastDbPoll >= DB_POLL_MS

        if (signalled || dbPollDue) {
          send(await fetchData())
          lastDbPoll = now
          if (dbPollDue && !signalled) keepAlive()
        }
      }

      try { controller.close() } catch {}
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  })
}
