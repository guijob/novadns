import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { stripe } from "@/lib/stripe"

export async function POST() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (!session.stripeCustomerId) {
    return NextResponse.json({ error: "No subscription found" }, { status: 400 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

  const portalSession = await stripe.billingPortal.sessions.create({
    customer:   session.stripeCustomerId,
    return_url: `${appUrl}/dashboard/settings`,
  })

  return NextResponse.json({ url: portalSession.url })
}
