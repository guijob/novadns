import { NextRequest, NextResponse } from "next/server"
import { EventName } from "@paddle/paddle-node-sdk"
import { paddle } from "@/lib/paddle"
import { db } from "@/lib/db"
import { clients, hosts, teams, teamMembers } from "@/lib/schema"
import { eq, asc, and } from "drizzle-orm"
import { getPlanByPriceId, getPlanLimit, PLANS, type PlanKey } from "@/lib/plans"
import {
  sendSubscriptionUpgradedEmail,
  sendSubscriptionCanceledEmail,
} from "@/lib/email"

export const dynamic = "force-dynamic"

const baseDomain = process.env.BASE_DOMAIN ?? "novadns.io"

type Scope = { type: "client"; id: number } | { type: "team"; id: number }

/** Disables hosts beyond `limit` and returns their subdomains. Pass 0 to disable all. */
async function hardDowngrade(scope: Scope, limit: number): Promise<string[]> {
  const where    = scope.type === "team" ? eq(hosts.teamId, scope.id) : eq(hosts.clientId, scope.id)
  const allHosts = await db.query.hosts.findMany({ where, orderBy: asc(hosts.createdAt) })
  const toDisable = allHosts.slice(limit)
  for (const host of toDisable) {
    await db.update(hosts)
      .set({ active: false, updatedAt: new Date() })
      .where(eq(hosts.id, host.id))
  }
  return toDisable.map(h => `${h.subdomain}.${baseDomain}`)
}

/** Returns the team owner's client record for sending emails. */
async function getTeamOwner(teamId: number) {
  const ownerMember = await db.query.teamMembers.findFirst({
    where: and(eq(teamMembers.teamId, teamId), eq(teamMembers.role, "owner")),
  })
  if (!ownerMember?.clientId) return null
  return db.query.clients.findFirst({ where: eq(clients.id, ownerMember.clientId) })
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
    const sub      = event.data
    const subId    = sub.id
    const custId   = sub.customerId
    const priceId  = sub.items[0]?.price?.id
    const custom   = sub.customData as Record<string, string> | null
    const teamId   = custom?.teamId
    const clientId = custom?.clientId

    const plan = priceId ? getPlanByPriceId(priceId) : null
    console.log("[webhook] subscription.created priceId:", priceId, "teamId:", teamId, "clientId:", clientId, "plan:", plan)

    if (plan && teamId) {
      await db.update(teams)
        .set({ plan, paddleCustomerId: custId, paddleSubscriptionId: subId, updatedAt: new Date() })
        .where(eq(teams.id, Number(teamId)))
      const owner = await getTeamOwner(Number(teamId))
      if (owner) {
        const { label, limit } = PLANS[plan as PlanKey]
        sendSubscriptionUpgradedEmail(owner.email, owner.name, label, limit).catch(() => {})
      }
    } else if (plan && clientId) {
      await db.update(clients)
        .set({ plan, paddleCustomerId: custId, paddleSubscriptionId: subId, updatedAt: new Date() })
        .where(eq(clients.id, Number(clientId)))
      const client = await db.query.clients.findFirst({ where: eq(clients.id, Number(clientId)) })
      if (client) {
        const { label, limit } = PLANS[plan as PlanKey]
        sendSubscriptionUpgradedEmail(client.email, client.name, label, limit).catch(() => {})
      }
    }
  }

  // ── Subscription updated → upgrade / downgrade ──────────────────
  if (event.eventType === EventName.SubscriptionUpdated) {
    const sub     = event.data
    const subId   = sub.id
    const priceId = sub.items[0]?.price?.id
    const newPlan = priceId ? getPlanByPriceId(priceId) : null
    if (!newPlan) return NextResponse.json({ received: true })

    // Look up by subscription ID — precise, works for both personal and team
    const team   = await db.query.teams.findFirst({ where: eq(teams.paddleSubscriptionId, subId) })
    const client = !team ? await db.query.clients.findFirst({ where: eq(clients.paddleSubscriptionId, subId) }) : null

    if (team) {
      const oldPlan = team.plan
      await db.update(teams).set({ plan: newPlan, updatedAt: new Date() }).where(eq(teams.id, team.id))
      const owner = await getTeamOwner(team.id)
      if (owner) {
        if (getPlanLimit(newPlan) < getPlanLimit(oldPlan)) {
          const disabled = await hardDowngrade({ type: "team", id: team.id }, getPlanLimit(newPlan))
          sendSubscriptionCanceledEmail(owner.email, owner.name, disabled).catch(() => {})
        } else {
          const { label, limit } = PLANS[newPlan as PlanKey]
          sendSubscriptionUpgradedEmail(owner.email, owner.name, label, limit).catch(() => {})
        }
      }
    } else if (client) {
      const oldPlan = client.plan
      await db.update(clients).set({ plan: newPlan, updatedAt: new Date() }).where(eq(clients.id, client.id))
      if (getPlanLimit(newPlan) < getPlanLimit(oldPlan)) {
        const disabled = await hardDowngrade({ type: "client", id: client.id }, getPlanLimit(newPlan))
        sendSubscriptionCanceledEmail(client.email, client.name, disabled).catch(() => {})
      } else {
        const { label, limit } = PLANS[newPlan as PlanKey]
        sendSubscriptionUpgradedEmail(client.email, client.name, label, limit).catch(() => {})
      }
    }
  }

  // ── Subscription canceled → revert to free ──────────────────────
  if (event.eventType === EventName.SubscriptionCanceled) {
    const sub   = event.data
    const subId = sub.id

    const team   = await db.query.teams.findFirst({ where: eq(teams.paddleSubscriptionId, subId) })
    const client = !team ? await db.query.clients.findFirst({ where: eq(clients.paddleSubscriptionId, subId) }) : null

    if (team) {
      await db.update(teams)
        .set({ plan: "free", paddleSubscriptionId: null, updatedAt: new Date() })
        .where(eq(teams.id, team.id))
      const disabled = await hardDowngrade({ type: "team", id: team.id }, 0)
      const owner = await getTeamOwner(team.id)
      if (owner) sendSubscriptionCanceledEmail(owner.email, owner.name, disabled).catch(() => {})
    } else if (client) {
      await db.update(clients)
        .set({ plan: "free", paddleSubscriptionId: null, updatedAt: new Date() })
        .where(eq(clients.id, client.id))
      const disabled = await hardDowngrade({ type: "client", id: client.id }, getPlanLimit("free"))
      sendSubscriptionCanceledEmail(client.email, client.name, disabled).catch(() => {})
    }
  }

  // ── Transaction payment failed → revert to Paddle's current plan ─
  if (event.eventType === EventName.TransactionPaymentFailed) {
    const tx  = event.data
    const subId = tx.subscriptionId
    if (!subId) return NextResponse.json({ received: true })

    try {
      const sub     = await paddle.subscriptions.get(subId)
      const priceId = sub.items[0]?.price?.id
      const plan    = priceId ? getPlanByPriceId(priceId) : null
      if (!plan) return NextResponse.json({ received: true })

      const team   = await db.query.teams.findFirst({ where: eq(teams.paddleSubscriptionId, subId) })
      const client = !team ? await db.query.clients.findFirst({ where: eq(clients.paddleSubscriptionId, subId) }) : null

      if (team && team.plan !== plan) {
        const disabled = await hardDowngrade({ type: "team", id: team.id }, getPlanLimit(plan))
        await db.update(teams).set({ plan, updatedAt: new Date() }).where(eq(teams.id, team.id))
        const owner = await getTeamOwner(team.id)
        if (owner) sendSubscriptionCanceledEmail(owner.email, owner.name, disabled).catch(() => {})
      } else if (client && client.plan !== plan) {
        const disabled = await hardDowngrade({ type: "client", id: client.id }, getPlanLimit(plan))
        await db.update(clients).set({ plan, updatedAt: new Date() }).where(eq(clients.id, client.id))
        sendSubscriptionCanceledEmail(client.email, client.name, disabled).catch(() => {})
      }
    } catch (err) {
      console.error("[webhook] TransactionPaymentFailed error:", err)
    }
  }

  return NextResponse.json({ received: true })
}
