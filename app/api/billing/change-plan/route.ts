import { NextRequest, NextResponse } from "next/server"
import { eq, and } from "drizzle-orm"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { teams, teamMembers } from "@/lib/schema"
import { paddle } from "@/lib/paddle"
import { getPriceId, isPaidPlan, type PlanKey } from "@/lib/plans"

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { plan, teamId } = await req.json() as { plan: string; teamId?: number }

  if (!isPaidPlan(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
  }

  let priceId: string
  try {
    priceId = getPriceId(plan as PlanKey)
  } catch {
    return NextResponse.json({ error: "Plan not configured" }, { status: 400 })
  }

  let subscriptionId: string | null | undefined

  if (teamId) {
    const membership = await db.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.teamId, teamId),
        eq(teamMembers.clientId, session.id),
        eq(teamMembers.accepted, true),
      ),
    })
    if (!membership || membership.role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const team = await db.query.teams.findFirst({ where: eq(teams.id, teamId) })
    if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 })

    subscriptionId = team.paddleSubscriptionId
  } else {
    subscriptionId = session.paddleSubscriptionId
  }

  if (!subscriptionId) {
    return NextResponse.json({ error: "No active subscription" }, { status: 400 })
  }

  try {
    await paddle.subscriptions.update(subscriptionId, {
      items: [{ priceId, quantity: 1 }],
      prorationBillingMode: "prorated_immediately",
    })
    // DB is intentionally NOT updated here.
    // The subscription.updated webhook updates the plan once Paddle confirms it,
    // and transaction.payment_failed reverts it if the proration charge bounces.
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[change-plan] Paddle error:", err)
    return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 })
  }
}
