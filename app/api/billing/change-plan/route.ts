import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { paddle } from "@/lib/paddle"
import { getPriceId, isPaidPlan, type PlanKey } from "@/lib/plans"

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (!session.paddleSubscriptionId) {
    return NextResponse.json({ error: "No active subscription" }, { status: 400 })
  }

  const { plan } = await req.json() as { plan: string }
  if (!isPaidPlan(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
  }

  let priceId: string
  try {
    priceId = getPriceId(plan as PlanKey)
  } catch {
    return NextResponse.json({ error: "Plan not configured" }, { status: 400 })
  }

  try {
    await paddle.subscriptions.update(session.paddleSubscriptionId, {
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
