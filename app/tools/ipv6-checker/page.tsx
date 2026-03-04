"use client"
import { Logo } from "@/components/logo"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MarketingFooter } from "@/components/marketing-footer"
import { ThemeToggle } from "@/components/theme-toggle"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckmarkCircle02Icon,
  Cancel01Icon,
  ArrowRight01Icon,
  GlobeIcon,
  RouterIcon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons"

const DOT_GRID: React.CSSProperties = {
  backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
  backgroundSize: "24px 24px",
}

type IPv6Data = {
  hasIPv6: boolean
  ip: string | null
  type: "global" | "unique-local" | "link-local" | "loopback" | "none"
}

const typeLabels: Record<NonNullable<IPv6Data["type"]>, { label: string; desc: string }> = {
  global:        { label: "Global unicast",  desc: "A routable public IPv6 address. Reachable from anywhere on the internet." },
  "unique-local": { label: "Unique local",   desc: "Similar to private IPv4 (fc00::/7). Routable within your network, not on the public internet." },
  "link-local":  { label: "Link-local",      desc: "Only valid on your local network segment (fe80::/10). Not routable beyond your router." },
  loopback:      { label: "Loopback",        desc: "The ::1 loopback address — only visible locally, not a real network connection." },
  none:          { label: "No IPv6",         desc: "Your connection is IPv4 only." },
}

const explainers = [
  {
    icon: GlobeIcon,
    title: "Why IPv6 exists",
    body: "IPv4 has roughly 4.3 billion addresses — not enough for every device on earth. IPv6 provides 2¹²⁸ addresses (340 undecillion), enough for every device to have a unique public address with no NAT required.",
  },
  {
    icon: CheckmarkCircle02Icon,
    title: "IPv6 means no NAT",
    body: "With IPv6, your devices get direct public addresses. There's no router NAT, no port forwarding configuration, and no CGNAT. Any device can be reached directly from the internet — assuming your firewall allows it.",
  },
  {
    icon: RouterIcon,
    title: "IPv6 and home servers",
    body: "An IPv6 home server is simpler to expose than IPv4: no port forwarding rules needed. The main challenges are that your prefix may change (ISPs use prefix delegation) and not all client networks support IPv6 yet.",
  },
  {
    icon: InformationCircleIcon,
    title: "Dual-stack with NovaDNS",
    body: "NovaDNS creates both A (IPv4) and AAAA (IPv6) records for every host, automatically updated whenever your IP changes. Visitors reach you via whichever protocol their network prefers.",
  },
]

export default function IPv6TestPage() {
  const [data, setData]       = useState<IPv6Data | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/tools/ipv6")
      .then(r => r.json())
      .then((d: IPv6Data) => { setData(d); setLoading(false) })
      .catch(() => { setData({ hasIPv6: false, ip: null, type: "none" }); setLoading(false) })
  }, [])

  const typeInfo = data ? typeLabels[data.type] : null

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">

      {/* Nav */}
      <header className="sticky top-0 z-50 h-12 border-b border-border bg-background/80 backdrop-blur-md flex items-center shrink-0">
        <div className="w-full max-w-6xl mx-auto px-6 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo className="h-7 w-auto" />
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
              IPv6 Connectivity Test
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
              Check whether your internet connection supports IPv6, see your address,
              and understand what it means for your home server.
            </p>
          </div>
        </section>

        {/* Result card */}
        <section className="border-b border-border py-16">
          <div className="max-w-lg mx-auto px-6">
            {loading ? (
              <div className="border border-border bg-muted/20 p-10 flex flex-col items-center gap-4">
                <div className="size-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">Testing IPv6 connectivity…</p>
              </div>
            ) : data ? (
              <div className={`border bg-muted/10 ${data.hasIPv6 ? "border-primary/40" : "border-border"}`}>

                <div className="px-6 py-5 border-b border-border flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`size-9 border flex items-center justify-center ${data.hasIPv6 ? "border-primary/40" : "border-border"}`}>
                      <HugeiconsIcon
                        icon={data.hasIPv6 ? CheckmarkCircle02Icon : Cancel01Icon}
                        strokeWidth={1.5}
                        className={`size-4 ${data.hasIPv6 ? "text-primary" : "text-muted-foreground"}`}
                      />
                    </div>
                    <div>
                      <p className="text-[0.65rem] font-mono uppercase tracking-widest text-muted-foreground mb-0.5">IPv6 status</p>
                      <p className="text-sm font-semibold">
                        {data.hasIPv6 ? "IPv6 connectivity detected" : "No IPv6 detected"}
                      </p>
                    </div>
                  </div>
                  {typeInfo && (
                    <span className={`text-xs font-medium border px-2.5 py-1 shrink-0 ${data.hasIPv6 ? "bg-primary/10 text-primary border-primary/30" : "bg-muted text-muted-foreground border-border"}`}>
                      {typeInfo.label}
                    </span>
                  )}
                </div>

                {data.ip && (
                  <div className="px-6 py-5 border-b border-border">
                    <p className="text-[0.65rem] font-mono uppercase tracking-widest text-muted-foreground mb-2">Your IPv6 address</p>
                    <p className="font-mono text-sm break-all text-foreground">{data.ip}</p>
                  </div>
                )}

                <div className="px-6 py-4 bg-muted/20">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {data.hasIPv6
                      ? typeInfo?.desc + " NovaDNS automatically creates an AAAA record for your hostname and keeps it updated."
                      : "Your browser connected via IPv4 only. Your ISP may not support IPv6, or your router may not have it enabled. IPv4 DDNS still works normally with NovaDNS."}
                  </p>
                </div>
              </div>
            ) : null}

            <p className="text-xs text-muted-foreground text-center mt-4">
              IPv6 detection depends on how your browser connected to this page. A VPN may mask your real IPv6 address.
            </p>
          </div>
        </section>

        {/* Explainers */}
        <section className="border-b border-border py-20">
          <div className="max-w-6xl mx-auto px-6">
            <p className="text-xs font-mono uppercase tracking-widest text-primary mb-4">Background</p>
            <h2 className="text-2xl font-bold tracking-tight mb-12">IPv6 and home servers explained</h2>
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

        {/* IPv6 address types reference */}
        <section className="border-b border-border py-16">
          <div className="max-w-6xl mx-auto px-6">
            <p className="text-xs font-mono uppercase tracking-widest text-primary mb-4">Reference</p>
            <h2 className="text-2xl font-bold tracking-tight mb-6">IPv6 address types</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-border border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 font-mono font-medium text-muted-foreground">Prefix</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Routable?</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Used for</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { prefix: "::1",         type: "Loopback",       routable: "No",          use: "Localhost only — equivalent to 127.0.0.1" },
                    { prefix: "fe80::/10",   type: "Link-local",     routable: "No",          use: "Auto-configured on every IPv6 interface; only valid on the local segment" },
                    { prefix: "fc00::/7",    type: "Unique local",   routable: "Private only", use: "Private networks — like RFC 1918 in IPv4" },
                    { prefix: "2000::/3",    type: "Global unicast", routable: "Yes",          use: "Public internet addresses — the ones ISPs assign" },
                    { prefix: "64:ff9b::/96",type: "NAT64",          routable: "Via gateway",  use: "IPv4-mapped addresses used by transition mechanisms" },
                  ].map(row => (
                    <tr key={row.prefix} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-mono text-foreground">{row.prefix}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.type}</td>
                      <td className={`px-4 py-3 ${row.routable === "Yes" ? "text-primary" : "text-muted-foreground"}`}>{row.routable}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.use}</td>
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
            <h2 className="text-3xl font-bold tracking-tight mb-4">Full dual-stack DDNS, built in.</h2>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto leading-relaxed">
              NovaDNS automatically updates both your A and AAAA records whenever
              your IPv4 or IPv6 address changes. No extra config needed.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" nativeButton={false} render={<Link href="/register" />}>
                Get started free
                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="ml-1 size-4" />
              </Button>
              <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/docs/ipv6" />}>
                IPv6 docs
              </Button>
            </div>
          </div>
        </section>

      </main>

      <MarketingFooter />
    </div>
  )
}
