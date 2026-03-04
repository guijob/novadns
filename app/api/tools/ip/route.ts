import { NextResponse } from "next/server"
import { headers } from "next/headers"

function ipToInt(ip: string): number {
  return ip.split(".").reduce((acc, oct) => ((acc * 256) + parseInt(oct, 10)) >>> 0, 0)
}

function inCidr(ip: string, cidr: string): boolean {
  const [base, bits] = cidr.split("/")
  const prefixLen = parseInt(bits, 10)
  if (prefixLen === 0) return true
  const mask = (~0 << (32 - prefixLen)) >>> 0
  return (ipToInt(ip) & mask) === (ipToInt(base) & mask)
}

type IpType = "cgnat" | "private" | "public"

function classifyIPv4(ip: string): IpType {
  if (inCidr(ip, "100.64.0.0/10")) return "cgnat"
  if (
    inCidr(ip, "10.0.0.0/8") ||
    inCidr(ip, "172.16.0.0/12") ||
    inCidr(ip, "192.168.0.0/16") ||
    inCidr(ip, "127.0.0.0/8")
  ) return "private"
  return "public"
}

export async function GET() {
  const hdrs = await headers()

  const forwarded = hdrs.get("x-forwarded-for")
  const realIp    = hdrs.get("x-real-ip")
  const raw = forwarded ? forwarded.split(",")[0].trim() : (realIp ?? "unknown")

  // Strip IPv6-mapped IPv4 (::ffff:1.2.3.4 → 1.2.3.4)
  const ip = raw.replace(/^::ffff:/i, "")

  const isIPv6     = ip.includes(":")
  const isLoopback = ip === "::1" || ip === "127.0.0.1"
  const isLinkLocal = /^fe80:/i.test(ip)

  if (!ip || ip === "unknown" || isLoopback || isLinkLocal) {
    return NextResponse.json({ ip: null, protocol: null, type: null })
  }

  if (isIPv6) {
    return NextResponse.json({ ip, protocol: "IPv6", type: "public" })
  }

  return NextResponse.json({ ip, protocol: "IPv4", type: classifyIPv4(ip) })
}
