import { NextRequest, NextResponse } from "next/server"
import { eq, and } from "drizzle-orm"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { teams, teamMembers } from "@/lib/schema"
import { paddle } from "@/lib/paddle"

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { teamId } = await req.json().catch(() => ({})) as { teamId?: number }

  let paddleCustomerId:     string | null | undefined
  let paddleSubscriptionId: string | null | undefined

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

    paddleCustomerId     = team.paddleCustomerId
    paddleSubscriptionId = team.paddleSubscriptionId
  } else {
    paddleCustomerId     = session.paddleCustomerId
    paddleSubscriptionId = session.paddleSubscriptionId
  }

  if (!paddleCustomerId || !paddleSubscriptionId) {
    return NextResponse.json({ error: "No subscription found" }, { status: 400 })
  }

  try {
    const portalSession = await paddle.customerPortalSessions.create(
      paddleCustomerId,
      [paddleSubscriptionId],
    )
    return NextResponse.json({ url: portalSession.urls.general.overview })
  } catch (err) {
    console.error("[portal] Paddle error:", err)
    return NextResponse.json({ url: "https://customer.paddle.com/subscriptions" })
  }
}
