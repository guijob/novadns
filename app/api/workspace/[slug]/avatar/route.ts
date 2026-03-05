import { NextRequest, NextResponse } from "next/server"
import { eq, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { teams, teamMembers } from "@/lib/schema"
import { getSession } from "@/lib/auth"
import { resolveWorkspace } from "@/lib/workspace"

const MAX_BYTES = 150_000

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { slug } = await params
  const workspace = await resolveWorkspace(slug, session.id)
  if (!workspace || workspace.type !== "team")
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 })
  if (workspace.role !== "owner" && workspace.role !== "admin")
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })

  const { avatarUrl } = await req.json()

  if (avatarUrl !== null) {
    if (typeof avatarUrl !== "string")
      return NextResponse.json({ error: "Invalid avatar" }, { status: 400 })
    if (!avatarUrl.startsWith("data:image/"))
      return NextResponse.json({ error: "Only image data URLs are accepted" }, { status: 400 })
    if (Buffer.byteLength(avatarUrl, "utf8") > MAX_BYTES)
      return NextResponse.json({ error: "Image too large (max 150 KB)" }, { status: 413 })
  }

  await db
    .update(teams)
    .set({ avatarUrl: avatarUrl ?? null, updatedAt: new Date() })
    .where(eq(teams.id, workspace.teamId))

  return NextResponse.json({ ok: true })
}
