import { Logo } from "@/components/logo"
import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  RouterIcon,
  GlobeIcon,
  Key01Icon,
  ServerStackIcon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons"
import { MarketingFooter } from "@/components/marketing-footer"
import { ThemeToggle } from "@/components/theme-toggle"

export const metadata: Metadata = {
  title: "About — NovaDNS",
  description: "NovaDNS is a modern dynamic DNS service built for teams managing IP cameras, IoT devices, and connected infrastructure in the field.",
  openGraph: {
    title: "About — NovaDNS",
    description: "NovaDNS is a modern dynamic DNS service built for teams managing IP cameras, IoT devices, and connected infrastructure in the field.",
    type: "website",
    url: "https://novadns.io/about",
    siteName: "NovaDNS",
    images: [{ url: "https://novadns.io/opengraph-image" }],
  },
}

const DOT_GRID: React.CSSProperties = {
  backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
  backgroundSize: "24px 24px",
}

const principles = [
  {
    icon: GlobeIcon,
    title: "IPv6 from day one",
    body: "Most DDNS services treat IPv6 as an afterthought. We built dual-stack support into the core — every host gets both an A and AAAA record, automatically.",
  },
  {
    icon: RouterIcon,
    title: "Works with everything",
    body: "Your cameras, gateways, and routers already know how to talk DynDNS. We implement the protocol faithfully so you don't need new firmware or special clients.",
  },
  {
    icon: Key01Icon,
    title: "Per-host credentials",
    body: "Each device has its own token and Basic Auth credentials. Rotate one without touching the others. No shared secrets across your fleet.",
  },
  {
    icon: ServerStackIcon,
    title: "Free tier that's actually useful",
    body: "Three devices, full dual-stack, webhooks, update logs — all on the free plan. No credit card required, no artificial limits to push you toward a paid tier.",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">

      {/* ── Nav ───────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo className="h-7 w-auto" />
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <Link href="/docs"    className="hover:text-foreground transition-colors">Docs</Link>
            <Link href="/about"   className="text-foreground">About</Link>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/login" />}>Log in</Button>
            <Button size="sm" nativeButton={false} render={<Link href="/register" />}>Get started</Button>
          </div>
        </div>
      </nav>

      <main className="flex-1">

        {/* ── Hero ──────────────────────────────────────────────────── */}
        <section className="relative border-b border-border overflow-hidden py-20 md:py-28">
          <div className="absolute inset-0 opacity-[0.035] dark:opacity-[0.055]" style={DOT_GRID} />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, oklch(0.59 0.14 242 / 0.18), transparent)" }}
          />
          <div className="relative max-w-6xl mx-auto px-6 max-w-2xl">
            <p className="text-xs font-mono uppercase tracking-widest text-primary mb-4">About</p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6">
              Built for teams managing<br />devices in the field.
            </h1>
            <p className="text-muted-foreground leading-relaxed text-lg max-w-xl">
              NovaDNS started as a simple frustration: existing DDNS services were either
              expensive, outdated, or didn't support IPv6 properly. We built the service
              we wanted to use ourselves — and teams managing cameras and IoT fleets needed it too.
            </p>
          </div>
        </section>

        {/* ── Mission ───────────────────────────────────────────────── */}
        <section className="border-b border-border py-20">
          <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-primary mb-4">Mission</p>
              <h2 className="text-2xl font-bold tracking-tight mb-5">
                Your IP changes.<br />Your hostname shouldn't.
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Most internet connections assign a different IP address every time your router reconnects.
                That makes it impossible to reliably reach a device in the field — a camera, a sensor, a gateway —
                from the outside world.
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Dynamic DNS solves this by keeping a hostname pointed at your current IP, updating
                automatically whenever it changes. It's been around for decades, but the tools
                haven't kept up with modern infrastructure.
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                NovaDNS is a fresh take: clean API, proper IPv6, webhook notifications, team support,
                and a protocol-compatible update endpoint that works with the cameras and gateways
                already deployed at your sites.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              {[
                "Free plan with no credit card required",
                "Native IPv4 + IPv6 dual-stack on every host",
                "DynDNS & NoIP protocol compatibility",
                "Per-host tokens — no shared credentials",
                "Real-time webhooks on IP change",
                "Update logs with timestamps and caller IPs",
                "Team workspaces for device fleet management",
              ].map(item => (
                <div key={item} className="flex items-start gap-3">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={1.5} className="size-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Principles ────────────────────────────────────────────── */}
        <section className="border-b border-border py-20">
          <div className="max-w-6xl mx-auto px-6">
            <p className="text-xs font-mono uppercase tracking-widest text-primary mb-4">Principles</p>
            <h2 className="text-2xl font-bold tracking-tight mb-12">How we think about the product</h2>
            <div className="grid sm:grid-cols-2 gap-px bg-border border border-border">
              {principles.map(({ icon, title, body }) => (
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

        {/* ── CTA ───────────────────────────────────────────────────── */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.035] dark:opacity-[0.055]" style={DOT_GRID} />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 60% 60% at 50% 100%, oklch(0.59 0.14 242 / 0.14), transparent)" }}
          />
          <div className="relative max-w-6xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Try it for free</h2>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto leading-relaxed">
              Three devices, full dual-stack, no credit card. Up and running in under 5 minutes.
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
