import { Logo } from "@/components/logo"
import type { Metadata } from "next"
import { cookies } from "next/headers"

export const metadata: Metadata = {
  title: "NovaDNS — Dynamic DNS for Cameras & IoT Devices",
  description: "Stable hostnames for dynamic IPs. NovaDNS keeps your IP cameras, IoT gateways, and remote sites reachable even as your IP changes. Free plan, no credit card required.",
  openGraph: {
    title: "NovaDNS — Dynamic DNS for Cameras & IoT Devices",
    description: "Stable hostnames for dynamic IPs. NovaDNS keeps your IP cameras, IoT gateways, and remote sites reachable even as your IP changes. Free plan, no credit card required.",
    type: "website",
    url: "https://novadns.io",
    siteName: "NovaDNS",
    images: [{ url: "https://novadns.io/opengraph-image" }],
  },
}
import { db } from "@/lib/db"
import { clients } from "@/lib/schema"
import { eq } from "drizzle-orm"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  RouterIcon,
  GlobeIcon,
  ServerStack01Icon,
  Key01Icon,
  Audit01Icon,
  ApiIcon,
  UserIcon,
  PlusSignIcon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  CrownIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"
import { getSession } from "@/lib/auth"
import { Typewriter } from "@/components/typewriter"
import { LandingFaq } from "@/components/landing-faq"
import { MarketingFooter } from "@/components/marketing-footer"
import { ThemeToggle } from "@/components/theme-toggle"

// ─── constants ──────────────────────────────────────────────────────────────

const DOT_GRID: React.CSSProperties = {
  backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
  backgroundSize: "24px 24px",
}

const GLOW_TOP: React.CSSProperties = {
  background:
    "radial-gradient(ellipse 80% 50% at 50% 0%, oklch(0.59 0.14 242 / 0.22), transparent)",
}

const GLOW_BOTTOM: React.CSSProperties = {
  background:
    "radial-gradient(ellipse 80% 50% at 50% 100%, oklch(0.59 0.14 242 / 0.18), transparent)",
}

const features = [
  {
    icon: RouterIcon,
    title: "DynDNS & NoIP Compatible",
    description:
      "Drop-in replacement for DynDNS and NoIP. Works out-of-the-box with any camera, IoT gateway, or router that speaks those protocols. Zero reconfiguration.",
  },
  {
    icon: GlobeIcon,
    title: "IPv4 + IPv6 Native",
    description:
      "Every host maintains both an A and AAAA record simultaneously. Dual-stack is the default, not a checkbox you enable later.",
  },
  {
    icon: ServerStack01Icon,
    title: "IPv6 Subnet Support",
    description:
      "Track an entire IPv6 /48 or /64 prefix under a single hostname. Ideal for sites with multiple cameras sharing a dynamic prefix.",
  },
  {
    icon: Key01Icon,
    title: "Per-User Token Auth",
    description:
      "Each host gets a unique 64-char token. No shared credentials. Rotate at any time without touching your device config.",
  },
  {
    icon: Audit01Icon,
    title: "Full Audit Trail",
    description:
      "Every IP change is recorded with timestamp and caller IP. The last 50 updates are always available in your dashboard.",
  },
  {
    icon: ApiIcon,
    title: "One-Line HTTP API",
    description:
      "Update with a single HTTP request. Compatible with curl, wget, ddclient, inadyn, and any HTTP-capable client — including camera firmware.",
  },
]

const steps = [
  {
    number: "01",
    icon: UserIcon,
    title: "Create your account",
    description: "Sign up for free in seconds. No credit card required.",
  },
  {
    number: "02",
    icon: PlusSignIcon,
    title: "Register a host",
    description: "Pick a subdomain. Get your unique update token instantly.",
  },
  {
    number: "03",
    icon: RouterIcon,
    title: "Point your device",
    description:
      "Configure your camera, gateway, or router's DynDNS settings — or call the API directly.",
  },
]

const freeFeatures = [
  "3 active hosts",
  "IPv4 + IPv6",
  "Token authentication",
  "Update logs",
  "DynDNS / NoIP compatible",
  "Standard TTL",
]

const freeMissing = ["IPv6 subnet support", "Custom TTL", "Priority support"]

const paidFeatures = [
  "IPv4 + IPv6",
  "Token authentication",
  "Basic Auth credentials",
  "Host groups",
  "Update logs",
  "DynDNS / NoIP compatible",
  "IPv6 subnet support",
  "Custom TTL",
  "Priority support",
]

const paidTiers = [
  { label: "Starter",    hosts: 25,  price: 5  },
  { label: "Pro",        hosts: 100, price: 15, popular: true },
  { label: "Business",   hosts: 200, price: 25 },
  { label: "Enterprise", hosts: 500, price: 50 },
]


const compatClients = [
  "Hikvision",
  "Dahua",
  "Reolink",
  "Axis",
  "ddclient",
  "inadyn",
  "pfSense",
  "OPNsense",
  "OpenWrt",
  "curl",
]

// ─── component ──────────────────────────────────────────────────────────────

export default async function LandingPage() {
  const session = await getSession()

  let dashboardSlug: string | null = null
  if (session) {
    const jar = await cookies()
    const lastSlug = jar.get("last_workspace")?.value

    if (lastSlug) {
      dashboardSlug = lastSlug
    } else {
      const client = await db.query.clients.findFirst({
        where: eq(clients.id, session.id),
        columns: { slug: true },
      })
      dashboardSlug = client?.slug ?? String(session.id)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── ANNOUNCEMENT STRIP ──────────────────────────────────────── */}
      <div className="relative bg-primary text-primary-foreground text-xs flex items-center justify-center gap-3 px-4 py-2.5 text-center">
        <span className="font-mono uppercase tracking-widest opacity-70 hidden sm:inline">IPv6</span>
        <span className="hidden sm:block w-px h-3 bg-primary-foreground/30" />
        <span>Why does IPv6 change everything for Dynamic DNS?</span>
        <Link
          href="/docs/why-ipv6"
          className="shrink-0 flex items-center gap-1 underline underline-offset-2 opacity-80 hover:opacity-100 transition-opacity font-medium"
        >
          Read the guide
        </Link>
      </div>

      {/* ── NAV ─────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo className="h-7 w-auto" />
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
            <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {dashboardSlug ? (
              <Button size="sm" nativeButton={false} render={<Link href={`/${dashboardSlug}`} />}>
                Dashboard
                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="ml-1 size-3.5" />
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/login" />}>
                  Log in
                </Button>
                <Button size="sm" nativeButton={false} render={<Link href="/register" />}>
                  Get started
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <section className="relative border-b border-border overflow-hidden">
        <div className="absolute inset-0 opacity-[0.035] dark:opacity-[0.055]" style={DOT_GRID} />
        <div className="absolute inset-0 pointer-events-none" style={GLOW_TOP} />

        <div className="relative max-w-5xl mx-auto px-6 pt-20 md:pt-28 text-center">

          {/* Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            <Badge variant="secondary" className="font-mono text-xs">DynDNS compatible</Badge>
            <Badge variant="secondary" className="font-mono text-xs">NoIP compatible</Badge>
            <Badge variant="secondary" className="font-mono text-xs">IPv6 native</Badge>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.06] mb-6">
            Dynamic DNS<br />
            <span className="text-primary">for <Typewriter /></span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl mx-auto">
            Keep your cameras, gateways, and device fleets always reachable — with token security and IPv6 subnet support built in.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <Button size="lg" nativeButton={false} render={<Link href="/register" />}>
              Get Started Free
              <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="ml-1 size-4" />
            </Button>
            <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/docs" />}>
              View Docs
            </Button>
          </div>

          {/* Compat strip */}
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 mb-16">
            <span className="text-xs text-muted-foreground font-mono mr-1">works with:</span>
            {compatClients.slice(0, 6).map((c) => (
              <span
                key={c}
                className="text-xs font-mono text-muted-foreground border border-border px-2 py-0.5 hover:border-primary/40 hover:text-foreground transition-colors cursor-default"
              >
                {c}
              </span>
            ))}
            <span className="text-xs text-muted-foreground">+&nbsp;more</span>
          </div>

          {/* Dashboard preview — centered wide card with bottom-fade peek */}
          <div className="relative">
            <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />

            <div className="border border-border bg-card shadow-2xl text-left">
              {/* Panel header */}
              <div className="border-b border-border px-5 py-3 flex items-center justify-between bg-muted/40">
                <span className="text-xs font-semibold">My Hosts</span>
                <div className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-green-500" />
                  <span className="text-xs text-muted-foreground">3 online</span>
                </div>
              </div>

              {/* Host rows — horizontal layout to use full width */}
              <div className="divide-y divide-border">
                {[
                  { name: "cam-lobby.novaip.link",     ipv4: "203.0.113.42",  ipv6: "2001:db8::1",   seen: "just now",  online: true  },
                  { name: "cam-warehouse.novaip.link", ipv4: "198.51.100.7",  ipv6: "2001:db8:a::1", seen: "2 min ago", online: true  },
                  { name: "sensor-hq.novaip.link",     ipv4: "192.0.2.55",    ipv6: "2001:db8:b::1", seen: "5 min ago", online: true  },
                  { name: "gate-south.novaip.link",    ipv4: "203.0.113.88",  ipv6: null,            seen: "3 h ago",   online: false },
                ].map((host) => (
                  <div key={host.name} className="px-5 py-3.5 flex items-center justify-between gap-4 group hover:bg-muted/40 transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`size-1.5 rounded-full shrink-0 ${host.online ? "bg-green-500" : "bg-muted-foreground/40"}`} />
                      <span className="text-sm font-medium truncate">{host.name}</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-6 shrink-0">
                      <div className="space-y-0.5 text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground w-7">IPv4</span>
                          <span className="text-foreground/80 w-36">{host.ipv4}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground w-7">IPv6</span>
                          <span className="text-foreground/80 w-36">{host.ipv6 ?? <span className="text-muted-foreground/40">—</span>}</span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground w-16 text-right">{host.seen}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Panel footer */}
              <div className="border-t border-border px-5 py-2.5 flex items-center justify-between bg-muted/20">
                <span className="text-xs text-muted-foreground">novaip.link</span>
                <span className="text-xs text-muted-foreground font-mono">4 devices · free plan</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────── */}
      <section id="features" className="py-24 border-b border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-14">
            <p className="text-xs text-primary font-mono uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Everything your<br />devices need.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
            {features.map((feature, i) => (
              <div
                key={i}
                className="bg-background p-8 group hover:bg-muted transition-colors duration-150"
              >
                <div className="mb-5 size-10 flex items-center justify-center border border-border group-hover:border-primary/40 transition-colors">
                  <HugeiconsIcon icon={feature.icon} strokeWidth={1.5} className="size-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 border-b border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-14">
            <p className="text-xs text-primary font-mono uppercase tracking-widest mb-3">How it works</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Up and running<br />in under 5 minutes.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-6 lg:gap-10">
            {steps.map((step, i) => (
              <div key={i} className="relative group">
                {i < steps.length - 1 && (
                  <div className="hidden md:flex absolute top-10 -right-3 lg:-right-5 z-10 text-border">
                    <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={1.5} className="size-5" />
                  </div>
                )}
                <div
                  className="text-[5rem] font-bold leading-none mb-5 select-none tabular-nums"
                  style={{ color: "var(--border)" }}
                >
                  {step.number}
                </div>
                <div className="mb-4 size-10 flex items-center justify-center border border-border group-hover:border-primary/40 transition-colors">
                  <HugeiconsIcon icon={step.icon} strokeWidth={1.5} className="size-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── API / INTEGRATION ───────────────────────────────────────── */}
      <section id="docs" className="py-24 border-b border-border bg-muted/20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-14">
            <p className="text-xs text-primary font-mono uppercase tracking-widest mb-3">Integration</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              One endpoint.<br />Any client.
            </h2>
            <p className="mt-4 text-muted-foreground max-w-lg">
              Use our simple HTTP API or fall back to the DynDNS-compatible
              endpoint — the same one your router already knows how to speak.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">

            {/* HTTP API block */}
            <div className="border border-border bg-card">
              <div className="border-b border-border px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground">curl</span>
                <Badge variant="secondary" className="text-xs font-mono">token auth</Badge>
              </div>
              <div className="p-5 font-mono text-xs space-y-1 overflow-x-auto leading-relaxed">
                <div className="text-muted-foreground"># GET or POST</div>
                <div>
                  <span className="text-foreground">curl </span>
                  <span className="text-primary">&quot;https://novadns.io/api/update</span>
                </div>
                <div className="pl-4">
                  <span className="text-primary">&nbsp;&nbsp;?token=YOUR_64_CHAR_TOKEN&quot;</span>
                </div>
                <div className="pt-2 text-muted-foreground"># Response</div>
                <div>
                  <span className="text-foreground">{"{ "}</span>
                  <span className="text-green-500 dark:text-green-400">&quot;ipv4&quot;</span>
                  <span className="text-foreground">: </span>
                  <span className="text-yellow-500">&quot;203.0.113.42&quot;</span>
                  <span className="text-foreground">,</span>
                </div>
                <div>
                  <span className="text-foreground">&nbsp;&nbsp;</span>
                  <span className="text-green-500 dark:text-green-400">&quot;ipv6&quot;</span>
                  <span className="text-foreground">: </span>
                  <span className="text-yellow-500">&quot;2001:db8::1&quot;</span>
                  <span className="text-foreground">{" }"}</span>
                </div>
              </div>
            </div>

            {/* ddclient config block */}
            <div className="border border-border bg-card">
              <div className="border-b border-border px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground">ddclient.conf</span>
                <Badge variant="secondary" className="text-xs font-mono">DynDNS compat</Badge>
              </div>
              <div className="p-5 font-mono text-xs space-y-1 overflow-x-auto leading-relaxed">
                <div>
                  <span className="text-muted-foreground">protocol</span>
                  <span className="text-foreground">=</span>
                  <span className="text-primary">dyndns2</span>
                </div>
                <div>
                  <span className="text-muted-foreground">server</span>
                  <span className="text-foreground">=</span>
                  <span className="text-primary">novadns.io</span>
                </div>
                <div>
                  <span className="text-muted-foreground">login</span>
                  <span className="text-foreground">=</span>
                  <span className="text-primary">your@email.com</span>
                </div>
                <div>
                  <span className="text-muted-foreground">password</span>
                  <span className="text-foreground">=</span>
                  <span className="text-primary">YOUR_TOKEN</span>
                </div>
                <div>
                  <span className="text-muted-foreground">use</span>
                  <span className="text-foreground">=</span>
                  <span className="text-primary">web</span>
                </div>
                <div>
                  <span className="text-muted-foreground">web</span>
                  <span className="text-foreground">=</span>
                  <span className="text-primary">checkip.dyndns.com</span>
                </div>
                <div className="pt-2">
                  <span className="text-yellow-500">home.novaip.link</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 border-b border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-14">
            <p className="text-xs text-primary font-mono uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Simple, honest pricing.
            </h2>
            <p className="mt-4 text-muted-foreground max-w-lg">
              Start for free. Scale up as you grow.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">

            {/* Free */}
            <div className="border border-border p-6 flex flex-col">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-4">Free</p>
              <div className="mb-1">
                <span className="text-3xl font-bold">$0</span>
                <span className="text-muted-foreground text-sm ml-1">/mo</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 mb-6">3 devices · no card needed</p>
              <ul className="space-y-2 mb-6 flex-1">
                {freeFeatures.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={1.5} className="size-3.5 text-primary shrink-0 mt-px" />
                    <span>{item}</span>
                  </li>
                ))}
                {freeMissing.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-3.5 shrink-0 mt-px" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button variant="outline" size="sm" className="w-full" nativeButton={false} render={<Link href="/register" />}>
                Get started
              </Button>
            </div>

            {/* Paid tiers */}
            {paidTiers.map(tier => (
              <div key={tier.label} className={`p-6 flex flex-col relative ${tier.popular ? "border-2 border-primary" : "border border-border"}`}>
                {tier.popular && (
                  <span className="absolute top-3 right-3 text-[10px] font-mono bg-primary text-primary-foreground px-1.5 py-0.5">
                    POPULAR
                  </span>
                )}
                <p className={`text-xs font-mono uppercase tracking-widest mb-4 flex items-center gap-1 ${tier.popular ? "text-primary" : "text-muted-foreground"}`}>
                  <HugeiconsIcon icon={CrownIcon} strokeWidth={2} className="size-3" />
                  {tier.label}
                </p>
                <div className="mb-1">
                  <span className="text-3xl font-bold">${tier.price}</span>
                  <span className="text-muted-foreground text-sm ml-1">/mo</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 mb-6">{tier.hosts} devices</p>
                <ul className="space-y-2 mb-6 flex-1">
                  {paidFeatures.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs">
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={1.5} className="size-3.5 text-primary shrink-0 mt-px" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Button size="sm" className="w-full" nativeButton={false} render={<Link href="/register" />}>
                  Get started
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 border-b border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-14">
            <p className="text-xs text-primary font-mono uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Common questions.
            </h2>
          </div>

          <LandingFaq />
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────────── */}
      <section className="py-28 border-b border-border relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={GLOW_BOTTOM} />
        <div className="absolute inset-0 opacity-[0.035] dark:opacity-[0.055]" style={DOT_GRID} />

        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs text-primary font-mono uppercase tracking-widest mb-4">
            Get started
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Your devices, always reachable.
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
            Free plan available. No credit card required.
            <br />
            Setup takes under 5 minutes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" nativeButton={false} render={<Link href="/register" />}>
              Get Started Free
              <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="ml-1 size-4" />
            </Button>
            <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/login" />}>
              Log in
            </Button>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
