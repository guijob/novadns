import { NextRequest, NextResponse } from "next/server"
import { eq, and } from "drizzle-orm"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { teams, teamMembers } from "@/lib/schema"

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const teamId = req.nextUrl.searchParams.get("teamId")
  if (teamId) {
    const membership = await db.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.teamId, Number(teamId)),
        eq(teamMembers.clientId, session.id),
        eq(teamMembers.accepted, true),
      ),
    })
    if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const team = await db.query.teams.findFirst({ where: eq(teams.id, Number(teamId)) })
    if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json({ plan: team.plan })
  }

  return NextResponse.json({ plan: session.plan })
}
