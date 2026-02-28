import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { clients } from "@/lib/schema"
import { setSessionCookie } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json()

  if (!name?.trim() || !email?.trim() || !password) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
  }

  const existing = await db.query.clients.findFirst({
    where: eq(clients.email, email.toLowerCase().trim()),
  })

  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists" }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const [client] = await db
    .insert(clients)
    .values({ name: name.trim(), email: email.toLowerCase().trim(), passwordHash })
    .returning({ id: clients.id })

  await setSessionCookie(client.id)

  return NextResponse.json({ ok: true })
}
