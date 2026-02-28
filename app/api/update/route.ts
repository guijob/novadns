import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { hosts, updateLog } from "@/lib/schema"

// DynDNS-compatible response codes
const res = (body: string, status = 200) =>
  new NextResponse(body, { status, headers: { "Content-Type": "text/plain" } })

function callerIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  )
}

function isValidIpv4(ip: string) {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(ip) &&
    ip.split(".").every(n => parseInt(n) <= 255)
}

function isValidIpv6(ip: string) {
  return /^[0-9a-fA-F:]+$/.test(ip) && ip.includes(":")
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const token = searchParams.get("token")
  const ipParam = searchParams.get("ip")     // optional — falls back to caller IP
  const ip6Param = searchParams.get("ip6")   // optional explicit IPv6

  if (!token) return res("badauth", 401)

  // Look up host by token
  const host = await db.query.hosts.findFirst({
    where: eq(hosts.token, token),
  })

  if (!host || !host.active) return res("badauth", 401)

  const caller = callerIp(req)

  // Resolve IPs to store
  const newIpv4 = ipParam
    ? (isValidIpv4(ipParam) ? ipParam : null)
    : (isValidIpv4(caller) ? caller : host.ipv4)   // auto-detect from caller

  const newIpv6 = ip6Param
    ? (isValidIpv6(ip6Param) ? ip6Param : null)
    : (isValidIpv6(caller) ? caller : host.ipv6)   // auto-detect if caller is IPv6

  // No-change check
  if (newIpv4 === host.ipv4 && newIpv6 === host.ipv6) {
    return res(`nochg ${newIpv4 ?? newIpv6 ?? ""}`)
  }

  const now = new Date()

  await db
    .update(hosts)
    .set({
      ipv4:       newIpv4,
      ipv6:       newIpv6,
      lastSeenAt: now,
      lastSeenIp: caller,
      updatedAt:  now,
    })
    .where(eq(hosts.id, host.id))

  await db.insert(updateLog).values({
    hostId:   host.id,
    ipv4:     newIpv4,
    ipv6:     newIpv6,
    callerIp: caller,
  })

  return res(`good ${newIpv4 ?? newIpv6 ?? ""}`)
}

// Routers using POST (some firmware variants)
export const POST = GET
