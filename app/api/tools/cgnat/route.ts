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

// RFC 6598 — ISP carrier-grade NAT address space
const CGNAT_RANGES = ["100.64.0.0/10"]

// RFC 1918 private ranges + loopback
const PRIVATE_RANGES = [
  "10.0.0.0/8",
  "172.16.0.0/12",
  "192.168.0.0/16",
  "127.0.0.0/8",
]

export async function GET() {
  const hdrs = await headers()

  const forwarded = hdrs.get("x-forwarded-for")
  const realIp    = hdrs.get("x-real-ip")

  const raw = forwarded ? forwarded.split(",")[0].trim() : (realIp ?? "unknown")

  // Strip IPv6-mapped IPv4 prefix (::ffff:1.2.3.4 → 1.2.3.4)
  const ip = raw.replace(/^::ffff:/i, "")

  const isIPv6 = ip.includes(":")

  // IPv6 loopback (::1) and link-local (fe80::/10) are not public addresses
  const isLoopback  = ip === "::1" || ip === "127.0.0.1"
  const isLinkLocal = /^fe80:/i.test(ip)

  type Status = "cgnat" | "private" | "public" | "ipv6" | "unknown"
  let status: Status

  if (ip === "unknown" || ip === "") {
    status = "unknown"
  } else if (isLoopback || isLinkLocal) {
    status = "unknown"
  } else if (isIPv6) {
    status = "ipv6"
  } else if (CGNAT_RANGES.some(r => inCidr(ip, r))) {
    status = "cgnat"
  } else if (PRIVATE_RANGES.some(r => inCidr(ip, r))) {
    status = "private"
  } else {
    status = "public"
  }

  return NextResponse.json({ ip, status })
}
