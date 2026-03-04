import { NextResponse } from "next/server"
import { headers } from "next/headers"

type IPv6Type = "global" | "unique-local" | "link-local" | "loopback" | "none"

function classifyIPv6(ip: string): IPv6Type {
  if (ip === "::1") return "loopback"
  const firstGroup = parseInt(ip.split(":")[0] || "0", 16)
  if ((firstGroup & 0xffc0) === 0xfe80) return "link-local"   // fe80::/10
  if ((firstGroup & 0xfe00) === 0xfc00) return "unique-local"  // fc00::/7
  if ((firstGroup & 0xe000) === 0x2000) return "global"        // 2000::/3
  return "global" // treat everything else as potentially routable
}

export async function GET() {
  const hdrs = await headers()

  const forwarded = hdrs.get("x-forwarded-for")
  const realIp    = hdrs.get("x-real-ip")
  const raw = forwarded ? forwarded.split(",")[0].trim() : (realIp ?? "unknown")

  // If it's IPv6-mapped IPv4 (::ffff:x.x.x.x) the connection is actually IPv4
  const isMappedIPv4 = /^::ffff:/i.test(raw)
  const ip = raw.replace(/^::ffff:/i, "")

  const isIPv6     = ip.includes(":") && !isMappedIPv4
  const isLoopback = ip === "::1"

  if (!isIPv6 || isLoopback) {
    return NextResponse.json({ hasIPv6: false, ip: null, type: "none" as IPv6Type })
  }

  const type = classifyIPv6(ip)
  const hasIPv6 = type === "global" || type === "unique-local"

  return NextResponse.json({ hasIPv6, ip, type })
}
