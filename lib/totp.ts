import { generateSecret as otpGenerateSecret, generate, verify, generateURI } from "otplib"
import QRCode from "qrcode"
import crypto from "crypto"

export function generateTotpSecret(): string {
  return otpGenerateSecret()
}

export async function generateQrDataUrl(email: string, secret: string): Promise<string> {
  const uri = generateURI({ label: email, issuer: "NovaDNS", secret })
  return QRCode.toDataURL(uri)
}

export async function verifyTotp(secret: string, code: string): Promise<boolean> {
  try {
    const result = await verify({ token: code, secret, epochTolerance: 30 })
    return result.valid
  } catch {
    return false
  }
}

export function generateBackupCodes(): string[] {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  return Array.from({ length: 8 }, () => {
    const part = (n: number) =>
      Array.from({ length: n }, () => chars[crypto.randomInt(chars.length)]).join("")
    return `${part(4)}-${part(4)}`
  })
}

export function hashBackupCode(code: string): string {
  return crypto
    .createHash("sha256")
    .update(code.toUpperCase().replace(/-/g, ""))
    .digest("hex")
}

export function verifyBackupCode(
  hashed: string[],
  raw: string,
): { valid: boolean; remaining: string[] } {
  const attempt = hashBackupCode(raw)
  const idx = hashed.indexOf(attempt)
  if (idx === -1) return { valid: false, remaining: hashed }
  const remaining = hashed.filter((_, i) => i !== idx)
  return { valid: true, remaining }
}
