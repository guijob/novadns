import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { paddle } from "@/lib/paddle"

export async function POST() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (!session.paddleCustomerId || !session.paddleSubscriptionId) {
    return NextResponse.json({ error: "No subscription found" }, { status: 400 })
  }

  try {
    const portalSession = await paddle.customerPortalSessions.create(
      session.paddleCustomerId,
      [session.paddleSubscriptionId],
    )
    return NextResponse.json({ url: portalSession.urls.general.overview })
  } catch (err) {
    console.error("[portal] Paddle error:", err)
    // Fallback: send to Paddle's self-serve portal directly
    return NextResponse.json({ url: "https://customer.paddle.com/subscriptions" })
  }
}
