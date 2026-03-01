import { createHmac } from "crypto"
import { db } from "./db"
import { webhooks } from "./schema"
import { eq, and } from "drizzle-orm"

export async function dispatchWebhook(
  clientId: number,
  event: string,
  payload: Record<string, unknown>,
) {
  const rows = await db.query.webhooks.findMany({
    where: and(eq(webhooks.clientId, clientId), eq(webhooks.active, true)),
  })
  const targets = rows.filter(w => w.events.split(",").includes(event))
  if (!targets.length) return

  const body = JSON.stringify({ event, timestamp: new Date().toISOString(), data: payload })

  await Promise.allSettled(
    targets.map(w => {
      const sig = createHmac("sha256", w.secret).update(body).digest("hex")
      return fetch(w.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-NovaDNS-Event": event,
          "X-NovaDNS-Signature": `sha256=${sig}`,
        },
        body,
        signal: AbortSignal.timeout(5000),
      }).catch(() => {})
    })
  )
}
