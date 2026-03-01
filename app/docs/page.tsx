// Server Component
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, ApiIcon, GlobeIcon, RouterIcon, ServerStack01Icon } from "@hugeicons/core-free-icons"

const sections = [
  {
    href:  "/docs/getting-started",
    icon:  ArrowRight01Icon,
    title: "Quick Start",
    desc:  "Up and running in under 5 minutes.",
  },
  {
    href:  "/docs/api",
    icon:  ApiIcon,
    title: "API Reference",
    desc:  "HTTP endpoints, parameters, and responses.",
  },
  {
    href:  "/docs/ipv6",
    icon:  ServerStack01Icon,
    title: "IPv6 & Subnets",
    desc:  "Dual-stack and prefix tracking.",
  },
  {
    href:  "/docs/clients",
    icon:  RouterIcon,
    title: "Client Setup",
    desc:  "ddclient, inadyn, router config.",
  },
]

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-xs bg-muted px-1.5 py-0.5 border border-border text-foreground">
      {children}
    </code>
  )
}

export default function DocsPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-mono uppercase tracking-widest text-primary mb-3">NovaDNS Docs</p>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Documentation</h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
          Everything you need to get NovaDNS working with your infrastructure.
          Backward-compatible with DynDNS and NoIP, with native IPv4 and IPv6 support.
        </p>
      </div>

      {/* Section cards */}
      <div className="grid sm:grid-cols-2 gap-px bg-border border border-border mb-10">
        {sections.map(({ href, icon, title, desc }) => (
          <Link
            key={href}
            href={href}
            className="group bg-background p-6 flex items-start gap-4 hover:bg-muted/40 transition-colors"
          >
            <div className="size-9 border border-border flex items-center justify-center shrink-0 group-hover:border-primary/40 transition-colors mt-0.5">
              <HugeiconsIcon icon={icon} strokeWidth={1.5} className="size-4 text-primary" />
            </div>
            <div>
              <div className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">{title}</div>
              <div className="text-xs text-muted-foreground leading-relaxed">{desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Base URL info */}
      <div className="border border-border">
        <div className="border-b border-border px-4 py-2.5 bg-muted/30">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Base URL</p>
        </div>
        <div className="px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <InlineCode>https://novadns.io</InlineCode>
          <p className="text-xs text-muted-foreground">
            All API endpoints are relative to this base. Use HTTPS — HTTP is not supported.
          </p>
        </div>
      </div>

      {/* Quick links */}
      <div className="border-t border-border mt-10 pt-8">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">Jump to</p>
        <div className="flex flex-wrap gap-2">
          {[
            { href: "/docs/getting-started", label: "Quick Start" },
            { href: "/docs/api#authentication", label: "Authentication" },
            { href: "/docs/api#endpoints", label: "Endpoints" },
            { href: "/docs/clients#ddclient", label: "ddclient" },
            { href: "/docs/clients#inadyn", label: "inadyn" },
            { href: "/docs/ipv6#subnets", label: "IPv6 Subnets" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-xs font-mono border border-border px-2.5 py-1 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
