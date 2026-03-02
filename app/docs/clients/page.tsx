// Server Component
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

function ClientSection({ id, title, desc, children }: { id: string; title: string; desc: string; children: React.ReactNode }) {
  return (
    <div id={id}>
      <div className="flex items-baseline gap-3 mb-1">
        <h2 className="text-base font-semibold">{title}</h2>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{desc}</p>
      {children}
    </div>
  )
}

export default function ClientsPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-widest text-primary mb-3">Guides</p>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Client Setup</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Copy-paste configurations for the most common DDNS clients and devices.
          All examples use <InlineCode>home.novadns.io</InlineCode> as the hostname —
          replace it with your own subdomain.
        </p>
      </div>

      {/* Jump links */}
      <div className="flex flex-wrap gap-2 mb-8">
        {["curl", "ddclient", "inadyn", "router-nas"].map(id => (
          <a
            key={id}
            href={`#${id}`}
            className="text-xs font-mono border border-border px-2.5 py-1 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
          >
            {id}
          </a>
        ))}
      </div>

      {/* ── curl ─────────────────────────────────────────────────── */}
      <ClientSection
        id="curl"
        title="curl"
        desc="The simplest way to update your host — one line, no dependencies. Useful for cron jobs, scripts, and testing."
      >
        <CodeBlock filename="shell" label="token auth">
          {c.prompt("$ ")}{c.kw("curl")}{c.plain(" ")}{c.str('"https://novadns.io/api/update?token=')}{c.url("YOUR_TOKEN")}{c.str('"')}
        </CodeBlock>

        <p className="text-sm text-muted-foreground leading-relaxed mb-1 mt-2">
          To pass an explicit IP instead of auto-detecting:
        </p>
        <CodeBlock filename="shell" label="explicit IP">
          {c.prompt("$ ")}{c.kw("curl")}{c.plain(" \\\n")
          }{c.plain("  ")}{c.str('"https://novadns.io/api/update')}{c.plain("\n")
          }{c.plain("    ")}{c.flag("?token=")}{c.url("YOUR_TOKEN")}{c.plain("\n")
          }{c.plain("    ")}{c.flag("&myip=")}{c.str("203.0.113.42")}{c.str('"')}
        </CodeBlock>

        <p className="text-sm text-muted-foreground leading-relaxed mb-1 mt-2">
          To run every 5 minutes via cron:
        </p>
        <CodeBlock filename="crontab" label="cron">
          {c.dim("# m  h  dom mon dow  command")}{"\n"}
          {c.str("*/5")}{c.plain("  ")}{c.str("*")}{c.plain("  ")}{c.str("*")}{c.plain("  ")}{c.str("*")}{c.plain("  ")}{c.str("*")}{c.plain("  ")}{c.kw("curl")}{c.plain(" -s ")}{c.str('"https://novadns.io/api/update?token=')}{c.url("YOUR_TOKEN")}{c.str('"')}{c.plain(" > /dev/null")}
        </CodeBlock>
      </ClientSection>

      <SectionDivider />

      {/* ── ddclient ─────────────────────────────────────────────── */}
      <ClientSection
        id="ddclient"
        title="ddclient"
        desc="ddclient is the most widely used Linux DDNS client. It runs as a daemon and updates your hostname automatically when your IP changes."
      >
        <CodeBlock filename="/etc/ddclient.conf" label="ddclient config">
          {c.dim("# NovaDNS configuration for ddclient")}{"\n"}
          {c.dim("# Install: sudo apt install ddclient")}{"\n"}
          {"\n"}
          {c.key("protocol")}{c.plain("=")}{c.str("dyndns2")}{"\n"}
          {c.key("server")}{c.plain("=")}{c.str("novadns.io")}{"\n"}
          {c.key("login")}{c.plain("=")}{c.str("your@email.com")}{"\n"}
          {c.key("password")}{c.plain("=")}{c.str("YOUR_HOST_TOKEN")}{"\n"}
          {c.key("use")}{c.plain("=")}{c.str("web")}{c.plain(", ")}{c.key("web")}{c.plain("=")}{c.str("checkip.dyndns.com")}{"\n"}
          {c.key("ssl")}{c.plain("=")}{c.str("yes")}{"\n"}
          {c.key("daemon")}{c.plain("=")}{c.str("300")}{c.plain("   ")}{c.dim("# check every 5 minutes")}{"\n"}
          {"\n"}
          {c.str("home.novadns.io")}
        </CodeBlock>

        <p className="text-sm text-muted-foreground leading-relaxed mt-2">
          Restart ddclient after editing: <InlineCode>sudo systemctl restart ddclient</InlineCode>.
          Check status with <InlineCode>sudo ddclient -verbose -noquiet -debug</InlineCode>.
        </p>
      </ClientSection>

      <SectionDivider />

      {/* ── inadyn ───────────────────────────────────────────────── */}
      <ClientSection
        id="inadyn"
        title="inadyn"
        desc="inadyn is a modern, lightweight DDNS client available on OpenWrt, Entware, and most Linux distributions."
      >
        <CodeBlock filename="/etc/inadyn.conf" label="inadyn config">
          {c.dim("# NovaDNS configuration for inadyn")}{"\n"}
          {c.dim("# Install: sudo apt install inadyn")}{"\n"}
          {"\n"}
          {c.key("period")}{c.plain("          = ")}{c.str("300")}{c.plain("  ")}{c.dim("# seconds")}{"\n"}
          {c.key("user-agent")}{c.plain("      = ")}{c.str("inadyn/2.0")}{"\n"}
          {"\n"}
          {c.kw("provider")}{c.plain(" ")}{c.str("default@dyndns.org")}{c.plain(" {")}{"\n"}
          {c.plain("  ")}{c.key("ssl")}{c.plain("        = ")}{c.str("true")}{"\n"}
          {c.plain("  ")}{c.key("server-name")}{c.plain(" = ")}{c.str("novadns.io")}{"\n"}
          {c.plain("  ")}{c.key("server-url")}{c.plain("  = ")}{c.str('"/nic/update?hostname=%h&myip=%i"')}{"\n"}
          {c.plain("  ")}{c.key("username")}{c.plain("    = ")}{c.str("your@email.com")}{"\n"}
          {c.plain("  ")}{c.key("password")}{c.plain("    = ")}{c.str("YOUR_HOST_TOKEN")}{"\n"}
          {c.plain("  ")}{c.key("hostname")}{c.plain("    = ")}{c.str("home.novadns.io")}{"\n"}
          {c.plain("}")}
        </CodeBlock>

        <p className="text-sm text-muted-foreground leading-relaxed mt-2">
          Start inadyn: <InlineCode>sudo inadyn --foreground --once</InlineCode> to test,
          then <InlineCode>sudo systemctl enable --now inadyn</InlineCode> to run as a service.
        </p>
      </ClientSection>

      <SectionDivider />

      {/* ── Router / NAS ─────────────────────────────────────────── */}
      <ClientSection
        id="router-nas"
        title="Router / NAS (DynDNS UI)"
        desc="Most routers and NAS devices have a built-in DynDNS client under their DDNS or dynamic DNS settings. Use these values regardless of brand."
      >
        <div className="border border-border divide-y divide-border mb-4">
          {[
            { field: "Service / Provider", value: "DynDNS  (or Custom)" },
            { field: "Server",             value: "novadns.io"          },
            { field: "Hostname",           value: "home.novadns.io"     },
            { field: "Username",           value: "your@email.com"      },
            { field: "Password",           value: "YOUR_HOST_TOKEN"     },
          ].map(({ field, value }) => (
            <div key={field} className="grid grid-cols-[180px_1fr] items-center px-4 py-3 gap-4">
              <span className="text-xs text-muted-foreground">{field}</span>
              <code className="text-xs font-mono text-foreground">{value}</code>
            </div>
          ))}
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          Confirmed working with the following firmware and devices:
        </p>
        <div className="flex flex-wrap gap-2">
          {["Synology DSM", "pfSense", "OPNsense", "OpenWrt", "ASUS (Merlin)", "TP-Link (Omada)", "UniFi Gateway", "MikroTik"].map(brand => (
            <span
              key={brand}
              className="text-xs font-mono border border-border px-2.5 py-1 text-muted-foreground"
            >
              {brand}
            </span>
          ))}
        </div>
      </ClientSection>

      <PageNav
        prev={{ href: "/docs/ipv6",     label: "IPv6 & Subnets" }}
        next={{ href: "/docs/why-ipv6", label: "Why IPv6?"       }}
      />
    </div>
  )
}
