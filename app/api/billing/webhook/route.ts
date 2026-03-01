import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { db } from "@/lib/db"
import { clients, hosts } from "@/lib/schema"
import { eq, asc } from "drizzle-orm"
import { getPlanByPriceId, getPlanLimit, PLANS } from "@/lib/plans"

export const dynamic = "force-dynamic"

async function hardDowngrade(clientId: number, newPlan: string) {
  const limit = getPlanLimit(newPlan)
  const allHosts = await db.query.hosts.findMany({
    where: eq(hosts.clientId, clientId),
    orderBy: asc(hosts.createdAt),
  })
  const toDisable = allHosts.slice(limit)
  for (const host of toDisable) {
    await db.update(hosts)
      .set({ active: false, updatedAt: new Date() })
      .where(eq(hosts.id, host.id))
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get("stripe-signature") ?? ""

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  // ── Checkout completed → activate new plan ──────────────────────
  if (event.type === "checkout.session.completed") {
    const session     = event.data.object
    const customerId  = session.customer as string
    const subId       = session.subscription as string
    const plan        = (session.metadata?.plan ?? null) as string | null

    const client = await db.query.clients.findFirst({
      where: eq(clients.stripeCustomerId, customerId),
    })
    if (client && plan && plan in PLANS) {
      await db.update(clients)
        .set({ plan, stripeSubscriptionId: subId, updatedAt: new Date() })
        .where(eq(clients.id, client.id))
    }
  }

  // ── Subscription updated → plan changed via portal ──────────────
  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object
    const customerId   = subscription.customer as string
    const priceId      = subscription.items.data[0]?.price.id

    const newPlan = priceId ? getPlanByPriceId(priceId) : null
    if (!newPlan) return NextResponse.json({ received: true })

    const client = await db.query.clients.findFirst({
      where: eq(clients.stripeCustomerId, customerId),
    })
    if (client) {
      const oldPlan = client.plan
      await db.update(clients)
        .set({ plan: newPlan, updatedAt: new Date() })
        .where(eq(clients.id, client.id))

      // Disable hosts if downgrading to a lower limit
      if (getPlanLimit(newPlan) < getPlanLimit(oldPlan)) {
        await hardDowngrade(client.id, newPlan)
      }
    }
  }

  // ── Subscription deleted → revert to free ───────────────────────
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object
    const customerId   = subscription.customer as string

    const client = await db.query.clients.findFirst({
      where: eq(clients.stripeCustomerId, customerId),
    })
    if (client) {
      await db.update(clients)
        .set({ plan: "free", stripeSubscriptionId: null, updatedAt: new Date() })
        .where(eq(clients.id, client.id))

      await hardDowngrade(client.id, "free")
    }
  }

  return NextResponse.json({ received: true })
}
