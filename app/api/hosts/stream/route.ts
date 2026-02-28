import { NextRequest } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { hosts } from "@/lib/schema"
import { getSession } from "@/lib/auth"
import { redis, hostUpdateKey } from "@/lib/redis"

export const maxDuration = 60

const REDIS_POLL_MS = 2_000   // fast Redis check interval
const DB_POLL_MS   = 20_000  // fallback DB poll for online→offline transitions

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return new Response("Unauthorized", { status: 401 })

  const clientId = session.id
  const encoder  = new TextEncoder()
  const key      = hostUpdateKey(clientId)

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
          // SSE comment — keeps the connection alive through proxies
          controller.enqueue(encoder.encode(": ping\n\n"))
        } catch {}
      }

      async function fetchHosts() {
        return db.query.hosts.findMany({
          where: eq(hosts.clientId, clientId),
          orderBy: (h, { desc }) => [desc(h.createdAt)],
        })
      }

      // Send initial snapshot immediately
      send(await fetchHosts())

      let lastDbPoll = Date.now()

      while (!req.signal.aborted) {
        await new Promise(r => setTimeout(r, REDIS_POLL_MS))
        if (req.signal.aborted) break

        // Check Redis for a signal from /api/update
        let signalled = false
        try {
          const val = await redis.get(key)
          if (val !== null) {
            await redis.del(key)
            signalled = true
          }
        } catch {
          // Redis unavailable — fall through to DB poll fallback
        }

        const now = Date.now()
        const dbPollDue = now - lastDbPoll >= DB_POLL_MS

        if (signalled || dbPollDue) {
          send(await fetchHosts())
          lastDbPoll = now
          if (dbPollDue && !signalled) keepAlive()
        }
      }

      try { controller.close() } catch {}
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type":      "text/event-stream",
      "Cache-Control":     "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  })
}
