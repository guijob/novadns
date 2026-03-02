import { NextRequest, NextResponse } from "next/server"
import { SignJWT } from "jose"
import { getSession } from "@/lib/auth"

const secret = () => new TextEncoder().encode(process.env.JWT_SECRET!)

export async function GET(req: NextRequest) {
  const action  = req.nextUrl.searchParams.get("action") // "link" | null
  const session = await getSession()
  const appUrl  = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

  const isLink = action === "link" && !!session

  const state = await new SignJWT({
    action:   isLink ? "link" : "login",
    clientId: isLink ? session!.id : undefined,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("10m")
    .sign(secret())

  const params = new URLSearchParams({
    client_id:     process.env.GOOGLE_CLIENT_ID!,
    redirect_uri:  `${appUrl}/api/auth/google/callback`,
    response_type: "code",
    scope:         "openid email profile",
    state,
    access_type:   "online",
    prompt:        "select_account",
  })

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
  )
}
