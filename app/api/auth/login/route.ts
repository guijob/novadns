import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { clients } from "@/lib/schema"
import { setSessionCookie } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  const client = await db.query.clients.findFirst({
    where: eq(clients.email, email.toLowerCase().trim()),
  })

  if (!client || !client.active) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }

  if (!client.passwordHash) {
    return NextResponse.json({ error: "This account uses Google sign-in. Use the Google button to log in." }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, client.passwordHash)
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }

  await setSessionCookie(client.id)

  return NextResponse.json({ ok: true })
}
