import { NextRequest, NextResponse } from "next/server"
import { EventName } from "@paddle/paddle-node-sdk"
import { paddle } from "@/lib/paddle"
import { db } from "@/lib/db"
import { clients, hosts } from "@/lib/schema"
import { eq, asc } from "drizzle-orm"
import { getPlanByPriceId, getPlanLimit } from "@/lib/plans"

export const dynamic = "force-dynamic"

async function hardDowngrade(clientId: number, newPlan: string) {
  const limit    = getPlanLimit(newPlan)
  const allHosts = await db.query.hosts.findMany({
    where:   eq(hosts.clientId, clientId),
    orderBy: asc(hosts.createdAt),
  })
  for (const host of allHosts.slice(limit)) {
    await db.update(hosts)
      .set({ active: false, updatedAt: new Date() })
      .where(eq(hosts.id, host.id))
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get("paddle-signature") ?? ""

  let event
  try {
    event = await paddle.webhooks.unmarshal(body, process.env.PADDLE_WEBHOOK_SECRET!, sig)
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  // ── Subscription created → activate plan ────────────────────────
  if (event.eventType === EventName.SubscriptionCreated) {
    const sub        = event.data
    const customerId = sub.customerId
    const subId      = sub.id
    const priceId    = sub.items[0]?.price?.id
    const clientId   = (sub.customData as Record<string, string> | null)?.clientId

    const plan = priceId ? getPlanByPriceId(priceId) : null
    if (plan && clientId) {
      await db.update(clients)
        .set({ plan, paddleCustomerId: customerId, paddleSubscriptionId: subId, updatedAt: new Date() })
        .where(eq(clients.id, Number(clientId)))
    }
  }

  // ── Subscription updated → upgrade / downgrade via portal ───────
  if (event.eventType === EventName.SubscriptionUpdated) {
    const sub        = event.data
    const customerId = sub.customerId
    const priceId    = sub.items[0]?.price?.id

    const newPlan = priceId ? getPlanByPriceId(priceId) : null
    if (!newPlan) return NextResponse.json({ received: true })

    const client = await db.query.clients.findFirst({
      where: eq(clients.paddleCustomerId, customerId),
    })
    if (client) {
      const oldPlan = client.plan
      await db.update(clients)
        .set({ plan: newPlan, updatedAt: new Date() })
        .where(eq(clients.id, client.id))

      if (getPlanLimit(newPlan) < getPlanLimit(oldPlan)) {
        await hardDowngrade(client.id, newPlan)
      }
    }
  }

  // ── Subscription canceled → revert to free ──────────────────────
  if (event.eventType === EventName.SubscriptionCanceled) {
    const sub        = event.data
    const customerId = sub.customerId

    const client = await db.query.clients.findFirst({
      where: eq(clients.paddleCustomerId, customerId),
    })
    if (client) {
      await db.update(clients)
        .set({ plan: "free", paddleSubscriptionId: null, updatedAt: new Date() })
        .where(eq(clients.id, client.id))

      await hardDowngrade(client.id, "free")
    }
  }

  return NextResponse.json({ received: true })
}
