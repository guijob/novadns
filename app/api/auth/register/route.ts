import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { clients } from "@/lib/schema"
import { sendVerificationEmail } from "@/lib/email"
import { generateSlug, findAvailableSlug } from "@/lib/slug"

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
  const verificationToken = crypto.randomBytes(32).toString("hex")

  const [client] = await db
    .insert(clients)
    .values({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      emailVerificationToken: verificationToken,
    })
    .returning({ id: clients.id })

  const slugBase = generateSlug(email.toLowerCase().trim().split("@")[0])
  const slug = await findAvailableSlug(slugBase)
  await db.update(clients).set({ slug }).where(eq(clients.id, client.id))

  sendVerificationEmail(email.toLowerCase().trim(), name.trim(), verificationToken).catch(() => {})

  return NextResponse.json({ pending: true })
}
