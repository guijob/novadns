"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckmarkCircle02Icon,
  Cancel01Icon,
  CrownIcon,
  PlusSignIcon,
  ArrowRight01Icon,
  MinusSignIcon,
} from "@hugeicons/core-free-icons"

// ─── data ───────────────────────────────────────────────────────────────────

const tiers = [
  {
    key:      "free",
    label:    "Free",
    price:    0,
    hosts:    3,
    popular:  false,
    cta:      "Get started",
    ctaHref:  "/register",
  },
  {
    key:      "starter",
    label:    "Starter",
    price:    5,
    hosts:    25,
    popular:  false,
    cta:      "Get started",
    ctaHref:  "/register",
  },
  {
    key:      "pro",
    label:    "Pro",
    price:    15,
    hosts:    100,
    popular:  true,
    cta:      "Get started",
    ctaHref:  "/register",
  },
  {
    key:      "business",
    label:    "Business",
    price:    25,
    hosts:    200,
    popular:  false,
    cta:      "Get started",
    ctaHref:  "/register",
  },
  {
    key:      "enterprise",
    label:    "Enterprise",
    price:    50,
    hosts:    500,
    popular:  false,
    cta:      "Get started",
    ctaHref:  "/register",
  },
]

type Availability = boolean | "partial"

interface Feature {
  label:      string
  free:       Availability
  starter:    Availability
  pro:        Availability
  business:   Availability
  enterprise: Availability
  note?:      string
}

const featureGroups: { group: string; features: Feature[] }[] = [
  {
    group: "Hosts & DNS",
    features: [
      { label: "Active hosts",          free: true,  starter: true,  pro: true,  business: true,  enterprise: true  },
      { label: "IPv4 (A records)",       free: true,  starter: true,  pro: true,  business: true,  enterprise: true  },
      { label: "IPv6 (AAAA records)",    free: true,  starter: true,  pro: true,  business: true,  enterprise: true  },
      { label: "Custom TTL",             free: false, starter: true,  pro: true,  business: true,  enterprise: true  },
      { label: "IPv6 subnet tracking",   free: false, starter: true,  pro: true,  business: true,  enterprise: true  },
    ],
  },
  {
    group: "Authentication",
    features: [
      { label: "Token authentication",   free: true,  starter: true,  pro: true,  business: true,  enterprise: true  },
      { label: "Basic Auth credentials", free: true,  starter: true,  pro: true,  business: true,  enterprise: true  },
      { label: "Custom credentials",     free: false, starter: false, pro: true,  business: true,  enterprise: true,
        note: "Set your own username & password per host" },
      { label: "Host groups",            free: false, starter: false, pro: true,  business: true,  enterprise: true,
        note: "Shared credentials across multiple hosts" },
    ],
  },
  {
    group: "Integrations",
    features: [
      { label: "DynDNS / NoIP protocol", free: true,  starter: true,  pro: true,  business: true,  enterprise: true  },
      { label: "Update logs",            free: true,  starter: true,  pro: true,  business: true,  enterprise: true  },
      { label: "Webhooks",               free: true,  starter: true,  pro: true,  business: true,  enterprise: true  },
    ],
  },
  {
    group: "Support",
    features: [
      { label: "Community support",      free: true,  starter: true,  pro: true,  business: true,  enterprise: true  },
      { label: "Priority support",       free: false, starter: false, pro: true,  business: true,  enterprise: true  },
    ],
  },
]

const faqs = [
  {
    q: "Is there a free trial on paid plans?",
    a: "There's no time-limited trial, but the Free plan is permanent with no credit card required. Try everything at your own pace and upgrade when you're ready. We also offer a 30-day money-back guarantee on your first subscription.",
  },
  {
    q: "Can I switch plans at any time?",
    a: "Yes. You can upgrade or downgrade at any time through the billing portal in your dashboard. Upgrades take effect immediately. If you downgrade and exceed the new plan's host limit, hosts above the limit will be disabled (oldest hosts are kept).",
  },
  {
    q: "Is NovaDNS compatible with my router or NAS?",
    a: "Yes. NovaDNS implements the DynDNS and NoIP update protocols verbatim, so it works with any device or firmware that supports those providers — including Synology DSM, pfSense, OPNsense, OpenWrt, ASUS, TP-Link, UniFi, and more.",
  },
  {
    q: "What is IPv6 subnet support?",
    a: "Many ISPs assign a dynamic IPv6 prefix block (e.g. 2001:db8:1234::/48) to your router rather than a single static address. NovaDNS can track that entire prefix under one hostname, so all devices inside your network remain reachable even as the prefix changes.",
  },
  {
    q: "What are host groups?",
    a: "Groups let you share one set of credentials across multiple hosts. Configure your router with a single username and password, then update dozens of subdomains in one request using comma-separated hostnames. Available on Pro and above.",
  },
  {
    q: "How does billing work?",
    a: "Subscriptions are billed monthly through Paddle, our payment processor. Paddle acts as the Merchant of Record and handles tax compliance worldwide. You can cancel at any time — your plan stays active until the end of the billing period.",
  },
]

// ─── helpers ────────────────────────────────────────────────────────────────

function Check() {
  return <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={1.5} className="size-4 text-primary mx-auto" />
}
function Cross() {
  return <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-4 text-muted-foreground/40 mx-auto" />
}
function Partial() {
  return <HugeiconsIcon icon={MinusSignIcon} strokeWidth={2} className="size-4 text-muted-foreground/60 mx-auto" />
}

function Cell({ val }: { val: Availability }) {
  if (val === true)      return <Check />
  if (val === "partial") return <Partial />
  return <Cross />
}

// ─── component ──────────────────────────────────────────────────────────────

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">

      {/* ── Nav ───────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 h-12 border-b border-border bg-background/80 backdrop-blur-md flex items-center shrink-0">
        <div className="w-full max-w-6xl mx-auto px-6 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="size-7 bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold select-none">
              N
            </div>
            <span className="font-semibold text-sm tracking-tight">NovaDNS</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/login" />}>
              Log in
            </Button>
            <Button size="sm" nativeButton={false} render={<Link href="/register" />}>
              Get started
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">

        {/* ── Hero ──────────────────────────────────────────────────── */}
        <section className="py-20 border-b border-border">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <p className="text-xs text-primary font-mono uppercase tracking-widest mb-3">Pricing</p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Simple, honest pricing.
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
              Start for free — no credit card required. Upgrade as you grow.
              Cancel any time.
            </p>
          </div>
        </section>

        {/* ── Tier cards ────────────────────────────────────────────── */}
        <section className="py-16 border-b border-border">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {tiers.map(tier => (
                <div
                  key={tier.key}
                  className={`p-6 flex flex-col relative ${
                    tier.popular ? "border-2 border-primary" : "border border-border"
                  }`}
                >
                  {tier.popular && (
                    <span className="absolute top-3 right-3 text-[10px] font-mono bg-primary text-primary-foreground px-1.5 py-0.5">
                      POPULAR
                    </span>
                  )}
                  <p className={`text-xs font-mono uppercase tracking-widest mb-4 flex items-center gap-1 ${
                    tier.popular ? "text-primary" : tier.price === 0 ? "text-muted-foreground" : "text-muted-foreground"
                  }`}>
                    {tier.price > 0 && <HugeiconsIcon icon={CrownIcon} strokeWidth={2} className="size-3" />}
                    {tier.label}
                  </p>
                  <div className="mb-1">
                    <span className="text-3xl font-bold">${tier.price}</span>
                    <span className="text-muted-foreground text-sm ml-1">/mo</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 mb-6">
                    {tier.hosts} host{tier.hosts !== 1 ? "s" : ""}
                    {tier.price === 0 ? " · no card needed" : ""}
                  </p>
                  <div className="flex-1" />
                  <Button
                    size="sm"
                    variant={tier.popular ? "default" : "outline"}
                    className="w-full"
                    nativeButton={false}
                    render={<Link href={tier.ctaHref} />}
                  >
                    {tier.cta}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Feature comparison ────────────────────────────────────── */}
        <section className="py-16 border-b border-border">
          <div className="max-w-6xl mx-auto px-6">
            <div className="mb-10">
              <p className="text-xs font-mono uppercase tracking-widest text-primary mb-3">Compare</p>
              <h2 className="text-2xl font-bold tracking-tight">Everything in detail</h2>
            </div>

            <div className="border border-border overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 font-medium text-xs text-muted-foreground w-[35%]">Feature</th>
                    {tiers.map(t => (
                      <th key={t.key} className={`text-center px-4 py-3 font-medium text-xs w-[13%] ${t.popular ? "text-primary" : "text-muted-foreground"}`}>
                        {t.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {featureGroups.map(({ group, features }) => (
                    <>
                      <tr key={group} className="border-b border-border bg-muted/20">
                        <td colSpan={6} className="px-4 py-2">
                          <span className="text-[0.65rem] font-mono uppercase tracking-widest text-muted-foreground">
                            {group}
                          </span>
                        </td>
                      </tr>
                      {features.map(f => (
                        <tr key={f.label} className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors">
                          <td className="px-4 py-3">
                            <span className="text-xs text-foreground">{f.label}</span>
                            {f.note && (
                              <p className="text-[0.65rem] text-muted-foreground mt-0.5">{f.note}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center"><Cell val={f.free} /></td>
                          <td className="px-4 py-3 text-center"><Cell val={f.starter} /></td>
                          <td className="px-4 py-3 text-center"><Cell val={f.pro} /></td>
                          <td className="px-4 py-3 text-center"><Cell val={f.business} /></td>
                          <td className="px-4 py-3 text-center"><Cell val={f.enterprise} /></td>
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────── */}
        <section className="py-16 border-b border-border">
          <div className="max-w-6xl mx-auto px-6">
            <div className="mb-10">
              <p className="text-xs font-mono uppercase tracking-widest text-primary mb-3">FAQ</p>
              <h2 className="text-2xl font-bold tracking-tight">Common questions</h2>
            </div>

            <div className="max-w-3xl divide-y divide-border">
              {faqs.map((faq, i) => (
                <div key={i}>
                  <button
                    className="w-full py-5 flex items-start justify-between gap-4 text-left cursor-pointer"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span className="font-medium text-sm leading-snug">{faq.q}</span>
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

        {/* ── CTA ───────────────────────────────────────────────────── */}
        <section className="py-24">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Ready to get started?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto leading-relaxed">
              Free plan available. No credit card required. Setup takes under 5 minutes.
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

      </main>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="border-t border-border py-6">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {[
            { href: "/terms",    label: "Terms" },
            { href: "/privacy",  label: "Privacy" },
            { href: "/cookies",  label: "Cookies" },
            { href: "/refunds",  label: "Refunds" },
          ].map(({ href, label }) => (
            <Link key={href} href={href} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              {label}
            </Link>
          ))}
          <span className="text-xs text-muted-foreground ml-auto">© {new Date().getFullYear()} NovaDNS</span>
        </div>
      </footer>

    </div>
  )
}
