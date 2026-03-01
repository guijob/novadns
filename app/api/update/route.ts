import { NextRequest, NextResponse } from "next/server"
import { compare } from "bcryptjs"
import { eq, and, inArray } from "drizzle-orm"
import { db } from "@/lib/db"
import { hosts, hostGroups, updateLog } from "@/lib/schema"
import { redis, hostUpdateKey, rateLimit } from "@/lib/redis"
import { upsertDnsRecord } from "@/lib/dns"
import { dispatchWebhook } from "@/lib/webhooks"

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

type HostRow = NonNullable<Awaited<ReturnType<typeof db.query.hosts.findFirst>>>

type ResolvedHost =
  | { status: "ok";      host: HostRow }
  | { status: "nohost";  subdomain: string }

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const tokenParam    = searchParams.get("token")
  const hostnameParam = searchParams.get("hostname")
  const ipParam       = searchParams.get("ip")  ?? searchParams.get("myip")   // myip = DynDNS standard
  const ip6Param      = searchParams.get("ip6") ?? searchParams.get("myip6")  // myip6 = extended standard

  // IP rate limit first — before any expensive auth (bcrypt/DB) operations
  const caller = callerIp(req)
  if (!await rateLimit(`rl:ip:${caller}`, 30, 60)) return res("abuse", 429)

  const base = process.env.BASE_DOMAIN ?? "novadns.io"

  // ── Resolve target hosts ─────────────────────────────────────────
  let targets: ResolvedHost[]

  if (tokenParam) {
    // Token auth always maps to exactly one host — hostname param is ignored
    const host = await db.query.hosts.findFirst({ where: eq(hosts.token, tokenParam) })
    if (!host) return res("badauth", 401)
    targets = [{ status: "ok", host }]

  } else {
    // Basic Auth
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

    // Parse comma-separated hostnames → subdomains
    const subdomains = hostnameParam
      ? hostnameParam.split(",").map(h => h.trim().replace(new RegExp(`\\.${base}$`), "")).filter(Boolean)
      : []

    // 1. Try host-level credentials
    const candidate = await db.query.hosts.findFirst({ where: eq(hosts.username, username) })
    if (candidate?.passwordHash && await compare(password, candidate.passwordHash)) {
      if (subdomains.length === 0) {
        targets = [{ status: "ok", host: candidate }]
      } else {
        targets = subdomains.map(sub =>
          candidate.subdomain === sub
            ? { status: "ok" as const,     host: candidate }
            : { status: "nohost" as const, subdomain: sub  }
        )
      }
    } else {
      // 2. Try group-level credentials
      const group = await db.query.hostGroups.findFirst({ where: eq(hostGroups.username, username) })
      if (!group?.passwordHash) return res("badauth", 401)
      if (!await compare(password, group.passwordHash)) return res("badauth", 401)

      // Group auth requires at least one hostname
      if (subdomains.length === 0) return res("badauth", 401)

      // Fetch all requested subdomains that belong to this group in one query
      const groupHosts = await db.query.hosts.findMany({
        where: and(eq(hosts.groupId, group.id), inArray(hosts.subdomain, subdomains)),
      })
      const hostMap = new Map(groupHosts.map(h => [h.subdomain, h]))

      targets = subdomains.map(sub => {
        const h = hostMap.get(sub)
        return h
          ? { status: "ok" as const,     host: h   }
          : { status: "nohost" as const, subdomain: sub }
      })
    }
  }

  // ── Process each target ──────────────────────────────────────────
  const lines:     string[] = []
  const clientIds: Set<number> = new Set()

  for (const target of targets) {
    if (target.status === "nohost") {
      lines.push("nohost")
      continue
    }

    const host = target.host

    if (!host.active) {
      lines.push("nohost")
      continue
    }

    if (!await rateLimit(`rl:host:${host.id}`, 10, 60)) {
      lines.push("abuse")
      continue
    }

    const newIpv4 = ipParam
      ? (isValidIpv4(ipParam) ? ipParam : null)
      : (isValidIpv4(caller) ? caller : host.ipv4)

    const newIpv6 = ip6Param
      ? (isValidIpv6(ip6Param) ? ip6Param : null)
      : (isValidIpv6(caller) ? caller : host.ipv6)

    const now       = new Date()
    const ipChanged = newIpv4 !== host.ipv4 || newIpv6 !== host.ipv6

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

    await db.update(hosts)
      .set({ ipv4: newIpv4, ipv6: newIpv6, lastSeenAt: now, lastSeenIp: caller, updatedAt: now })
      .where(eq(hosts.id, host.id))

    if (ipChanged) {
      await db.insert(updateLog).values({ hostId: host.id, ipv4: newIpv4, ipv6: newIpv6, callerIp: caller })

      dispatchWebhook(host.clientId, "host.ip_updated", {
        host: { id: host.id, subdomain: host.subdomain, fqdn: `${host.subdomain}.${base}`, ttl: host.ttl },
        ipv4: newIpv4,
        ipv6: newIpv6,
      })
    }

    clientIds.add(host.clientId)
    lines.push(ipChanged ? `good ${newIpv4 ?? newIpv6 ?? ""}` : `nochg ${newIpv4 ?? newIpv6 ?? ""}`)
  }

  // Signal SSE streams for all affected clients
  await Promise.all(
    [...clientIds].map(id => redis.set(hostUpdateKey(id), Date.now(), { ex: 90 }).catch(() => {}))
  )

  return res(lines.join("\n"))
}

// Routers using POST (some firmware variants)
export const POST = GET
