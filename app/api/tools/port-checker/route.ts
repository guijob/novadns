import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import net from "net"

export const maxDuration = 12

function checkPort(host: string, port: number, timeoutMs = 6000): Promise<{ open: boolean; latencyMs: number | null }> {
  return new Promise(resolve => {
    const start = Date.now()
    const socket = new net.Socket()
    let settled = false

    const done = (open: boolean) => {
      if (settled) return
      settled = true
      socket.destroy()
      resolve({ open, latencyMs: open ? Date.now() - start : null })
    }

    socket.setTimeout(timeoutMs)
    socket.on("connect", () => done(true))
    socket.on("timeout", () => done(false))
    socket.on("error",   () => done(false))
    socket.connect(port, host)
  })
}

// Basic sanity check — not a full validator, just catches obvious garbage
function isValidHost(host: string): boolean {
  if (!host || host.length > 253) return false
  // IPv6 literal
  if (host.startsWith("[")) return host.endsWith("]")
  // hostname or IPv4
  return /^[a-zA-Z0-9.\-:]+$/.test(host)
}

export async function GET(req: NextRequest) {
  const portParam = req.nextUrl.searchParams.get("port")
  const hostParam = req.nextUrl.searchParams.get("host")?.trim()

  const port = parseInt(portParam ?? "", 10)
  if (!portParam || isNaN(port) || port < 1 || port > 65535) {
    return NextResponse.json({ error: "Port must be a number between 1 and 65535." }, { status: 400 })
  }

  let host: string

  if (hostParam) {
    if (!isValidHost(hostParam)) {
      return NextResponse.json({ error: "Invalid hostname or IP address." }, { status: 400 })
    }
    host = hostParam
  } else {
    // Fall back to caller's IP
    const hdrs = await headers()
    const forwarded = hdrs.get("x-forwarded-for")
    const realIp    = hdrs.get("x-real-ip")
    const raw = forwarded ? forwarded.split(",")[0].trim() : (realIp ?? "")
    host = raw.replace(/^::ffff:/i, "")

    if (!host || host === "::1" || host === "127.0.0.1") {
      return NextResponse.json({ error: "Could not determine your IP address." }, { status: 400 })
    }
  }

  const { open, latencyMs } = await checkPort(host, port)

  return NextResponse.json({ host, port, open, latencyMs })
}
