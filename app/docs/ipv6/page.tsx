// Server Component
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { CrownIcon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"
import { CodeBlock, c } from "../_components/code-block"
import { PageNav } from "../_components/page-nav"

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

export default function IPv6Page() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-widest text-primary mb-3">Reference</p>
        <h1 className="text-2xl font-bold tracking-tight mb-2">IPv6 & Subnets</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          NovaDNS treats IPv6 as a first-class citizen — not an afterthought. Every host
          tracks both A and AAAA records, and Pro accounts can track entire IPv6 prefixes.
        </p>
      </div>

      {/* Dual-stack by default */}
      <div id="dual-stack">
        <h2 className="text-base font-semibold mb-3">Dual-stack by default</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Every NovaDNS host simultaneously maintains an IPv4 <strong className="text-foreground font-medium">A record</strong> and
          an IPv6 <strong className="text-foreground font-medium">AAAA record</strong>. When you call the update endpoint,
          both addresses are detected from your request and stored independently.
        </p>

        <div className="border border-border divide-y divide-border">
          {[
            { record: "A",    protocol: "IPv4", example: "203.0.113.42",    note: "Detected from request or passed via myip" },
            { record: "AAAA", protocol: "IPv6", example: "2001:db8::1",      note: "Detected from request or passed via myip" },
          ].map(({ record, protocol, example, note }) => (
            <div key={record} className="grid sm:grid-cols-[60px_80px_1fr_1fr] items-center gap-4 px-4 py-3">
              <code className="text-xs font-mono text-primary font-bold">{record}</code>
              <span className="text-xs font-mono text-muted-foreground">{protocol}</span>
              <code className="text-xs font-mono text-foreground">{example}</code>
              <span className="text-xs text-muted-foreground">{note}</span>
            </div>
          ))}
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mt-4">
          If your network is IPv4-only, the AAAA record is left untouched (or stays empty on first update).
          If you only have IPv6, the A record is omitted.
        </p>
      </div>

      <SectionDivider />

      {/* Subnet tracking */}
      <div id="subnets">
        <h2 className="text-base font-semibold mb-3">IPv6 subnet tracking</h2>

        <div className="flex items-center gap-2 mb-4 border border-primary/30 bg-primary/5 px-4 py-3">
          <HugeiconsIcon icon={CrownIcon} strokeWidth={1.5} className="size-4 text-primary shrink-0" />
          <p className="text-xs text-muted-foreground">
            IPv6 subnet tracking requires a <strong className="text-foreground font-medium">Pro plan</strong>.
          </p>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Many ISPs assign a dynamic <strong className="text-foreground font-medium">IPv6 prefix</strong> — a
          block like <InlineCode>/48</InlineCode> or <InlineCode>/64</InlineCode> — to your router, rather
          than a single static address. Every device on your network derives its own address from that prefix.
          When the prefix changes (e.g. after a reconnect), all of those addresses change.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Instead of registering each device individually, you can register the prefix itself under a single
          NovaDNS hostname. Your devices can then construct their own full addresses dynamically using the
          stored prefix as the base.
        </p>

        <h3 className="text-sm font-semibold mb-2 mt-6">How to send a subnet update</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-1">
          Pass the CIDR notation of your prefix as the <InlineCode>myip</InlineCode> parameter:
        </p>

        <CodeBlock filename="curl" label="IPv6 prefix — token auth">
          {c.prompt("$ ")}{c.kw("curl")}{c.plain(" \\\n")
          }{c.plain("  ")}{c.str('"https://novadns.io/api/update')}{c.plain("\n")
          }{c.plain("    ")}{c.flag("?token=")}{c.url("YOUR_TOKEN")}{c.plain("\n")
          }{c.plain("    ")}{c.flag("&myip=")}{c.str("2001:db8:1234::/48")}{c.str('"')}{"\n"}
          {"\n"}
          {c.out('{ "ipv4": "203.0.113.42", "ipv6": "2001:db8:1234::/48" }')}
        </CodeBlock>

        <CodeBlock filename="curl" label="IPv6 prefix — DynDNS compat">
          {c.prompt("$ ")}{c.kw("curl")}{c.plain(" \\\n")
          }{c.plain("  ")}{c.str('"https://')}{c.url("email%40example.com")}{c.str(":")}{c.url("TOKEN")}{c.str("@novadns.io/nic/update")}{c.plain("\n")
          }{c.plain("    ")}{c.flag("?hostname=")}{c.str("home.novadns.io")}{c.plain("\n")
          }{c.plain("    ")}{c.flag("&myip=")}{c.str("2001:db8:1234::/48")}{c.str('"')}{"\n"}
          {"\n"}
          {c.out("good 2001:db8:1234::/48")}
        </CodeBlock>
      </div>

      <SectionDivider />

      {/* How it works */}
      <div id="how-it-works">
        <h2 className="text-base font-semibold mb-3">How prefix tracking works</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          NovaDNS stores the raw CIDR value in the host&apos;s AAAA field. Your device or application
          reads the prefix back via DNS (or the API), then appends its own interface identifier to
          construct a full address. This is consistent with how IPv6 stateless address autoconfiguration (SLAAC)
          and DHCPv6 prefix delegation work in practice.
        </p>

        <div className="border border-border divide-y divide-border">
          {[
            { step: "1", text: "ISP assigns /48 prefix 2001:db8:1234::/48 to your router" },
            { step: "2", text: "Your router calls the NovaDNS update endpoint with that CIDR" },
            { step: "3", text: "NovaDNS stores 2001:db8:1234::/48 as the AAAA value" },
            { step: "4", text: "Devices resolve home.novadns.io, read the prefix, and construct their address" },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-start gap-4 px-4 py-3">
              <span className="text-xs font-mono text-primary font-bold shrink-0 mt-0.5">{step}</span>
              <span className="text-sm text-muted-foreground">{text}</span>
            </div>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* Limitations */}
      <div id="limitations">
        <h2 className="text-base font-semibold mb-3">Limitations</h2>
        <div className="border border-border divide-y divide-border">
          {[
            "IPv6 subnet tracking requires the Pro plan.",
            "Only /48 and /64 prefix lengths are supported. Other CIDR sizes are rejected.",
            "The AAAA field stores the raw CIDR — it is not a valid DNS AAAA record and will not resolve in standard DNS queries. It is intended for application-level prefix delegation.",
            "Mixing a single IPv6 address and a subnet under the same host is not supported — pick one.",
          ].map((note, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={1.5} className="size-4 text-muted-foreground/50 shrink-0 mt-0.5" />
              <span className="text-sm text-muted-foreground">{note}</span>
            </div>
          ))}
        </div>
      </div>

      <PageNav
        prev={{ href: "/docs/api",     label: "API Reference" }}
        next={{ href: "/docs/clients", label: "Client Setup"  }}
      />
    </div>
  )
}
