import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { clients } from "@/lib/schema"
import { getSession } from "@/lib/auth"

const MAX_BYTES = 150_000 // ~150KB base64 limit

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

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
    .update(clients)
    .set({ avatarUrl: avatarUrl ?? null, updatedAt: new Date() })
    .where(eq(clients.id, session.id))

  return NextResponse.json({ ok: true })
}
