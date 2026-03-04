// Server Component
import type { Metadata } from "next"
import { CodeBlock, c } from "../_components/code-block"
import { PageNav } from "../_components/page-nav"

export const metadata: Metadata = {
  title: "What is Dynamic DNS? — NovaDNS Docs",
  description: "Dynamic DNS (DDNS) explained. Learn how it works, why your IP address changes, and how NovaDNS keeps your hostname up to date.",
  openGraph: {
    title: "What is Dynamic DNS? — NovaDNS Docs",
    description: "Dynamic DNS (DDNS) explained. Learn how it works, why your IP address changes, and how NovaDNS keeps your hostname up to date.",
    type: "article",
    url: "https://novadns.io/docs/what-is-ddns",
    siteName: "NovaDNS",
    images: [{ url: "https://novadns.io/opengraph-image" }],
  },
}

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-xs bg-muted px-1.5 py-0.5 border border-border text-foreground">
      {children}
    </code>
  )
}

function SectionDivider() {
  return <div className="border-t border-border mt-10 pt-10" />
}

export default function WhatIsDdnsPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-widest text-primary mb-3">Learn</p>
        <h1 className="text-2xl font-bold tracking-tight mb-2">What is DDNS?</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Dynamic DNS (DDNS) is the technology that lets you reliably reach a device even when its
          public IP address changes. Here&apos;s everything you need to understand how it works and
          why you need it.
        </p>
      </div>

      {/* The dynamic IP problem */}
      <h2 className="text-base font-semibold mt-8 mb-3">The dynamic IP problem</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        When your device connects to the internet, your ISP assigns it a public IP address. For
        most home and small business connections, this IP is <strong className="text-foreground font-medium">dynamic</strong> —
        it can change at any time: when your router reboots, when your ISP performs maintenance, or
        simply when your DHCP lease expires.
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        This creates a problem the moment you want to access your home network from outside — for
        example, to reach a file server, security camera, self-hosted application, or VPN. If you
        bookmark your IP address today and it changes tomorrow, the bookmark stops working and you
        have no way to reconnect without first discovering your new IP.
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        DDNS solves this problem by giving you a stable <em>hostname</em> that always points to
        your current IP — no matter how often it changes.
      </p>

      <SectionDivider />

      {/* How DDNS works */}
      <h2 className="text-base font-semibold mt-8 mb-3">How DDNS works</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        DDNS works through three components working together: a DDNS provider, a client running on
        your network, and the DNS system.
      </p>

      <div className="border border-border divide-y divide-border my-5">
        {[
          {
            n: "1",
            title: "DDNS client detects your IP",
            desc: "A lightweight program runs on your router or server. It periodically checks your current public IP address — either by querying a detection service or by reading it from your router's WAN interface.",
          },
          {
            n: "2",
            title: "Client calls the update API",
            desc: "When your IP changes (or on a regular schedule), the client sends an authenticated HTTP request to the DDNS provider's update endpoint — in NovaDNS's case, https://novadns.io/api/update.",
          },
          {
            n: "3",
            title: "Provider updates the DNS record",
            desc: "NovaDNS receives the update and immediately sets the A record (for IPv4) or AAAA record (for IPv6) for your hostname — for example, home.novaip.link — to your new IP address.",
          },
          {
            n: "4",
            title: "Other devices look up the hostname",
            desc: "Anything that needs to reach your device uses the hostname instead of the IP. Because the TTL is kept low (60 seconds), DNS changes propagate globally within about a minute.",
          },
        ].map(({ n, title, desc }) => (
          <div key={n} className="grid sm:grid-cols-[48px_1fr] items-start px-4 py-4 gap-4">
            <div className="size-7 border border-border flex items-center justify-center text-xs font-mono font-bold text-primary shrink-0">
              {n}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-1">{title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        From the perspective of anything connecting to your device, it simply uses a hostname like{" "}
        <InlineCode>home.novaip.link</InlineCode> and it always works — even after your IP has
        changed multiple times.
      </p>

      <SectionDivider />

      {/* DNS records involved */}
      <h2 className="text-base font-semibold mt-8 mb-3">DNS records involved</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        NovaDNS manages two DNS record types for each hostname, updated automatically whenever the
        client reports a new address.
      </p>

      <div className="border border-border divide-y divide-border">
        {[
          {
            record: "A",
            description: "Maps your hostname to an IPv4 address (e.g. 203.0.113.42). Updated whenever your IPv4 changes.",
          },
          {
            record: "AAAA",
            description: "Maps your hostname to an IPv6 address (e.g. 2001:db8::1). Updated only when an IPv6 address is detected. Deleted if the client reports no IPv6.",
          },
        ].map(({ record, description }) => (
          <div key={record} className="grid grid-cols-[72px_1fr] items-start">
            <div className="px-4 py-3.5 border-r border-border">
              <code className="text-xs font-mono text-primary font-bold">{record}</code>
            </div>
            <div className="px-4 py-3.5">
              <span className="text-xs text-muted-foreground leading-relaxed">{description}</span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed mt-4 mb-4">
        All NovaDNS records are published with a TTL of <strong className="text-foreground font-medium">60 seconds</strong>.
        This means that after an IP change, the new address is visible globally within about one
        minute — far faster than standard DNS which can cache records for hours.
      </p>

      <CodeBlock filename="dig" label="example DNS lookup">
        {c.prompt("$ ")}{c.kw("dig")}{c.plain(" ")}{c.str("home.novaip.link")}{c.plain(" A +short")}{"\n"}
        {c.out("203.0.113.42")}{"\n"}
        {"\n"}
        {c.prompt("$ ")}{c.kw("dig")}{c.plain(" ")}{c.str("home.novaip.link")}{c.plain(" AAAA +short")}{"\n"}
        {c.out("2001:db8::1")}
      </CodeBlock>

      <SectionDivider />

      {/* DDNS vs static IP */}
      <h2 className="text-base font-semibold mt-8 mb-3">DDNS vs static IP</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        A static IP is an address that never changes — your ISP assigns it permanently to your
        account. It sounds like the obvious solution, but there are significant drawbacks.
      </p>
      <ul className="space-y-1.5 my-4 text-sm text-muted-foreground list-disc list-inside">
        <li>Static IPs typically cost <strong className="text-foreground font-medium">$10–20 per month</strong> on top of your normal internet bill</li>
        <li>Many ISPs — particularly residential ones — simply do not offer static IPs to home customers</li>
        <li>Business-grade static IP packages often require a contract and a premises visit</li>
        <li>You still need a domain name and DNS hosting to make the IP usable as a hostname</li>
      </ul>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        DDNS achieves the same end result — a stable, human-readable hostname that always reaches
        your device — for a fraction of the cost, and in most cases entirely for free. The 60-second
        TTL means updates propagate fast enough that, in practice, the brief changeover period during
        an IP change is unnoticeable.
      </p>

      <SectionDivider />

      {/* Common use cases */}
      <h2 className="text-base font-semibold mt-8 mb-3">Common use cases</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        DDNS is useful anywhere you need to reliably reach a device over the internet when you
        cannot control the IP address assigned to it.
      </p>

      <ul className="space-y-1.5 my-4 text-sm text-muted-foreground list-disc list-inside">
        <li><strong className="text-foreground font-medium">Remote access to a home server</strong> — reach your Nextcloud, Plex, or Home Assistant from anywhere</li>
        <li><strong className="text-foreground font-medium">VPN server</strong> — use your hostname as the WireGuard or OpenVPN endpoint</li>
        <li><strong className="text-foreground font-medium">Security cameras</strong> — connect to your NVR or camera system from your phone</li>
        <li><strong className="text-foreground font-medium">NAS (Network Attached Storage)</strong> — access your files remotely without a cloud subscription</li>
        <li><strong className="text-foreground font-medium">Game servers</strong> — give friends a stable address to connect to your Minecraft, Valheim, or other server</li>
        <li><strong className="text-foreground font-medium">Self-hosted web services</strong> — run your own website, API, or app without paying for a cloud VM</li>
        <li><strong className="text-foreground font-medium">Remote desktop</strong> — RDP or VNC into your home PC from the office</li>
      </ul>

      <SectionDivider />

      {/* Why NovaDNS */}
      <h2 className="text-base font-semibold mt-8 mb-3">Why NovaDNS?</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        There are several DDNS providers available, but NovaDNS is built for users who care about
        reliability, privacy, and a clean experience.
      </p>

      <div className="border border-border divide-y divide-border">
        {[
          {
            title: "No ads, no trackers",
            desc: "NovaDNS does not run ads or sell your data. The service is supported by straightforward paid plans.",
          },
          {
            title: "Dedicated novaip.link domain",
            desc: "Your hostnames live under novaip.link — a clean, dedicated domain that is not shared with unrelated services.",
          },
          {
            title: "First-class IPv6 support",
            desc: "Both A and AAAA records are managed automatically. IPv6 is supported on every plan including Free.",
          },
          {
            title: "DynDNS compatibility",
            desc: "Works with every router, NAS, and DDNS client out of the box. No plugins or scripts required for most devices.",
          },
          {
            title: "Webhook events",
            desc: "Get notified via HTTP webhook whenever a host's IP changes. Useful for automation, monitoring, and audit trails.",
          },
          {
            title: "Teams",
            desc: "Share a workspace with your team on paid plans. Role-based access control keeps the right people in control.",
          },
        ].map(({ title, desc }) => (
          <div key={title} className="px-4 py-3.5 grid sm:grid-cols-[200px_1fr] gap-2 items-start">
            <span className="text-xs font-semibold text-foreground">{title}</span>
            <span className="text-xs text-muted-foreground leading-relaxed">{desc}</span>
          </div>
        ))}
      </div>

      <PageNav />
    </div>
  )
}
