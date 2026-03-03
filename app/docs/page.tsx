// Server Component
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "NovaDNS Documentation",
  description: "Everything you need to set up and manage dynamic DNS with NovaDNS. Guides, API reference, client setup, and more.",
  openGraph: {
    title: "NovaDNS Documentation",
    description: "Everything you need to set up and manage dynamic DNS with NovaDNS. Guides, API reference, client setup, and more.",
    type: "website",
    url: "https://novadns.io/docs",
    siteName: "NovaDNS",
    images: [{ url: "https://novadns.io/opengraph-image" }],
  },
}
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRightIcon, ApiIcon, RouterIcon, ServerStackIcon,
  WebhookIcon, SecurityIcon, SettingsIcon, BookOpenIcon,
  HomeIcon, CloudIcon, UserGroupIcon,
} from "@hugeicons/core-free-icons"

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-xs bg-muted px-1.5 py-0.5 border border-border text-foreground">
      {children}
    </code>
  )
}

const gettingStarted = [
  { href: "/docs/getting-started", icon: ArrowRightIcon, title: "Quick Start",    desc: "Up and running in under 5 minutes."              },
  { href: "/docs/what-is-ddns",    icon: BookOpenIcon,   title: "What is DDNS?",  desc: "How dynamic DNS works and why you need it."      },
]

const reference = [
  { href: "/docs/api",     icon: ApiIcon,        title: "API Reference",        desc: "HTTP endpoints, parameters, and responses."    },
  { href: "/docs/dyndns",  icon: SettingsIcon,   title: "DynDNS Compatibility", desc: "Drop-in replacement for No-IP and DynDNS."     },
  { href: "/docs/ipv6",    icon: ServerStackIcon,title: "IPv6 & Subnets",       desc: "Dual-stack and prefix tracking for Pro+."      },
  { href: "/docs/plans",   icon: CloudIcon,      title: "Plans & Limits",       desc: "Feature comparison across all plan tiers."     },
]

const guides = [
  { href: "/docs/clients",         icon: SettingsIcon,   title: "Client Setup",    desc: "ddclient, inadyn, and other DDNS clients."      },
  { href: "/docs/routers",         icon: RouterIcon,     title: "Router Setup",    desc: "OpenWrt, pfSense, ASUS, Synology, UniFi."       },
  { href: "/docs/groups",          icon: UserGroupIcon,  title: "Groups",          desc: "Share credentials across multiple hosts."       },
  { href: "/docs/webhooks",        icon: WebhookIcon,    title: "Webhooks",        desc: "Real-time HTTP callbacks for host events."      },
  { href: "/docs/teams",           icon: UserGroupIcon,  title: "Teams",           desc: "Shared workspaces, roles, and host transfers."  },
  { href: "/docs/security",        icon: SecurityIcon,   title: "Security",        desc: "Tokens, MFA, secrets, and best practices."     },
  { href: "/docs/troubleshooting", icon: BookOpenIcon,   title: "Troubleshooting", desc: "Fix common issues with hosts and clients."      },
]

const learn = [
  { href: "/docs/home-server",       icon: HomeIcon,       title: "Home Server Guide",    desc: "Self-hosting with DDNS, ports, and VPN."      },
  { href: "/docs/static-vs-dynamic", icon: CloudIcon,      title: "Static vs Dynamic IP", desc: "When DDNS is all you need."                   },
  { href: "/docs/why-ipv6",          icon: ServerStackIcon,title: "Why IPv6?",            desc: "The case for dual-stack in your setup."        },
]

function SectionGrid({ items }: { items: typeof gettingStarted }) {
  return (
    <div className="grid sm:grid-cols-2 gap-px bg-border border border-border mb-8">
      {items.map(({ href, icon, title, desc }) => (
        <Link
          key={href}
          href={href}
          className="group bg-background p-5 flex items-start gap-4 hover:bg-muted/40 transition-colors"
        >
          <div className="size-8 border border-border flex items-center justify-center shrink-0 group-hover:border-primary/40 transition-colors mt-0.5">
            <HugeiconsIcon icon={icon} strokeWidth={1.5} className="size-4 text-primary" />
          </div>
          <div>
            <div className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">{title}</div>
            <div className="text-xs text-muted-foreground leading-relaxed">{desc}</div>
          </div>
        </Link>
      ))}
    </div>
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
          Backward-compatible with DynDNS and No-IP, with native IPv4 and IPv6 support.
        </p>
      </div>

      {/* Base URL */}
      <div className="border border-border mb-10">
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

      <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">Getting Started</h2>
      <SectionGrid items={gettingStarted} />

      <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">Reference</h2>
      <SectionGrid items={reference} />

      <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">Guides</h2>
      <SectionGrid items={guides} />

      <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">Learn</h2>
      <SectionGrid items={learn} />
    </div>
  )
}
