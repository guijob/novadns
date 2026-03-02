import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { clients } from "@/lib/schema"
import { getSession } from "@/lib/auth"
import { sendPasswordChangedEmail } from "@/lib/email"

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { currentPassword, newPassword } = await req.json()

  if (!newPassword)
    return NextResponse.json({ error: "New password is required" }, { status: 400 })
  if (newPassword.length < 8)
    return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 })

  if (session.passwordHash) {
    // Existing password accounts must verify current password
    if (!currentPassword)
      return NextResponse.json({ error: "Current password is required" }, { status: 400 })
    const valid = await bcrypt.compare(currentPassword, session.passwordHash)
    if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
  }

  const passwordHash = await bcrypt.hash(newPassword, 12)
  await db.update(clients).set({ passwordHash, updatedAt: new Date() }).where(eq(clients.id, session.id))
  sendPasswordChangedEmail(session.email, session.name).catch(() => {})

  return NextResponse.json({ ok: true })
}
