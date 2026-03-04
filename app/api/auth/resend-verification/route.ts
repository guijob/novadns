import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { clients } from "@/lib/schema"
import { sendVerificationEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  const client = await db.query.clients.findFirst({
    where: eq(clients.email, email.toLowerCase().trim()),
  })

  // Always return ok to avoid email enumeration
  if (!client || !client.passwordHash) {
    return NextResponse.json({ ok: true })
  }

  if (client.emailVerified) {
    return NextResponse.json({ ok: true })
  }

  const token = crypto.randomBytes(32).toString("hex")

  await db.update(clients)
    .set({ emailVerificationToken: token })
    .where(eq(clients.id, client.id))

  try {
    await sendVerificationEmail(client.email, client.name, token)
  } catch (err) {
    console.error("Failed to resend verification email:", err)
    return NextResponse.json({ error: "Failed to send email. Please try again." }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
