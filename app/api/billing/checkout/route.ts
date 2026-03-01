import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { stripe } from "@/lib/stripe"
import { db } from "@/lib/db"
import { clients } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { getPriceId, type PlanKey } from "@/lib/plans"

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { plan } = await req.json() as { plan: PlanKey }
  if (!plan || plan === "free") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

  let customerId = session.stripeCustomerId

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.email,
      metadata: { clientId: String(session.id) },
    })
    customerId = customer.id
    await db.update(clients)
      .set({ stripeCustomerId: customerId, updatedAt: new Date() })
      .where(eq(clients.id, session.id))
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode:      "subscription",
    customer:  customerId,
    line_items: [{ price: getPriceId(plan), quantity: 1 }],
    metadata:  { plan },
    success_url: `${appUrl}/dashboard/settings?upgraded=1`,
    cancel_url:  `${appUrl}/dashboard/settings`,
  })

  return NextResponse.json({ url: checkoutSession.url })
}
