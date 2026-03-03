import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"

// Top-level path segments that are NOT workspace slugs
const PUBLIC_SEGMENTS = new Set([
  "api", "login", "register", "pricing", "docs", "compare", "contact",
  "cookies", "privacy", "terms", "refunds", "forgot-password", "reset-password",
  "invite", "dashboard",
])

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Legacy /dashboard routes: verify session then let the layout redirect to /:slug
  if (pathname.startsWith("/dashboard")) {
    const token = req.cookies.get("nova_session")?.value
    if (!token || !(await verifyToken(token))) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
    return NextResponse.next()
  }

  // Workspace routes (/:slug and /:slug/*): track last visited workspace
  const firstSegment = pathname.split("/")[1]
  if (firstSegment && !PUBLIC_SEGMENTS.has(firstSegment)) {
    const res = NextResponse.next()
    res.cookies.set("last_workspace", firstSegment, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    })
    return res
  }

  return NextResponse.next()
}

export const config = {
  // Match all paths except static files, _next internals, and common static assets
  matcher: ["/((?!_next|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:png|jpg|jpeg|svg|ico|webp|css|js|woff2?)).*)"],
}
