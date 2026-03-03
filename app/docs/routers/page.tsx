// Server Component
import type { Metadata } from "next"
import { CodeBlock, c } from "../_components/code-block"
import { PageNav } from "../_components/page-nav"

export const metadata: Metadata = {
  title: "Router Setup — NovaDNS Docs",
  description: "Configure NovaDNS on your router using the built-in DynDNS client. Guides for pfSense, OpenWrt, ASUS, Synology, and UniFi.",
  openGraph: {
    title: "Router Setup — NovaDNS Docs",
    description: "Configure NovaDNS on your router using the built-in DynDNS client. Guides for pfSense, OpenWrt, ASUS, Synology, and UniFi.",
    type: "article",
    url: "https://novadns.io/docs/routers",
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

function FieldTable({ rows }: { rows: { field: string; value: string }[] }) {
  return (
    <div className="border border-border divide-y divide-border my-4">
      {rows.map(({ field, value }) => (
        <div key={field} className="grid grid-cols-[200px_1fr] items-center px-4 py-3 gap-4">
          <span className="text-xs text-muted-foreground">{field}</span>
          <code className="text-xs font-mono text-foreground">{value}</code>
        </div>
      ))}
    </div>
  )
}

export default function RoutersPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-widest text-primary mb-3">Guides</p>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Router Setup</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Step-by-step configuration for the most common router firmware and network devices.
          All examples use <InlineCode>home.novaip.link</InlineCode> as the hostname and{" "}
          <InlineCode>YOUR_TOKEN</InlineCode> as a placeholder for your host token — both are
          available in the NovaDNS dashboard.
        </p>
      </div>

      {/* Jump links */}
      <div className="flex flex-wrap gap-2 mb-8">
        {["openwrt", "pfsense-opnsense", "asus", "synology", "unifi", "mikrotik"].map(id => (
          <a
            key={id}
            href={`#${id}`}
            className="text-xs font-mono border border-border px-2.5 py-1 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
          >
            {id}
          </a>
        ))}
      </div>

      {/* ── OpenWrt ────────────────────────────────────────────────── */}
      <div id="openwrt">
        <h2 className="text-base font-semibold mt-8 mb-3">OpenWrt</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          OpenWrt uses the <InlineCode>ddns-scripts</InlineCode> package and supports both the LuCI
          web UI and direct UCI configuration. Install the package first if it is not already present.
        </p>

        <CodeBlock filename="ssh" label="install ddns package">
          {c.prompt("$ ")}{c.kw("opkg")}{c.plain(" update && ")}{c.kw("opkg")}{c.plain(" install ddns-scripts luci-app-ddns")}
        </CodeBlock>

        <p className="text-sm text-muted-foreground leading-relaxed mb-3 mt-4">
          <strong className="text-foreground font-medium">Via LuCI:</strong> navigate to{" "}
          <InlineCode>Services → Dynamic DNS → Add</InlineCode> and fill in the following fields:
        </p>

        <FieldTable
          rows={[
            { field: "Service",           value: "custom" },
            { field: "Custom update URL", value: "https://novadns.io/api/update?token=YOUR_TOKEN&myip=[IP]" },
            { field: "IP address source", value: "URL" },
            { field: "URL for IP check",  value: "https://api4.my-ip.io/ip" },
            { field: "Check interval",    value: "5 (minutes)" },
          ]}
        />

        <p className="text-sm text-muted-foreground leading-relaxed mb-3 mt-4">
          Alternatively, configure via the UCI config file directly:
        </p>

        <CodeBlock filename="/etc/config/ddns" label="uci config">
          {c.kw("config")}{c.plain(" ")}{c.str("service")}{c.plain(" ")}{c.str("'novadns'")}{"\n"}
          {c.plain("  ")}{c.kw("option")}{c.plain(" ")}{c.key("enabled")}{c.plain("       ")}{c.str("'1'")}{"\n"}
          {c.plain("  ")}{c.kw("option")}{c.plain(" ")}{c.key("service_name")}{c.plain("  ")}{c.str("'custom'")}{"\n"}
          {c.plain("  ")}{c.kw("option")}{c.plain(" ")}{c.key("update_url")}{c.plain("    ")}{c.str("'https://novadns.io/api/update?token=YOUR_TOKEN&myip=[IP]'")}{"\n"}
          {c.plain("  ")}{c.kw("option")}{c.plain(" ")}{c.key("ip_source")}{c.plain("     ")}{c.str("'url'")}{"\n"}
          {c.plain("  ")}{c.kw("option")}{c.plain(" ")}{c.key("ip_url")}{c.plain("        ")}{c.str("'https://api4.my-ip.io/ip'")}{"\n"}
          {c.plain("  ")}{c.kw("option")}{c.plain(" ")}{c.key("check_interval")}{c.plain(" ")}{c.str("'5'")}{"\n"}
          {c.plain("  ")}{c.kw("option")}{c.plain(" ")}{c.key("check_unit")}{c.plain("    ")}{c.str("'minutes'")}{"\n"}
          {c.plain("  ")}{c.kw("option")}{c.plain(" ")}{c.key("use_https")}{c.plain("     ")}{c.str("'1'")}
        </CodeBlock>

        <CodeBlock filename="ssh" label="apply and start">
          {c.prompt("$ ")}{c.kw("service")}{c.plain(" ddns start")}
        </CodeBlock>
      </div>

      <SectionDivider />

      {/* ── pfSense / OPNsense ─────────────────────────────────────── */}
      <div id="pfsense-opnsense">
        <h2 className="text-base font-semibold mt-8 mb-3">pfSense / OPNsense</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Both firewall distributions ship with a built-in Dynamic DNS client. Navigate to{" "}
          <InlineCode>Services → Dynamic DNS → Add</InlineCode> and set the following values. The{" "}
          <InlineCode>%IP%</InlineCode> placeholder is replaced automatically by the client with
          the detected WAN address.
        </p>

        <FieldTable
          rows={[
            { field: "Service type", value: "Custom" },
            { field: "Interface",    value: "WAN" },
            { field: "Update URL",   value: "https://novadns.io/api/update?token=YOUR_TOKEN&myip=%IP%" },
            { field: "Hostname",     value: "home.novaip.link" },
            { field: "Description",  value: "NovaDNS" },
          ]}
        />

        <div className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 p-4 my-5 text-sm text-blue-900 dark:text-blue-200">
          Leave the Username and Password fields blank when using the custom URL method — authentication
          is handled by the token embedded in the URL.
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Save and click <InlineCode>Force Update</InlineCode> to trigger an immediate test. A green
          checkmark in the status column confirms a successful update.
        </p>
      </div>

      <SectionDivider />

      {/* ── ASUS ──────────────────────────────────────────────────── */}
      <div id="asus">
        <h2 className="text-base font-semibold mt-8 mb-3">ASUS (AsusWRT / Merlin)</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Stock AsusWRT and the Merlin third-party firmware both expose a DDNS configuration panel
          under <InlineCode>WAN → DDNS</InlineCode>. Set the service to{" "}
          <InlineCode>WWW.ASUS.COM</InlineCode> first if required to unlock custom fields, then switch
          to <InlineCode>Custom</InlineCode>.
        </p>

        <FieldTable
          rows={[
            { field: "Server",            value: "novadns.io" },
            { field: "Host Name",         value: "home.novaip.link" },
            { field: "Username",          value: "YOUR_HOST_USERNAME" },
            { field: "Password",          value: "YOUR_HOST_PASSWORD" },
            { field: "HTTPS",             value: "Enabled" },
          ]}
        />

        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          On Merlin firmware you can also add a custom DDNS provider entry in{" "}
          <InlineCode>/jffs/configs/custom_ddns.conf</InlineCode> for finer control, but the UI
          fields above are sufficient for most setups.
        </p>

        <div className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 p-4 my-5 text-sm text-blue-900 dark:text-blue-200">
          Username and password are the host&apos;s <strong>Basic Auth credentials</strong> — find
          them in the dashboard under host settings → Basic Auth credentials. These are not your
          account login details.
        </div>
      </div>

      <SectionDivider />

      {/* ── Synology DSM ──────────────────────────────────────────── */}
      <div id="synology">
        <h2 className="text-base font-semibold mt-8 mb-3">Synology DSM</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Synology DSM supports custom DDNS providers via the External Access panel. Navigate to{" "}
          <InlineCode>Control Panel → External Access → DDNS → Add</InlineCode> and choose{" "}
          <InlineCode>Customized</InlineCode> as the service provider.
        </p>

        <FieldTable
          rows={[
            { field: "Service provider", value: "Customized" },
            { field: "Hostname",         value: "home.novaip.link" },
            { field: "Query URL",        value: "https://novadns.io/api/update?token=YOUR_TOKEN" },
            { field: "Heartbeat",        value: "Enabled (optional)" },
          ]}
        />

        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          DSM will call the query URL periodically and record the result. The{" "}
          <InlineCode>__IP__</InlineCode> placeholder is not needed here because NovaDNS
          auto-detects the source IP from the incoming request — which will be your NAS's WAN IP.
        </p>

        <div className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 p-4 my-5 text-sm text-blue-900 dark:text-blue-200">
          If your Synology is behind a double-NAT or a load balancer, the auto-detected IP may be
          an internal address. In that case, append <InlineCode>&myip=__IP__</InlineCode> to the
          query URL and enable the IP detection option in DSM.
        </div>
      </div>

      <SectionDivider />

      {/* ── UniFi Gateway ─────────────────────────────────────────── */}
      <div id="unifi">
        <h2 className="text-base font-semibold mt-8 mb-3">UniFi Gateway</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          UniFi gateways (UDM, UDM Pro, UDR, UCG) support Dynamic DNS via the UniFi Network
          controller. Navigate to <InlineCode>Settings → Internet → WAN → Dynamic DNS</InlineCode>{" "}
          and click <InlineCode>Create New Dynamic DNS</InlineCode>.
        </p>

        <FieldTable
          rows={[
            { field: "Service",   value: "dyndns" },
            { field: "Hostname",  value: "home.novaip.link" },
            { field: "Username",  value: "YOUR_HOST_USERNAME" },
            { field: "Password",  value: "YOUR_HOST_PASSWORD" },
            { field: "Server",    value: "novadns.io" },
          ]}
        />

        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          UniFi uses the DynDNS protocol under the hood. NovaDNS is fully compatible — the{" "}
          <InlineCode>/nic/update</InlineCode> endpoint accepts the same credentials and returns
          a standard DynDNS response string.
        </p>

        <div className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4 my-5 text-sm text-amber-900 dark:text-amber-200">
          Some UniFi controller versions require a server entry without the{" "}
          <InlineCode>https://</InlineCode> prefix. Enter just{" "}
          <InlineCode>novadns.io</InlineCode> in the Server field.
        </div>
      </div>

      <SectionDivider />

      {/* ── MikroTik RouterOS ─────────────────────────────────────── */}
      <div id="mikrotik">
        <h2 className="text-base font-semibold mt-8 mb-3">MikroTik RouterOS</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          MikroTik does not have a built-in DynDNS client that supports custom providers, but you
          can use a RouterOS script triggered by the IP change event or a scheduled task.
        </p>

        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          The simplest approach uses <InlineCode>/tool fetch</InlineCode> to call the NovaDNS API
          whenever the script runs. Paste the following into the RouterOS terminal:
        </p>

        <CodeBlock filename="RouterOS script" label="System → Scripts → Add">
          {c.dim("# NovaDNS update script")}{"\n"}
          {c.dim("# Replace YOUR_TOKEN with your host token from the dashboard")}{"\n"}
          {"\n"}
          {c.plain(":local ")}{c.key("updateUrl")}{c.plain(" ")}{c.str('"https://novadns.io/api/update?token=YOUR_TOKEN"')}{"\n"}
          {"\n"}
          {c.plain("/tool ")}{c.kw("fetch")}{c.plain(" \\\n")
          }{c.plain("  ")}{c.flag("url=")}{c.str('"$updateUrl"')}{c.plain(" \\\n")
          }{c.plain("  ")}{c.flag("mode=")}{c.str("https")}{c.plain(" \\\n")
          }{c.plain("  ")}{c.flag("output=")}{c.str("none")}
        </CodeBlock>

        <p className="text-sm text-muted-foreground leading-relaxed mb-3 mt-4">
          Schedule the script to run every 5 minutes under{" "}
          <InlineCode>System → Scheduler → Add</InlineCode>:
        </p>

        <CodeBlock filename="RouterOS terminal" label="create scheduler">
          {c.plain("/system scheduler add \\\n")
          }{c.plain("  ")}{c.key("name")}{c.plain("=")}{c.str("novadns-update")}{c.plain(" \\\n")
          }{c.plain("  ")}{c.key("interval")}{c.plain("=")}{c.str("00:05:00")}{c.plain(" \\\n")
          }{c.plain("  ")}{c.key("on-event")}{c.plain("=")}{c.str("novadns-update")}{c.plain(" \\\n")
          }{c.plain("  ")}{c.key("policy")}{c.plain("=")}{c.str("read,write,test")}
        </CodeBlock>

        <div className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 p-4 my-5 text-sm text-blue-900 dark:text-blue-200">
          To automatically pass the current WAN IP rather than relying on server-side detection,
          retrieve it first with <InlineCode>/ip address</InlineCode> and append it as the{" "}
          <InlineCode>myip</InlineCode> parameter in the URL. This is useful when the router sits
          behind a carrier-grade NAT.
        </div>
      </div>

      <PageNav
        prev={{ href: "/docs/clients",  label: "Client Setup" }}
        next={{ href: "/docs/security", label: "Security"     }}
      />
    </div>
  )
}
