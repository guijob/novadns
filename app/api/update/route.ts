import { NextRequest, NextResponse } from "next/server"
import { compare } from "bcryptjs"
import { eq, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { hosts, hostGroups, updateLog } from "@/lib/schema"
import { redis, hostUpdateKey, rateLimit } from "@/lib/redis"
import { upsertDnsRecord } from "@/lib/dns"

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
  const tokenParam   = searchParams.get("token")
  const hostnameParam = searchParams.get("hostname") // used with Basic Auth
  const ipParam  = searchParams.get("ip")   // optional — falls back to caller IP
  const ip6Param = searchParams.get("ip6")  // optional explicit IPv6

  // IP rate limit first — before any expensive auth (bcrypt/DB) operations
  const caller = callerIp(req)
  const ipAllowed = await rateLimit(`rl:ip:${caller}`, 30, 60)
  if (!ipAllowed) return res("abuse", 429)

  let host: Awaited<ReturnType<typeof db.query.hosts.findFirst>>

  if (tokenParam) {
    // Token-based auth (existing)
    host = await db.query.hosts.findFirst({ where: eq(hosts.token, tokenParam) })
  } else {
    // Basic Auth: Authorization: Basic base64(username:password)
    const authHeader = req.headers.get("authorization") ?? ""
    if (!authHeader.startsWith("Basic ")) return res("badauth", 401)

    let username: string, password: string
    try {
      const decoded = Buffer.from(authHeader.slice(6), "base64").toString("utf8")
      const colon   = decoded.indexOf(":")
      username = decoded.slice(0, colon)
      password = decoded.slice(colon + 1)
    } catch {
      return res("badauth", 401)
    }

    if (!username || !password) return res("badauth", 401)

    // 1. Try host-level credentials
    const candidate = await db.query.hosts.findFirst({ where: eq(hosts.username, username) })
    if (candidate?.passwordHash && await compare(password, candidate.passwordHash)) {
      // If ?hostname= is supplied, verify it matches the found host
      if (hostnameParam) {
        const base = process.env.BASE_DOMAIN ?? "novadns.io"
        const expectedSubdomain = hostnameParam.replace(`.${base}`, "")
        if (candidate.subdomain !== expectedSubdomain) return res("badauth", 401)
      }
      host = candidate
    } else {
      // 2. Try group-level credentials
      const group = await db.query.hostGroups.findFirst({ where: eq(hostGroups.username, username) })
      if (!group?.passwordHash) return res("badauth", 401)
      const validGroup = await compare(password, group.passwordHash)
      if (!validGroup) return res("badauth", 401)

      // Group auth requires ?hostname= to identify the target host
      if (!hostnameParam) return res("badauth", 401)

      const base = process.env.BASE_DOMAIN ?? "novadns.io"
      const subdomain = hostnameParam.replace(`.${base}`, "")
      const groupHost = await db.query.hosts.findFirst({
        where: and(eq(hosts.subdomain, subdomain), eq(hosts.groupId, group.id)),
      })
      if (!groupHost) return res("badauth", 401)
      host = groupHost
    }
  }

  if (!host || !host.active) return res("badauth", 401)

  // Per-host rate limit after auth (we need the host ID)
  const hostAllowed = await rateLimit(`rl:host:${host.id}`, 10, 60)
  if (!hostAllowed) return res("abuse", 429)

  // Resolve IPs to store
  const newIpv4 = ipParam
    ? (isValidIpv4(ipParam) ? ipParam : null)
    : (isValidIpv4(caller) ? caller : host.ipv4)   // auto-detect from caller

  const newIpv6 = ip6Param
    ? (isValidIpv6(ip6Param) ? ip6Param : null)
    : (isValidIpv6(caller) ? caller : host.ipv6)   // auto-detect if caller is IPv6

  const now = new Date()
  const ipChanged = newIpv4 !== host.ipv4 || newIpv6 !== host.ipv6

  // Update DNS records when IP changes (parallel with DB write)
  if (ipChanged) {
    await Promise.all([
      newIpv4 !== host.ipv4 && newIpv4
        ? upsertDnsRecord(host.subdomain, "A",    newIpv4, host.ttl)
        : Promise.resolve(),
      newIpv6 !== host.ipv6 && newIpv6
        ? upsertDnsRecord(host.subdomain, "AAAA", newIpv6, host.ttl)
        : Promise.resolve(),
    ])
  }

  // Always update lastSeen so the "Online" status stays current
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

  if (ipChanged) {
    await db.insert(updateLog).values({
      hostId:   host.id,
      ipv4:     newIpv4,
      ipv6:     newIpv6,
      callerIp: caller,
    })
  }

  // Signal SSE streams for this client
  await redis.set(hostUpdateKey(host.clientId), Date.now(), { ex: 90 }).catch(() => {})

  return res(ipChanged ? `good ${newIpv4 ?? newIpv6 ?? ""}` : `nochg ${newIpv4 ?? newIpv6 ?? ""}`)
}

// Routers using POST (some firmware variants)
export const POST = GET
