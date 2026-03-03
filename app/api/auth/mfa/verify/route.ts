import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { clients } from "@/lib/schema"
import { verifyMfaChallengeToken, setSessionCookie } from "@/lib/auth"
import { verifyTotp, verifyBackupCode } from "@/lib/totp"

export async function POST(req: NextRequest) {
  const { challengeToken, code } = await req.json()

  if (!challengeToken || !code) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  const clientId = await verifyMfaChallengeToken(challengeToken)
  if (!clientId) {
    return NextResponse.json({ error: "Invalid or expired challenge" }, { status: 401 })
  }

  const client = await db.query.clients.findFirst({ where: eq(clients.id, clientId) })
  if (!client || !client.mfaEnabled || !client.totpSecret) {
    return NextResponse.json({ error: "MFA not configured" }, { status: 401 })
  }

  // Try TOTP first
  if (await verifyTotp(client.totpSecret, code.trim())) {
    await setSessionCookie(clientId)
    return NextResponse.json({ ok: true, slug: client.slug })
  }

  // Try backup code
  const backupCodes = client.mfaBackupCodes ?? []
  const { valid, remaining } = verifyBackupCode(backupCodes, code.trim())
  if (valid) {
    await db.update(clients).set({ mfaBackupCodes: remaining }).where(eq(clients.id, clientId))
    await setSessionCookie(clientId)
    return NextResponse.json({ ok: true, slug: client.slug })
  }

  return NextResponse.json({ error: "Invalid code" }, { status: 401 })
}
