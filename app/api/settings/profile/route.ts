import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { clients } from "@/lib/schema"
import { getSession } from "@/lib/auth"

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name, email } = await req.json()

  if (!name || typeof name !== "string" || name.trim().length === 0)
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 })

  const trimmedName  = name.trim().slice(0, 100)
  const trimmedEmail = email.trim().toLowerCase().slice(0, 254)

  if (trimmedEmail !== session.email) {
    const existing = await db.query.clients.findFirst({ where: eq(clients.email, trimmedEmail) })
    if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 409 })
  }

  await db.update(clients).set({ name: trimmedName, email: trimmedEmail, updatedAt: new Date() }).where(eq(clients.id, session.id))

  return NextResponse.json({ ok: true })
}
