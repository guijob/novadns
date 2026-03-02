"use client"

import Link from "next/link"
import { useState } from "react"
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
      "Drop-in replacement for DynDNS and NoIP. Works out-of-the-box with any router, NAS, or firmware that speaks those protocols. Zero reconfiguration.",
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
      "Track an entire IPv6 /48 or /64 prefix under a single hostname. Ideal for ISPs that assign dynamic prefix blocks to your router.",
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
      "Update with a single HTTP request. Compatible with curl, wget, ddclient, inadyn, and any HTTP-capable client or script.",
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
      "Enter your credentials in your router's DynDNS settings, or call the API directly.",
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

const faqs = [
  {
    q: "Is NovaDNS compatible with my router or NAS?",
    a: "Yes. NovaDNS implements the DynDNS and NoIP update protocols verbatim, so it works with any device or firmware that supports those providers — including Synology DSM, pfSense, OPNsense, OpenWrt, ASUS, TP-Link, UniFi, and more. No custom client needed.",
  },
  {
    q: "What is IPv6 subnet support?",
    a: "Many ISPs assign a dynamic IPv6 prefix block (e.g. 2001:db8:1234::/48) to your router rather than a single static address. NovaDNS can track that entire prefix under one hostname, so all devices inside your network remain reachable even as the prefix changes.",
  },
  {
    q: "How does the update API work?",
    a: "Send a GET or POST to https://novadns.io/api/update?token=YOUR_TOKEN. NovaDNS detects your public IP from the request and updates both A and AAAA records. You can also pass explicit IPs via the myip parameter, or use the DynDNS-compatible /nic/update endpoint with basic auth.",
  },
  {
    q: "What is the difference between Free and Pro?",
    a: "The Free plan covers 3 active hosts — more than enough for a home lab. Paid plans start at $5/mo for 25 hosts and scale up to 500 hosts at $50/mo. All paid plans include custom TTL, IPv6 subnet tracking, and priority support.",
  },
  {
    q: "Can I rotate my update token?",
    a: "Yes. Open the host settings in your dashboard and click Regenerate Token. The old token is invalidated immediately. Your device will start failing updates until you enter the new token — by design, so you stay in control.",
  },
]

const compatClients = [
  "ddclient",
  "inadyn",
  "pfSense",
  "OPNsense",
  "Synology",
  "UniFi",
  "ASUS",
  "OpenWrt",
  "TP-Link",
  "curl",
]

// ─── component ──────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── ANNOUNCEMENT STRIP ──────────────────────────────────────── */}
      <div className="relative bg-primary text-primary-foreground text-xs flex items-center justify-center gap-3 px-4 py-2.5 text-center">
        <span className="font-mono uppercase tracking-widest opacity-70 hidden sm:inline">New</span>
        <span className="hidden sm:block w-px h-3 bg-primary-foreground/30" />
        <span>
          IPv6 subnet support is live — one hostname for your entire{" "}
          <span className="font-mono">/48</span> or{" "}
          <span className="font-mono">/64</span> prefix.
        </span>
        <a
          href="#features"
          className="shrink-0 flex items-center gap-1 underline underline-offset-2 opacity-80 hover:opacity-100 transition-opacity font-medium"
        >
          Learn more
        </a>
      </div>

      {/* ── NAV ─────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="size-7 bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold select-none">
              N
            </div>
            <span className="font-semibold text-sm tracking-tight">NovaDNS</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
            <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/login" />}>
              Log in
            </Button>
            <Button size="sm" nativeButton={false} render={<Link href="/register" />}>
              Get started
            </Button>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <section className="relative border-b border-border overflow-hidden">
        <div className="absolute inset-0 opacity-[0.035] dark:opacity-[0.055]" style={DOT_GRID} />
        <div className="absolute inset-0 pointer-events-none" style={GLOW_TOP} />

        <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left — headline + CTAs */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <Badge variant="secondary" className="font-mono text-xs">DynDNS compatible</Badge>
              <Badge variant="secondary" className="font-mono text-xs">NoIP compatible</Badge>
              <Badge variant="secondary" className="font-mono text-xs">IPv6 native</Badge>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight leading-[1.06] mb-5">
              Dynamic DNS<br />
              <span className="text-primary">for the modern<br className="hidden sm:block" />infrastructure.</span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8 max-w-[420px]">
              The simplest way to keep your services reachable — with token security and IPv6 subnet support built in.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button size="lg" nativeButton={false} render={<Link href="/register" />}>
                Get Started Free
                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="ml-1 size-4" />
              </Button>
              <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/docs" />}>
                View Docs
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-2 gap-y-1.5">
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
          </div>

          {/* Right — host dashboard preview */}
          <div className="border border-border bg-card shadow-2xl">
            {/* Panel header */}
            <div className="border-b border-border px-4 py-3 flex items-center justify-between bg-muted/40">
              <span className="text-xs font-semibold">My Hosts</span>
              <div className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-green-500" />
                <span className="text-xs text-muted-foreground">3 online</span>
              </div>
            </div>

            {/* Host rows */}
            <div className="divide-y divide-border">
              {[
                {
                  name: "home.novadns.io",
                  ipv4: "203.0.113.42",
                  ipv6: "2001:db8::1",
                  seen: "just now",
                  online: true,
                },
                {
                  name: "office.novadns.io",
                  ipv4: "198.51.100.7",
                  ipv6: "2001:db8:a::1",
                  seen: "2 min ago",
                  online: true,
                },
                {
                  name: "vpn.novadns.io",
                  ipv4: "192.0.2.55",
                  ipv6: "2001:db8:b::1",
                  seen: "5 min ago",
                  online: true,
                },
                {
                  name: "nas.novadns.io",
                  ipv4: "203.0.113.88",
                  ipv6: null,
                  seen: "3 h ago",
                  online: false,
                },
              ].map((host) => (
                <div key={host.name} className="px-4 py-3.5 group hover:bg-muted/40 transition-colors">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`size-1.5 rounded-full shrink-0 ${host.online ? "bg-green-500" : "bg-muted-foreground/40"}`}
                      />
                      <span className="text-sm font-medium truncate">{host.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{host.seen}</span>
                  </div>
                  <div className="pl-3.5 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-muted-foreground w-7">IPv4</span>
                      <span className="text-xs font-mono text-foreground/80">{host.ipv4}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-muted-foreground w-7">IPv6</span>
                      <span className="text-xs font-mono text-foreground/80">
                        {host.ipv6 ?? <span className="text-muted-foreground/50">—</span>}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Panel footer */}
            <div className="border-t border-border px-4 py-2.5 flex items-center justify-between bg-muted/20">
              <span className="text-xs text-muted-foreground">novadns.io</span>
              <span className="text-xs text-muted-foreground font-mono">4 hosts · free plan</span>
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
              Everything your<br />infrastructure needs.
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
                  <span className="text-yellow-500">home.novadns.io</span>
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
              <p className="text-xs text-muted-foreground mt-1 mb-6">3 hosts · no card needed</p>
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
                <p className="text-xs text-muted-foreground mt-1 mb-6">{tier.hosts} hosts</p>
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

          <div className="max-w-3xl divide-y divide-border">
            {faqs.map((faq, i) => (
              <div key={i}>
                <button
                  className="w-full py-5 flex items-start justify-between gap-4 text-left cursor-pointer"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-medium leading-snug">{faq.q}</span>
                  <span
                    className="text-muted-foreground shrink-0 mt-0.5 transition-transform duration-200"
                    style={{ transform: openFaq === i ? "rotate(45deg)" : "rotate(0deg)" }}
                  >
                    <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="size-4" />
                  </span>
                </button>
                {openFaq === i && (
                  <div className="pb-5 text-sm text-muted-foreground leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
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
            Your IPs, always reachable.
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

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <footer className="py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-start justify-between gap-8">

          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-3">
              <div className="size-7 bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold select-none">
                N
              </div>
              <span className="font-semibold text-sm tracking-tight">NovaDNS</span>
            </Link>
            <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed">
              Dynamic DNS for the modern infrastructure.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-12 gap-y-6 text-xs text-muted-foreground">
            <div className="space-y-2.5">
              <p className="font-mono uppercase tracking-wide text-foreground text-[0.65rem]">Product</p>
              <div className="flex flex-col gap-2">
                <a href="#features" className="hover:text-foreground transition-colors">Features</a>
                <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
                <Link href="/docs" className="hover:text-foreground transition-colors">Docs</Link>
              </div>
            </div>
            <div className="space-y-2.5">
              <p className="font-mono uppercase tracking-wide text-foreground text-[0.65rem]">Account</p>
              <div className="flex flex-col gap-2">
                <Link href="/login" className="hover:text-foreground transition-colors">Log in</Link>
                <Link href="/register" className="hover:text-foreground transition-colors">Register</Link>
                <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
              </div>
            </div>
            <div className="space-y-2.5">
              <p className="font-mono uppercase tracking-wide text-foreground text-[0.65rem]">Legal</p>
              <div className="flex flex-col gap-2">
                <Link href="/terms"    className="hover:text-foreground transition-colors">Terms of Service</Link>
                <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
                <Link href="/cookies" className="hover:text-foreground transition-colors">Cookie Policy</Link>
                <Link href="/refunds" className="hover:text-foreground transition-colors">Refund Policy</Link>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground self-end">
            © {new Date().getFullYear()} NovaDNS
          </p>
        </div>
      </footer>
    </div>
  )
}
