// Server Component
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { CodeBlock, c } from "../_components/code-block"
import { PageNav } from "../_components/page-nav"

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-xs bg-muted px-1.5 py-0.5 border border-border text-foreground">
      {children}
    </code>
  )
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-5 mt-8">
      <div className="shrink-0 flex flex-col items-center">
        <div className="size-7 border border-border flex items-center justify-center text-xs font-mono font-bold text-primary">
          {n}
        </div>
        <div className="w-px flex-1 bg-border mt-2" />
      </div>
      <div className="pb-8 flex-1 min-w-0">
        <h2 className="text-base font-semibold mb-3">{title}</h2>
        {children}
      </div>
    </div>
  )
}

export default function GettingStartedPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-widest text-primary mb-3">Getting Started</p>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Quick Start</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Get your first dynamic DNS host running in under 5 minutes.
        </p>
      </div>

      {/* Prerequisites */}
      <div className="border border-border">
        <div className="border-b border-border px-4 py-2.5 bg-muted/30">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Prerequisites</p>
        </div>
        <ul className="divide-y divide-border">
          {[
            "A NovaDNS account — free, no credit card required",
            "A device that supports DynDNS / NoIP, or the ability to run a cron job or script",
          ].map(item => (
            <li key={item} className="flex items-start gap-3 px-4 py-3">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={1.5} className="size-4 text-primary shrink-0 mt-0.5" />
              <span className="text-sm text-muted-foreground">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Steps */}
      <div className="mt-6">

        <Step n={1} title="Create a host">
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            In your{" "}
            <Link href="/dashboard" className="text-primary underline underline-offset-4 hover:opacity-80 transition-opacity">
              dashboard
            </Link>
            , click <strong className="text-foreground font-medium">Add host</strong>. Choose a subdomain —
            for example, <InlineCode>home</InlineCode> — and your host will be reachable at{" "}
            <InlineCode>home.novadns.io</InlineCode>.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            After creation, copy the <strong className="text-foreground font-medium">update token</strong> from
            the host settings. It&apos;s a 64-character hex string used to authenticate updates.
          </p>
        </Step>

        <Step n={2} title="Test the update endpoint">
          <p className="text-sm text-muted-foreground leading-relaxed mb-1">
            Make a request with your token. NovaDNS auto-detects your public IP from the request.
          </p>
          <CodeBlock filename="curl" label="token auth">
            {c.prompt("$ ")}{c.kw("curl")}{c.plain(" \\\n")
            }{c.plain("  ")}{c.str('"https://novadns.io/api/update?token=')}{c.url("YOUR_64_CHAR_TOKEN")}{c.str('"')}{"\n"}
            {"\n"}
            {c.dim("# Response")}{"\n"}
            {c.out('{ "ipv4": "203.0.113.42", "ipv6": "2001:db8::1" }')}
          </CodeBlock>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Both <InlineCode>ipv4</InlineCode> and <InlineCode>ipv6</InlineCode> are updated
            automatically when detected. If your network is IPv4-only, <InlineCode>ipv6</InlineCode>{" "}
            will be <InlineCode>null</InlineCode>.
          </p>
        </Step>

        <Step n={3} title="Configure your client">
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            NovaDNS is compatible with any client that supports <strong className="text-foreground font-medium">DynDNS</strong> or{" "}
            <strong className="text-foreground font-medium">NoIP</strong> — including ddclient,
            inadyn, pfSense, Synology DSM, ASUS routers, OpenWrt, and UniFi gateways.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Point your client at <InlineCode>novadns.io</InlineCode> with your email as the
            username and your host token as the password. See the{" "}
            <Link href="/docs/clients" className="text-primary underline underline-offset-4 hover:opacity-80 transition-opacity">
              Client Setup guide
            </Link>{" "}
            for copy-paste configs.
          </p>
        </Step>
      </div>

      {/* What's next */}
      <div className="border-t border-border mt-2 pt-8">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">What&apos;s next</p>
        <div className="grid sm:grid-cols-2 gap-px bg-border border border-border">
          {[
            { href: "/docs/api",     title: "API Reference",  desc: "Full endpoint and parameter documentation." },
            { href: "/docs/clients", title: "Client Setup",   desc: "Copy-paste configs for ddclient, inadyn, and routers." },
          ].map(({ href, title, desc }) => (
            <Link
              key={href}
              href={href}
              className="group bg-background p-5 flex items-center justify-between gap-4 hover:bg-muted/40 transition-colors"
            >
              <div>
                <div className="font-medium text-sm mb-1 group-hover:text-primary transition-colors">{title}</div>
                <div className="text-xs text-muted-foreground">{desc}</div>
              </div>
              <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={1.5} className="size-4 text-muted-foreground shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      <PageNav
        prev={{ href: "/docs",        label: "Overview"     }}
        next={{ href: "/docs/api",    label: "API Reference" }}
      />
    </div>
  )
}
