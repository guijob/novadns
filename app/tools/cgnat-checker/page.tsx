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
  RouterIcon,
  GlobeIcon,
  ArrowRight01Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons"

type Status = "loading" | "cgnat" | "private" | "public" | "ipv6" | "unknown"

const DOT_GRID: React.CSSProperties = {
  backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
  backgroundSize: "24px 24px",
}

const statusConfig: Record<Exclude<Status, "loading">, {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any
  iconClass: string
  badge: string
  badgeClass: string
  borderClass: string
  headline: string
  body: string
}> = {
  cgnat: {
    icon: Cancel01Icon,
    iconClass: "text-destructive",
    badge: "CGNAT detected",
    badgeClass: "bg-destructive/10 text-destructive border-destructive/30",
    borderClass: "border-destructive/40",
    headline: "You are behind Carrier-Grade NAT",
    body: "Your ISP has placed multiple customers — including you — behind a single shared public IP. This means port forwarding will not work and your home server cannot be reached directly from the internet. Standard DDNS can keep a hostname updated, but external traffic cannot reach your device without a tunnel.",
  },
  private: {
    icon: InformationCircleIcon,
    iconClass: "text-primary",
    badge: "Private IP",
    badgeClass: "bg-primary/10 text-primary border-primary/30",
    borderClass: "border-primary/40",
    headline: "Private IP detected",
    body: "We received a private IP address from your connection. This can happen if you're checking from a local network without NAT, a corporate proxy, or a VPN that routes traffic internally. Your actual public IP may differ.",
  },
  public: {
    icon: CheckmarkCircle02Icon,
    iconClass: "text-primary",
    badge: "No CGNAT",
    badgeClass: "bg-primary/10 text-primary border-primary/30",
    borderClass: "border-primary/40",
    headline: "You have a public IP address",
    body: "Your ISP assigns you a real public IP directly. You are not behind Carrier-Grade NAT. Port forwarding on your router will work, and a DDNS service like NovaDNS can keep a stable hostname pointing to your current IP — even as it changes.",
  },
  ipv6: {
    icon: GlobeIcon,
    iconClass: "text-primary",
    badge: "IPv6",
    badgeClass: "bg-primary/10 text-primary border-primary/30",
    borderClass: "border-primary/40",
    headline: "You are connecting via IPv6",
    body: "Carrier-Grade NAT is an IPv4 problem. Your IPv6 address is almost certainly a direct public address — no NAT involved. If you also have IPv4, check that separately by visiting this page over an IPv4-only connection.",
  },
  unknown: {
    icon: InformationCircleIcon,
    iconClass: "text-muted-foreground",
    badge: "Unknown",
    badgeClass: "bg-muted text-muted-foreground border-border",
    borderClass: "border-border",
    headline: "Could not determine your IP",
    body: "We received a loopback or unroutable address. This usually means you're running the tool locally (localhost), behind an unusual proxy, or using a VPN that rewrites the source IP. Try visiting this page on the network you want to check.",
  },
}

const explainers = [
  {
    icon: RouterIcon,
    title: "What is CGNAT?",
    body: "Carrier-Grade NAT (RFC 6598) lets an ISP share a single public IPv4 address across many customers. Your router gets an IP in the 100.64.0.0/10 range — a private address space reserved for ISPs — instead of a real public IP.",
  },
  {
    icon: Cancel01Icon,
    title: "Why it breaks home servers",
    body: "When you port-forward on your router, that rule only works between your LAN and your router's WAN IP. Under CGNAT, that WAN IP is inside the ISP's network and unreachable from the open internet. Traffic destined for your home never gets past the ISP's NAT gateway.",
  },
  {
    icon: CheckmarkCircle02Icon,
    title: "What you can do",
    body: "Ask your ISP for a public IP (sometimes free, sometimes a small fee). Alternatively, use a tunnel service such as Cloudflare Tunnel or Tailscale Funnel that proxies traffic from a public endpoint to your device — no port forwarding needed.",
  },
  {
    icon: GlobeIcon,
    title: "IPv6 is the long-term fix",
    body: "IPv6 provides enough addresses that every device gets a direct public address — no NAT, no CGNAT. If your ISP offers IPv6 and your router supports it, IPv6 services are reachable from the internet just like any server.",
  },
]

export default function CgnatCheckerPage() {
  const [ip, setIp]       = useState<string>("")
  const [status, setStatus] = useState<Status>("loading")

  useEffect(() => {
    fetch("/api/tools/cgnat")
      .then(r => r.json())
      .then(data => { setIp(data.ip); setStatus(data.status) })
      .catch(() => setStatus("unknown"))
  }, [])

  const cfg = status !== "loading" ? statusConfig[status] : null

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
              CGNAT Checker
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
              Find out instantly if your ISP is hiding you behind Carrier-Grade NAT
              — and what that means for your home server.
            </p>
          </div>
        </section>

        {/* Checker card */}
        <section className="border-b border-border py-16">
          <div className="max-w-lg mx-auto px-6">

            {status === "loading" ? (
              <div className="border border-border bg-muted/20 p-8 flex flex-col items-center gap-4">
                <div className="size-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">Checking your connection…</p>
              </div>
            ) : cfg ? (
              <div className={`border bg-muted/10 ${cfg.borderClass}`}>
                <div className="p-6 border-b border-border flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="size-9 border border-border flex items-center justify-center shrink-0">
                      <HugeiconsIcon icon={cfg.icon} strokeWidth={1.5} className={`size-4 ${cfg.iconClass}`} />
                    </div>
                    <div>
                      <p className="text-[0.65rem] font-mono uppercase tracking-widest text-muted-foreground mb-0.5">Your IP address</p>
                      <p className="font-mono text-sm font-medium">{ip || "—"}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium border px-2.5 py-1 shrink-0 ${cfg.badgeClass}`}>
                    {cfg.badge}
                  </span>
                </div>
                <div className="p-6">
                  <p className="text-sm font-semibold mb-2">{cfg.headline}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{cfg.body}</p>
                </div>
              </div>
            ) : null}

            <p className="text-xs text-muted-foreground text-center mt-4">
              This check is based on the IP address your browser's request arrives from.
              A VPN or proxy will show that service's IP instead of yours.
            </p>
          </div>
        </section>

        {/* Explainer grid */}
        <section className="border-b border-border py-20">
          <div className="max-w-6xl mx-auto px-6">
            <p className="text-xs font-mono uppercase tracking-widest text-primary mb-4">Background</p>
            <h2 className="text-2xl font-bold tracking-tight mb-12">Everything you need to know about CGNAT</h2>
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

        {/* CGNAT ranges reference */}
        <section className="border-b border-border py-16">
          <div className="max-w-6xl mx-auto px-6">
            <p className="text-xs font-mono uppercase tracking-widest text-primary mb-4">Reference</p>
            <h2 className="text-2xl font-bold tracking-tight mb-6">How CGNAT is detected</h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mb-8">
              IANA reserved the <code className="font-mono text-foreground bg-muted px-1 py-0.5">100.64.0.0/10</code> block
              (100.64.0.0 – 100.127.255.255) specifically for ISP carrier-grade NAT, as defined in{" "}
              <a
                href="https://datatracker.ietf.org/doc/html/rfc6598"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-foreground transition-colors"
              >
                RFC 6598
              </a>
              . If your public-facing IP falls in this range, your ISP is definitely using CGNAT.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-border border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 font-mono font-medium text-muted-foreground">Range</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Implication</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { range: "100.64.0.0 – 100.127.255.255", type: "CGNAT (RFC 6598)", implication: "ISP carrier-grade NAT — no port forwarding possible" },
                    { range: "10.0.0.0 – 10.255.255.255",    type: "Private (RFC 1918)", implication: "Behind a router or VPN — port forwarding works on your router" },
                    { range: "172.16.0.0 – 172.31.255.255",  type: "Private (RFC 1918)", implication: "Behind a router or VPN — port forwarding works on your router" },
                    { range: "192.168.0.0 – 192.168.255.255",type: "Private (RFC 1918)", implication: "Behind a router or VPN — port forwarding works on your router" },
                    { range: "Everything else (IPv4)",        type: "Public",             implication: "Direct public IP — DDNS works, port forwarding works" },
                  ].map(row => (
                    <tr key={row.range} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-mono text-foreground">{row.range}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.type}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.implication}</td>
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
            <h2 className="text-3xl font-bold tracking-tight mb-4">Not behind CGNAT?</h2>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto leading-relaxed">
              Keep a stable hostname pointed at your dynamic home IP.
              Free plan, no credit card, up and running in minutes.
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
