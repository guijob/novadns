import { NextResponse } from "next/server"
import { sendDocsFeedbackEmail, sendDocsGeneralFeedbackEmail } from "@/lib/email"

export async function POST(req: Request) {
  const body = await req.json()

  // General feedback button: { message, email? }
  if (typeof body.message === "string") {
    const message = body.message.trim()
    if (!message) return NextResponse.json({ error: "Message is required" }, { status: 400 })
    await sendDocsGeneralFeedbackEmail(message, body.email?.trim() || undefined)
    return NextResponse.json({ ok: true })
  }

  // Page helpfulness: { page, helpful, comment }
  const { page, helpful, comment } = body
  if (typeof helpful !== "boolean" || typeof page !== "string") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }
  await sendDocsFeedbackEmail(page, helpful, comment ?? "")
  return NextResponse.json({ ok: true })
}
