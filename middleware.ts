import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("nova_session")?.value

  if (!token || !(await verifyToken(token))) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
