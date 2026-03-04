// Usage: node scripts/resend-verification.mjs <email>
import { config } from "dotenv"
import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { eq } from "drizzle-orm"
import crypto from "crypto"
import { Resend } from "resend"

config({ path: ".env.local" })

const email = process.argv[2]
if (!email) { console.error("Usage: node scripts/resend-verification.mjs <email>"); process.exit(1) }

const sql = neon(process.env.DATABASE_URL)
const db  = drizzle(sql)

// Inline schema reference (avoid TS imports)
const { pgTable, serial, varchar, boolean, timestamp, text } = await import("drizzle-orm/pg-core")
const clients = pgTable("clients", {
  id:                     serial("id").primaryKey(),
  email:                  varchar("email", { length: 254 }),
  name:                   varchar("name",  { length: 100 }),
  emailVerified:          boolean("email_verified"),
  emailVerificationToken: varchar("email_verification_token", { length: 64 }),
})

const [client] = await db.select().from(clients).where(eq(clients.email, email.toLowerCase().trim()))

if (!client) { console.error("No account found for", email); await sql.end(); process.exit(1) }
if (client.emailVerified) { console.log("Account already verified."); await sql.end(); process.exit(0) }

const token = crypto.randomBytes(32).toString("hex")
await db.update(clients).set({ emailVerificationToken: token }).where(eq(clients.id, client.id))

const appDomain = process.env.APP_DOMAIN ?? "novadns.io"
const link = `https://${appDomain}/api/auth/verify-email?token=${token}`

const resend = new Resend(process.env.RESEND_API_KEY)
const { error } = await resend.emails.send({
  from:    `NovaDNS <noreply@${appDomain}>`,
  to:      client.email,
  subject: "Verify your NovaDNS email",
  html: `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#111">
      <h1 style="font-size:20px;font-weight:700;margin:0 0 8px">Verify your email</h1>
      <p style="font-size:14px;color:#444;margin:0 0 24px">Hi ${client.name}, click the button below to confirm your email address and activate your account.</p>
      <a href="${link}" style="display:inline-block;background:#000;color:#fff;font-size:14px;font-weight:600;padding:12px 24px;text-decoration:none">Verify email</a>
      <p style="font-size:12px;color:#999;margin:16px 0 0">This link expires when used. If you didn't create an account, you can ignore this email.</p>
    </div>
  `,
})

if (error) { console.error("Resend error:", error); process.exit(1) }

console.log(`✓ Verification email sent to ${client.email}`)
