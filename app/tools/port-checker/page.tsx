"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MarketingFooter } from "@/components/marketing-footer"
import { ThemeToggle } from "@/components/theme-toggle"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckmarkCircle02Icon,
  Cancel01Icon,
  ArrowRight01Icon,
  RouterIcon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons"

const DOT_GRID: React.CSSProperties = {
  backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
  backgroundSize: "24px 24px",
}

const COMMON_PORTS = [
  { port: 80,    label: "HTTP"      },
  { port: 443,   label: "HTTPS"     },
  { port: 22,    label: "SSH"       },
  { port: 21,    label: "FTP"       },
  { port: 8080,  label: "HTTP-Alt"  },
  { port: 3389,  label: "RDP"       },
  { port: 25565, label: "Minecraft" },
  { port: 32400, label: "Plex"      },
  { port: 554,   label: "RTSP"      },
]

const PORT_INFO: Record<number, string> = {
  80:    "Standard HTTP web traffic.",
  443:   "HTTPS — encrypted web traffic. Required for most modern sites.",
  22:    "SSH — remote terminal access. Commonly used for server management.",
  21:    "FTP — file transfers. Often replaced by SFTP (port 22).",
  8080:  "Alternative HTTP port. Common for dev servers and reverse proxies.",
  3389:  "Windows Remote Desktop Protocol.",
  25565: "Minecraft Java Edition game server.",
  32400: "Plex Media Server.",
  554:   "RTSP — Real Time Streaming Protocol. Used by IP cameras and video streamers.",
}

const explainers = [
  {
    icon: RouterIcon,
    title: "What port forwarding is",
    body: "Port forwarding tells your router to send incoming traffic on a specific port to a device on your local network. Without it, your router blocks all unsolicited inbound connections.",
  },
  {
    icon: CheckmarkCircle02Icon,
    title: "Why 'open' means reachable",
    body: "When this tool shows a port as open, it means our server successfully established a TCP connection to the target on that port. Any device on the internet can reach that port.",
  },
  {
    icon: Cancel01Icon,
    title: "Why ports show as closed",
    body: "A closed or filtered result means the connection timed out or was refused. Common causes: port forwarding not configured, firewall blocking the port, or your ISP blocking inbound traffic on that port.",
  },
  {
    icon: InformationCircleIcon,
    title: "ISP port blocking",
    body: "Many ISPs block inbound traffic on well-known ports (80, 443, 25) on residential connections. If you can't open these ports, switch to an alternative port or use a reverse proxy.",
  },
]

type Result = {
  host: string
  port: number
  open: boolean
  latencyMs: number | null
}

export default function PortCheckerPage() {
  const [hostInput, setHostInput] = useState("")
  const [portInput, setPortInput] = useState("")
  const [checking, setChecking]   = useState(false)
  const [result, setResult]       = useState<Result | null>(null)
  const [error, setError]         = useState<string | null>(null)

  // Pre-fill host with caller's detected IP
  useEffect(() => {
    fetch("/api/tools/ip")
      .then(r => r.json())
      .then(d => { if (d.ip) setHostInput(d.ip) })
      .catch(() => {})
  }, [])

  async function check(port: number, host?: string) {
    const target = (host ?? hostInput).trim()
    if (!target) { setError("Enter a host or IP address."); return }
    setChecking(true)
    setResult(null)
    setError(null)
    try {
      const params = new URLSearchParams({ port: String(port) })
      if (target) params.set("host", target)
      const res = await fetch(`/api/tools/port-checker?${params}`)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.")
      } else {
        setResult(data)
      }
    } catch {
      setError("Request failed. Please try again.")
    } finally {
      setChecking(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const port = parseInt(portInput, 10)
    if (isNaN(port) || port < 1 || port > 65535) {
      setError("Enter a valid port number between 1 and 65535.")
      return
    }
    check(port)
  }

  function selectPort(port: number) {
    setPortInput(String(port))
    check(port)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">

      {/* Nav */}
      <header className="sticky top-0 z-50 h-12 border-b border-border bg-background/80 backdrop-blur-md flex items-center shrink-0">
        <div className="w-full max-w-6xl mx-auto px-6 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="size-7 bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold select-none">N</div>
            <span className="font-semibold text-sm tracking-tight">NovaDNS</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/login" />}>Log in</Button>
            <Button size="sm" nativeButton={false} render={<Link href="/register" />}>Get started</Button>
          </div>
        </div>
      </header>

      <main className="flex-1">

        {/* Hero */}
        <section className="relative border-b border-border overflow-hidden py-16 md:py-24">
          <div className="absolute inset-0 opacity-[0.035] dark:opacity-[0.055]" style={DOT_GRID} />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, oklch(0.59 0.14 242 / 0.18), transparent)" }}
          />
          <div className="relative max-w-6xl mx-auto px-6 text-center">
            <p className="text-xs font-mono uppercase tracking-widest text-primary mb-4">Free tool</p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-4">
              Port Checker
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
              Test whether a port on any IP or hostname is reachable from the internet.
              Verify port forwarding, firewall rules, and server accessibility.
            </p>
          </div>
        </section>

        {/* Tool */}
        <section className="border-b border-border py-16">
          <div className="max-w-lg mx-auto px-6 space-y-5">

            {/* Common port chips */}
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Common ports</p>
              <div className="flex flex-wrap gap-2">
                {COMMON_PORTS.map(({ port, label }) => (
                  <button
                    key={port}
                    onClick={() => selectPort(port)}
                    disabled={checking}
                    className={`text-xs border px-3 py-1.5 font-mono transition-colors hover:border-primary hover:text-primary disabled:opacity-50 ${
                      result?.port === port || (portInput === String(port) && !result)
                        ? "border-primary text-primary bg-primary/5"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {port} <span className="text-[0.6rem] opacity-60 ml-0.5">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="host" className="text-xs">Host or IP address</Label>
                <Input
                  id="host"
                  value={hostInput}
                  onChange={e => setHostInput(e.target.value)}
                  placeholder="203.0.113.42 or home.example.com"
                  className="font-mono"
                  spellCheck={false}
                  autoComplete="off"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1 space-y-1.5">
                  <Label htmlFor="port" className="text-xs">Port</Label>
                  <Input
                    id="port"
                    value={portInput}
                    onChange={e => setPortInput(e.target.value)}
                    type="number"
                    min={1}
                    max={65535}
                    placeholder="1–65535"
                    className="font-mono"
                  />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={checking} className="shrink-0">
                    {checking ? "Checking…" : "Check port"}
                  </Button>
                </div>
              </div>
            </form>

            {/* Error */}
            {error && (
              <p className="text-xs text-destructive border border-destructive/30 bg-destructive/5 px-3 py-2">{error}</p>
            )}

            {/* Result */}
            {result && !checking && (
              <div className={`border ${result.open ? "border-primary/40" : "border-destructive/40"} bg-muted/10`}>
                <div className="p-5 flex items-start gap-4">
                  <div className={`size-9 border flex items-center justify-center shrink-0 ${result.open ? "border-primary/40" : "border-destructive/40"}`}>
                    <HugeiconsIcon
                      icon={result.open ? CheckmarkCircle02Icon : Cancel01Icon}
                      strokeWidth={1.5}
                      className={`size-4 ${result.open ? "text-primary" : "text-destructive"}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-sm font-semibold">
                        Port {result.port} is {result.open ? "open" : "closed"}
                      </p>
                      <span className={`text-xs border px-2 py-0.5 font-medium ${result.open ? "bg-primary/10 text-primary border-primary/30" : "bg-destructive/10 text-destructive border-destructive/30"}`}>
                        {result.open ? "Reachable" : "Not reachable"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono mb-2 break-all">{result.host}:{result.port}</p>
                    {result.open && result.latencyMs !== null && (
                      <p className="text-xs text-muted-foreground">Response in {result.latencyMs}ms</p>
                    )}
                    {PORT_INFO[result.port] && (
                      <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">{PORT_INFO[result.port]}</p>
                    )}
                    {!result.open && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Check your router's port forwarding settings, firewall rules, and make sure the service is running.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground text-center">
              Checks are made from our server. Leave host blank to test your own IP automatically.
            </p>
            {hostInput.includes(":") && !hostInput.startsWith("[") && (
              <p className="text-xs text-amber-600 dark:text-amber-400 border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-center">
                IPv6 targets may show as closed if our server lacks IPv6 egress — results for IPv6 addresses are not reliable.
              </p>
            )}
          </div>
        </section>

        {/* Explainers */}
        <section className="border-b border-border py-20">
          <div className="max-w-6xl mx-auto px-6">
            <p className="text-xs font-mono uppercase tracking-widest text-primary mb-4">How it works</p>
            <h2 className="text-2xl font-bold tracking-tight mb-12">Understanding ports and port forwarding</h2>
            <div className="grid sm:grid-cols-2 gap-px bg-border border border-border">
              {explainers.map(({ icon, title, body }) => (
                <div key={title} className="bg-background p-8">
                  <div className="size-9 border border-border flex items-center justify-center mb-5">
                    <HugeiconsIcon icon={icon} strokeWidth={1.5} className="size-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Port reference table */}
        <section className="border-b border-border py-16">
          <div className="max-w-6xl mx-auto px-6">
            <p className="text-xs font-mono uppercase tracking-widest text-primary mb-4">Reference</p>
            <h2 className="text-2xl font-bold tracking-tight mb-6">Common ports for home servers</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-border border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 font-mono font-medium text-muted-foreground">Port</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Protocol / Service</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { port: "80",    svc: "HTTP",         note: "Plain web traffic. ISPs often block inbound 80 on residential lines." },
                    { port: "443",   svc: "HTTPS",        note: "Encrypted web traffic. Required for SSL certificates and modern browsers." },
                    { port: "22",    svc: "SSH",          note: "Remote shell access. Consider moving to a non-standard port to reduce bot traffic." },
                    { port: "21",    svc: "FTP",          note: "File transfer. Use SFTP (port 22) instead for encrypted transfers." },
                    { port: "8080",  svc: "HTTP-Alt",     note: "Common alternative when ISPs block port 80. Used by many web apps." },
                    { port: "8443",  svc: "HTTPS-Alt",    note: "Alternative HTTPS port when 443 is blocked." },
                    { port: "3389",  svc: "RDP",          note: "Windows Remote Desktop. Heavily targeted by brute-force bots." },
                    { port: "25565", svc: "Minecraft",    note: "Java Edition game server default. Bedrock uses UDP 19132." },
                    { port: "32400", svc: "Plex",         note: "Plex Media Server. Can use relay without open port, but direct is faster." },
                    { port: "554",   svc: "RTSP",         note: "Real Time Streaming Protocol. Used by IP cameras and NVRs for live video feeds." },
                    { port: "51820", svc: "WireGuard",    note: "WireGuard VPN (UDP). Lets you tunnel into your home network." },
                  ].map(row => (
                    <tr key={row.port} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-mono text-foreground">{row.port}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.svc}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.035] dark:opacity-[0.055]" style={DOT_GRID} />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 60% 60% at 50% 100%, oklch(0.59 0.14 242 / 0.14), transparent)" }}
          />
          <div className="relative max-w-6xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Port open? Now keep the hostname stable.</h2>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto leading-relaxed">
              Port forwarding only works if your IP stays the same — or your hostname tracks it.
              NovaDNS does that automatically.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" nativeButton={false} render={<Link href="/register" />}>
                Get started free
                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="ml-1 size-4" />
              </Button>
              <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/docs/getting-started" />}>
                Read the docs
              </Button>
            </div>
          </div>
        </section>

      </main>

      <MarketingFooter />
    </div>
  )
}
