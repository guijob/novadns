import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { clients } from "@/lib/schema"
import { getSession } from "@/lib/auth"
import { verifyTotp, generateBackupCodes, hashBackupCode } from "@/lib/totp"

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { code } = await req.json()
  if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 })

  if (!session.totpSecret) {
    return NextResponse.json({ error: "MFA setup not started" }, { status: 400 })
  }

  if (!await verifyTotp(session.totpSecret, code.trim())) {
    return NextResponse.json({ error: "Invalid code" }, { status: 401 })
  }

  const plainCodes = generateBackupCodes()
  const hashed = plainCodes.map(hashBackupCode)

  await db
    .update(clients)
    .set({ mfaEnabled: true, mfaBackupCodes: hashed })
    .where(eq(clients.id, session.id))

  return NextResponse.json({ ok: true, backupCodes: plainCodes })
}
