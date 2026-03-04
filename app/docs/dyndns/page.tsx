// Server Component
import type { Metadata } from "next"
import { CodeBlock, c } from "../_components/code-block"
import { PageNav } from "../_components/page-nav"

export const metadata: Metadata = {
  title: "DynDNS Protocol — NovaDNS Docs",
  description: "NovaDNS implements the DynDNS v2 protocol for compatibility with routers, NAS devices, and legacy DDNS clients.",
  openGraph: {
    title: "DynDNS Protocol — NovaDNS Docs",
    description: "NovaDNS implements the DynDNS v2 protocol for compatibility with routers, NAS devices, and legacy DDNS clients.",
    type: "article",
    url: "https://novadns.io/docs/dyndns",
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

export default function DynDNSPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-widest text-primary mb-3">Reference</p>
        <h1 className="text-2xl font-bold tracking-tight mb-2">DynDNS Compatibility</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          NovaDNS speaks the DynDNS v2 protocol natively, so any client, router firmware, or NAS
          that supports No-IP or DynDNS works with NovaDNS without modification.
        </p>
      </div>

      {/* What is DynDNS compatibility */}
      <h2 className="text-base font-semibold mt-8 mb-3">What is DynDNS compatibility?</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        The DynDNS v2 protocol is a simple HTTP-based update standard that became the de facto
        interface for dynamic DNS services in the early 2000s. Nearly every router, NAS, VPN
        appliance, and DDNS client in existence implements it — including ddclient, inadyn, Fritz!Box,
        pfSense, Synology DSM, ASUS routers, and UniFi gateways.
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        NovaDNS exposes the <InlineCode>/nic/update</InlineCode> endpoint that speaks this same
        protocol. That means you can point any of those existing clients at{" "}
        <InlineCode>novadns.io</InlineCode> and they will work immediately — no plugins, no custom
        scripts, no modifications.
      </p>

      <SectionDivider />

      {/* The /nic/update endpoint */}
      <h2 className="text-base font-semibold mt-8 mb-3">The /nic/update endpoint</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        The endpoint is a standard HTTP GET request authenticated with HTTP Basic Auth. Use the
        host&apos;s <strong className="text-foreground font-medium">username</strong> and{" "}
        <strong className="text-foreground font-medium">password</strong> from the dashboard
        (host settings → Basic Auth credentials). These are separate from your account login.
      </p>

      <div className="border border-border divide-y divide-border mb-5">
        <div className="grid grid-cols-[160px_1fr] items-center px-4 py-3 gap-4">
          <span className="text-xs font-mono text-muted-foreground">Method</span>
          <code className="text-xs font-mono text-foreground">GET</code>
        </div>
        <div className="grid grid-cols-[160px_1fr] items-center px-4 py-3 gap-4">
          <span className="text-xs font-mono text-muted-foreground">URL</span>
          <code className="text-xs font-mono text-foreground">https://novadns.io/nic/update</code>
        </div>
        <div className="grid grid-cols-[160px_1fr] items-center px-4 py-3 gap-4">
          <span className="text-xs font-mono text-muted-foreground">Auth</span>
          <code className="text-xs font-mono text-foreground">HTTP Basic Auth (host username:password)</code>
        </div>
        <div className="grid grid-cols-[160px_1fr] items-start px-4 py-3 gap-4">
          <span className="text-xs font-mono text-muted-foreground mt-0.5">Parameters</span>
          <div className="space-y-1.5">
            <div className="flex items-baseline gap-2">
              <code className="text-xs font-mono text-foreground">hostname</code>
              <span className="text-xs text-primary font-mono">required</span>
              <span className="text-xs text-muted-foreground">— full hostname, e.g. <InlineCode>home.novaip.link</InlineCode></span>
            </div>
            <div className="flex items-baseline gap-2">
              <code className="text-xs font-mono text-foreground">myip</code>
              <span className="text-xs text-muted-foreground font-mono">optional</span>
              <span className="text-xs text-muted-foreground">— IPv4 address; auto-detected if omitted</span>
            </div>
            <div className="flex items-baseline gap-2">
              <code className="text-xs font-mono text-foreground">myip6</code>
              <span className="text-xs text-muted-foreground font-mono">optional</span>
              <span className="text-xs text-muted-foreground">— IPv6 address; auto-detected if omitted</span>
            </div>
          </div>
        </div>
      </div>

      <CodeBlock filename="curl" label="DynDNS compat — basic auth">
        {c.prompt("$ ")}{c.kw("curl")}{c.plain(" \\\n")}
        {c.plain("  ")}{c.str('"https://')}{c.url("YOUR_USERNAME")}{c.str(":")}{c.url("YOUR_PASSWORD")}{c.str("@novadns.io/nic/update")}{c.plain(" \\\n")}
        {c.plain("  ")}{c.flag("?hostname=")}{c.str("home.novaip.link")}{c.str('"')}{"\n"}
        {"\n"}
        {c.dim("# Response")}{"\n"}
        {c.out("good 203.0.113.42")}
      </CodeBlock>

      <div className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 p-4 my-5 text-sm text-blue-900 dark:text-blue-200">
        Find your host credentials in the dashboard under host settings → <strong>Basic Auth credentials</strong>.
        If the host belongs to a group, use the group&apos;s username and password instead.
      </div>

      <SectionDivider />

      {/* Response codes */}
      <h2 className="text-base font-semibold mt-8 mb-3">Response codes</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        The <InlineCode>/nic/update</InlineCode> endpoint returns plain-text DynDNS-style response
        strings. Clients use these to determine whether the update succeeded and whether to retry.
      </p>

      <div className="border border-border">
        <div className="grid grid-cols-[160px_1fr] text-xs font-mono uppercase tracking-wide text-muted-foreground bg-muted/30 border-b border-border px-4 py-2">
          <span>Code</span>
          <span>Meaning</span>
        </div>
        {[
          {
            code: "good <ip>",
            meaning: "Update accepted. The DNS record has been set to the returned IP address.",
          },
          {
            code: "nochg <ip>",
            meaning: "No change made. The record already points to the supplied IP. Not an error.",
          },
          {
            code: "nohost",
            meaning: "The hostname was not found in your account. Check that the hostname matches exactly.",
          },
          {
            code: "badauth",
            meaning: "Authentication failed. Verify your host username and password.",
          },
          {
            code: "abuse",
            meaning: "Your account has been rate limited due to too many requests in a short window.",
          },
        ].map(({ code, meaning }) => (
          <div key={code} className="grid grid-cols-[160px_1fr] items-start border-t border-border first:border-t-0">
            <div className="px-4 py-3.5 border-r border-border">
              <code className="text-xs font-mono text-foreground">{code}</code>
            </div>
            <div className="px-4 py-3.5">
              <span className="text-xs text-muted-foreground leading-relaxed">{meaning}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4 my-5 text-sm text-amber-900 dark:text-amber-200">
        <strong>nochg</strong> is not an error. Many clients log it as a warning, but it simply
        means your IP has not changed since the last update. Excessive <strong>nochg</strong>{" "}
        responses may eventually trigger rate limiting — configure your client&apos;s interval to
        at least 5 minutes.
      </div>

      <SectionDivider />

      {/* Compatible clients */}
      <h2 className="text-base font-semibold mt-8 mb-3">Compatible clients</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        The following clients and devices are confirmed compatible with NovaDNS. Set the
        server or service to <InlineCode>novadns.io</InlineCode>, and use your host&apos;s
        username and password from the dashboard (host settings → Basic Auth credentials).
      </p>

      <div className="border border-border divide-y divide-border">
        {[
          {
            client: "ddclient",
            note: "Set protocol=dyndns2 and server=novadns.io. See the Client Setup guide for a full config.",
          },
          {
            client: "inadyn",
            note: 'Use provider default@dyndns.org with server-name=novadns.io.',
          },
          {
            client: "Fritz!Box",
            note: "DDNS → Custom → enter server, username, and password. No plugin required.",
          },
          {
            client: "pfSense / OPNsense",
            note: "Services → Dynamic DNS → DynDNS. Set server to novadns.io.",
          },
          {
            client: "ASUS routers (Merlin)",
            note: "WAN → DDNS → choose www.dyndns.org or Custom. Enter novadns.io as the server.",
          },
          {
            client: "Synology DSM",
            note: "Control Panel → External Access → DDNS → Customize → set server to novadns.io.",
          },
          {
            client: "UniFi Gateway",
            note: "Network → Internet → WAN → Dynamic DNS → DynDNS. Set server to novadns.io.",
          },
        ].map(({ client, note }) => (
          <div key={client} className="grid sm:grid-cols-[160px_1fr] items-start px-4 py-3.5 gap-2">
            <span className="text-xs font-mono font-semibold text-foreground">{client}</span>
            <span className="text-xs text-muted-foreground leading-relaxed">{note}</span>
          </div>
        ))}
      </div>

      <SectionDivider />

      {/* Migrating from No-IP or DynDNS */}
      <h2 className="text-base font-semibold mt-8 mb-3">Migrating from No-IP or DynDNS</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        Switching to NovaDNS from an existing provider requires only two changes in your client
        configuration — no reinstallation, no new plugins, no firmware updates needed.
      </p>

      <ul className="space-y-1.5 my-4 text-sm text-muted-foreground list-disc list-inside">
        <li>Change the <strong className="text-foreground font-medium">server</strong> field from your old provider to <InlineCode>novadns.io</InlineCode></li>
        <li>Update the <strong className="text-foreground font-medium">username</strong> to your host&apos;s username (from host settings → Basic Auth credentials)</li>
        <li>Update the <strong className="text-foreground font-medium">password</strong> to your host&apos;s password</li>
        <li>Update the <strong className="text-foreground font-medium">hostname</strong> to your NovaDNS hostname (e.g. <InlineCode>home.novaip.link</InlineCode>)</li>
      </ul>

      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        Everything else — the update interval, the protocol, the client itself — stays exactly the same.
        NovaDNS uses the same wire format, so your client does not even know it switched providers.
      </p>

      <CodeBlock filename="ddclient.conf" label="before → after">
        {c.dim("# Before (No-IP)")}{"\n"}
        {c.key("server")}{c.plain("  =  ")}{c.str("dynupdate.no-ip.com")}{"\n"}
        {c.key("login")}{c.plain("   =  ")}{c.str("old-username")}{"\n"}
        {c.key("password")}{c.plain(" =  ")}{c.str("old-password")}{"\n"}
        {"\n"}
        {c.dim("# After (NovaDNS) — only these 3 lines change")}{"\n"}
        {c.key("server")}{c.plain("  =  ")}{c.str("novadns.io")}{"\n"}
        {c.key("login")}{c.plain("   =  ")}{c.str("YOUR_HOST_USERNAME")}{"\n"}
        {c.key("password")}{c.plain(" =  ")}{c.str("YOUR_HOST_PASSWORD")}
      </CodeBlock>

      <PageNav />
    </div>
  )
}
