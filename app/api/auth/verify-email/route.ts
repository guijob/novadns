import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { clients } from "@/lib/schema"
import { setSessionCookie } from "@/lib/auth"
import { sendWelcomeEmail } from "@/lib/email"

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://novadns.io"

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")

  if (!token) {
    return NextResponse.redirect(`${appUrl}/login?error=invalid_token`)
  }

  const client = await db.query.clients.findFirst({
    where: eq(clients.emailVerificationToken, token),
  })

  if (!client) {
    return NextResponse.redirect(`${appUrl}/login?error=invalid_token`)
  }

  if (client.emailVerified) {
    // Already verified — just log them in
    await setSessionCookie(client.id)
    return NextResponse.redirect(`${appUrl}/${client.slug}`)
  }

  await db.update(clients)
    .set({ emailVerified: true, emailVerificationToken: null })
    .where(eq(clients.id, client.id))

  await setSessionCookie(client.id)
  sendWelcomeEmail(client.email, client.name).catch(() => {})

  return NextResponse.redirect(`${appUrl}/${client.slug}`)
}
