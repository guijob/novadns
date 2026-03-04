"use client"
import { Logo } from "@/components/logo"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MarketingFooter } from "@/components/marketing-footer"
import { ThemeToggle } from "@/components/theme-toggle"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Copy01Icon,
  CheckmarkCircle02Icon,
  ArrowRight01Icon,
  RouterIcon,
  GlobeIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons"

const DOT_GRID: React.CSSProperties = {
  backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
  backgroundSize: "24px 24px",
}

type IpData = {
  ip: string | null
  protocol: "IPv4" | "IPv6" | null
  type: "public" | "cgnat" | "private" | null
}

const typeConfig = {
  public: {
    label: "Public IP",
    className: "bg-primary/10 text-primary border-primary/30",
    note: "Your ISP assigns you a real public IP. Dynamic DNS will work — your IP just needs to stay pointed to a hostname.",
  },
  cgnat: {
    label: "CGNAT",
    className: "bg-destructive/10 text-destructive border-destructive/30",
    note: "Your ISP is sharing this IP across many customers. Port forwarding won't work without requesting a public IP or using a tunnel.",
  },
  private: {
    label: "Private IP",
    className: "bg-muted text-muted-foreground border-border",
    note: "We're seeing a private IP, which usually means you're on a local network, VPN, or corporate proxy.",
  },
}

const faqs = [
  {
    q: "Why does my IP address change?",
    a: "Most ISPs assign IP addresses dynamically via DHCP. When your router reconnects — after a reboot, power outage, or lease expiry — it may receive a different IP. This is normal, but it breaks services that rely on a fixed IP.",
  },
  {
    q: "What is the difference between a public and private IP?",
    a: "A public IP is routable on the internet and assigned directly by your ISP. Private IPs (10.x.x.x, 192.168.x.x, 172.16-31.x.x) are used inside local networks. Your home devices use private IPs and share one public IP through your router (NAT).",
  },
  {
    q: "Can I get a static IP from my ISP?",
    a: "Yes, many ISPs offer static (fixed) IPs, usually for a monthly fee or on business plans. If your IP changes infrequently, a DDNS service is a cheaper alternative that automatically tracks your IP.",
  },
  {
    q: "What is CGNAT and why does it matter?",
    a: "Carrier-Grade NAT means your ISP places multiple customers behind a single shared public IP. This makes it impossible to run a home server accessible from the internet. You can't port-forward past the ISP's gateway.",
  },
  {
    q: "Does NovaDNS work with a dynamic IP?",
    a: "Yes — that's exactly what it's for. Your router or a small client updates NovaDNS whenever your IP changes, keeping your hostname (e.g. home.example.novadns.io) pointed at your current address.",
  },
]

export default function WhatIsMyIpPage() {
  const [data, setData]       = useState<IpData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied]   = useState(false)

  useEffect(() => {
    fetch("/api/tools/ip")
      .then(r => r.json())
      .then((d: IpData) => { setData(d); setLoading(false) })
      .catch(() => { setData({ ip: null, protocol: null, type: null }); setLoading(false) })
  }, [])

  function copyIp() {
    if (!data?.ip) return
    navigator.clipboard.writeText(data.ip).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const cfg = data?.type ? typeConfig[data.type] : null

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
              What Is My IP Address?
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
              See your public IP address instantly — and find out whether it's static,
              dynamic, or hidden behind carrier-grade NAT.
            </p>
          </div>
        </section>

        {/* IP Card */}
        <section className="border-b border-border py-16">
          <div className="max-w-lg mx-auto px-6">

            {loading ? (
              <div className="border border-border bg-muted/20 p-10 flex flex-col items-center gap-4">
                <div className="size-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">Detecting your IP…</p>
              </div>
            ) : data?.ip ? (
              <div className="border border-border bg-muted/10">
                <div className="px-6 py-5 border-b border-border flex items-center justify-between gap-4">
                  <p className="text-[0.65rem] font-mono uppercase tracking-widest text-muted-foreground">Your IP address</p>
                  <div className="flex items-center gap-2">
                    {data.protocol && (
                      <span className="text-xs font-mono border border-border px-2 py-0.5 text-muted-foreground">
                        {data.protocol}
                      </span>
                    )}
                    {cfg && (
                      <span className={`text-xs font-medium border px-2 py-0.5 ${cfg.className}`}>
                        {cfg.label}
                      </span>
                    )}
                  </div>
                </div>

                <div className="px-6 py-8 flex items-center justify-between gap-4">
                  <p className="font-mono text-2xl md:text-3xl font-semibold tracking-tight break-all">{data.ip}</p>
                  <button
                    onClick={copyIp}
                    className="shrink-0 size-9 border border-border flex items-center justify-center hover:bg-muted/50 transition-colors"
                    aria-label="Copy IP address"
                  >
                    <HugeiconsIcon
                      icon={copied ? CheckmarkCircle02Icon : Copy01Icon}
                      strokeWidth={1.5}
                      className={`size-4 ${copied ? "text-primary" : "text-muted-foreground"}`}
                    />
                  </button>
                </div>

                {cfg && (
                  <div className="px-6 py-4 border-t border-border bg-muted/20">
                    <p className="text-xs text-muted-foreground leading-relaxed">{cfg.note}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="border border-border bg-muted/10 p-8">
                <p className="text-sm font-semibold mb-1">Could not detect your IP</p>
                <p className="text-sm text-muted-foreground">Try disabling your VPN and refreshing the page.</p>
              </div>
            )}

            <p className="text-xs text-muted-foreground text-center mt-4">
              This is the IP your browser's request arrives from. A VPN or proxy will show that service's IP.
            </p>
          </div>
        </section>

        {/* Other tools */}
        <section className="border-b border-border py-12">
          <div className="max-w-lg mx-auto px-6">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">Related tools</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { href: "/tools/cgnat-checker",        icon: RouterIcon,   label: "CGNAT Checker",  desc: "Are you behind carrier-grade NAT?" },
                { href: "/tools/ipv6-checker",          icon: GlobeIcon,    label: "IPv6 Test",       desc: "Do you have IPv6 connectivity?" },
                { href: "/tools/port-checker",  icon: Cancel01Icon, label: "Port Checker",    desc: "Is a port open on your IP?" },
              ].map(({ href, icon, label, desc }) => (
                <Link
                  key={href}
                  href={href}
                  className="border border-border p-4 hover:bg-muted/30 transition-colors group"
                >
                  <div className="size-7 border border-border flex items-center justify-center mb-3">
                    <HugeiconsIcon icon={icon} strokeWidth={1.5} className="size-3.5 text-primary" />
                  </div>
                  <p className="text-xs font-semibold mb-0.5 group-hover:text-primary transition-colors">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-b border-border py-20">
          <div className="max-w-6xl mx-auto px-6">
            <p className="text-xs font-mono uppercase tracking-widest text-primary mb-4">FAQ</p>
            <h2 className="text-2xl font-bold tracking-tight mb-10">Common questions about IP addresses</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {faqs.map(({ q, a }) => (
                <div key={q}>
                  <p className="text-sm font-semibold mb-2">{q}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
                </div>
              ))}
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
            <h2 className="text-3xl font-bold tracking-tight mb-4">Your IP changes. Your hostname shouldn't.</h2>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto leading-relaxed">
              NovaDNS keeps a stable hostname pointed at your dynamic IP — automatically updated
              whenever it changes.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" nativeButton={false} render={<Link href="/register" />}>
                Get started free
                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="ml-1 size-4" />
              </Button>
              <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/docs/what-is-ddns" />}>
                What is DDNS?
              </Button>
            </div>
          </div>
        </section>

      </main>

      <MarketingFooter />
    </div>
  )
}
