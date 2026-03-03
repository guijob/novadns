import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { clients } from "@/lib/schema"
import { getSession } from "@/lib/auth"
import { generateTotpSecret, generateQrDataUrl, generateBackupCodes } from "@/lib/totp"

export async function POST() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const secret = generateTotpSecret()
  const qrDataUrl = await generateQrDataUrl(session.email, secret)
  const backupCodes = generateBackupCodes()

  // Store pending secret (mfaEnabled stays false until verified)
  await db.update(clients).set({ totpSecret: secret }).where(eq(clients.id, session.id))

  return NextResponse.json({ secret, qrDataUrl, backupCodes })
}
