import { NextResponse } from "next/server"
import { sendDocsFeedbackEmail } from "@/lib/email"

export async function POST(req: Request) {
  const { page, helpful, comment } = await req.json()

  if (typeof helpful !== "boolean" || typeof page !== "string") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  await sendDocsFeedbackEmail(page, helpful, comment ?? "")
  return NextResponse.json({ ok: true })
}
