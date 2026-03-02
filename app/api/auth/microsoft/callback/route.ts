import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { db } from "@/lib/db"
import { clients } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { setSessionCookie } from "@/lib/auth"
import { sendWelcomeEmail } from "@/lib/email"

const secret = () => new TextEncoder().encode(process.env.JWT_SECRET!)

interface MicrosoftUser { id: string; mail: string | null; userPrincipalName: string; displayName: string }

export async function GET(req: NextRequest) {
  const code   = req.nextUrl.searchParams.get("code")
  const state  = req.nextUrl.searchParams.get("state")
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

  const fail = (msg: string) =>
    NextResponse.redirect(`${appUrl}/login?error=${msg}`)

  if (!code || !state) return fail("oauth")

  // Verify the signed state to prevent CSRF
  let statePayload: { action: string; clientId?: number }
  try {
    const { payload } = await jwtVerify(state, secret())
    statePayload = payload as typeof statePayload
  } catch {
    return fail("oauth")
  }

  // Exchange code → access token
  const tokenRes = await fetch(
    "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id:     process.env.MICROSOFT_CLIENT_ID!,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
        redirect_uri:  `${appUrl}/api/auth/microsoft/callback`,
        grant_type:    "authorization_code",
        scope:         "openid email profile User.Read",
      }),
    },
  )
  if (!tokenRes.ok) return fail("oauth")

  const { access_token } = await tokenRes.json()

  // Fetch Microsoft profile
  const profileRes = await fetch("https://graph.microsoft.com/v1.0/me", {
    headers: { Authorization: `Bearer ${access_token}` },
  })
  if (!profileRes.ok) return fail("oauth")

  const msUser = await profileRes.json() as MicrosoftUser
  console.log("[microsoft oauth] id:", msUser.id, "mail:", msUser.mail, "upn:", msUser.userPrincipalName, "name:", msUser.displayName)
  // Microsoft personal accounts use userPrincipalName as email when mail is null
  const email = (msUser.mail ?? msUser.userPrincipalName).toLowerCase()
  if (!email) return fail("oauth")

  // ── Link mode: attach Microsoft ID to an existing logged-in account ──
  if (statePayload.action === "link" && statePayload.clientId) {
    const taken = await db.query.clients.findFirst({
      where: eq(clients.microsoftId, msUser.id),
    })
    if (taken && taken.id !== statePayload.clientId) {
      return NextResponse.redirect(`${appUrl}/dashboard/settings?microsoft_error=taken`)
    }
    await db.update(clients)
      .set({ microsoftId: msUser.id, updatedAt: new Date() })
      .where(eq(clients.id, statePayload.clientId))
    return NextResponse.redirect(`${appUrl}/dashboard/settings?microsoft_linked=1`)
  }

  // ── Login / signup mode ───────────────────────────────────────────────
  let client = await db.query.clients.findFirst({
    where: eq(clients.microsoftId, msUser.id),
  })

  if (!client) {
    // Auto-link if an account with the same email already exists
    const byEmail = await db.query.clients.findFirst({
      where: eq(clients.email, email),
    })
    if (byEmail) {
      await db.update(clients)
        .set({ microsoftId: msUser.id, updatedAt: new Date() })
        .where(eq(clients.id, byEmail.id))
      client = { ...byEmail, microsoftId: msUser.id }
    }
  }

  if (!client) {
    // Create new account (no password — Microsoft-only)
    const [inserted] = await db.insert(clients)
      .values({
        email,
        name:        msUser.displayName,
        microsoftId: msUser.id,
      })
      .returning({ id: clients.id })
    client = await db.query.clients.findFirst({ where: eq(clients.id, inserted.id) })
    if (client) sendWelcomeEmail(client.email, client.name).catch(() => {})
  }

  if (!client || !client.active) return fail("oauth")

  await setSessionCookie(client.id)
  return NextResponse.redirect(`${appUrl}/dashboard`)
}
