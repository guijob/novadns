// Server Component
import type { Metadata } from "next"
import { CodeBlock, c } from "../_components/code-block"
import { PageNav } from "../_components/page-nav"

export const metadata: Metadata = {
  title: "IoT Devices Guide — NovaDNS Docs",
  description: "Set up dynamic DNS for IoT gateways, sensors, and edge devices. Integrate NovaDNS with MQTT, Home Assistant, and industrial controllers.",
  openGraph: {
    title: "IoT Devices Guide — NovaDNS Docs",
    description: "Set up dynamic DNS for IoT gateways, sensors, and edge devices. Integrate NovaDNS with MQTT, Home Assistant, and industrial controllers.",
    type: "article",
    url: "https://novadns.io/docs/iot",
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

export default function IoTPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-widest text-primary mb-3">Learn</p>
        <h1 className="text-2xl font-bold tracking-tight mb-2">IoT Devices Guide</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          A practical guide to using dynamic DNS with IoT gateways, sensors, and edge devices —
          covering API integration, fleet management, and monitoring.
        </p>
      </div>

      {/* Why IoT needs DDNS */}
      <h2 className="text-base font-semibold mt-8 mb-3">IoT gateways and dynamic IPs</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        IoT devices deployed in the field — industrial sensors, environmental monitors, edge
        compute nodes — often sit behind connections with dynamic IP addresses. Cellular modems,
        consumer-grade broadband, and satellite links all assign IPs that can change without
        warning.
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        Without DDNS, you lose remote access every time the IP rotates. NovaDNS gives each
        device a stable hostname like <InlineCode>sensor-hq.novaip.link</InlineCode> that
        follows the IP wherever it goes.
      </p>

      <SectionDivider />

      {/* HTTP API from embedded devices */}
      <h2 className="text-base font-semibold mt-8 mb-3">Updating from embedded devices</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        The NovaDNS API is a single HTTP endpoint — perfect for resource-constrained devices.
        Any tool that can make an HTTP request can update your hostname.
      </p>

      <h3 className="text-sm font-medium mt-6 mb-3">Using curl or wget</h3>
      <CodeBlock filename="Shell">
        {c.dim("# Update using token auth")}{"\n"}
        {c.plain('curl ')}{c.str('"https://novadns.io/api/update?token=YOUR_TOKEN"')}{"\n"}
        {"\n"}
        {c.dim("# Or with wget (common on embedded Linux)")}{"\n"}
        {c.plain('wget -qO- ')}{c.str('"https://novadns.io/api/update?token=YOUR_TOKEN"')}
      </CodeBlock>

      <h3 className="text-sm font-medium mt-6 mb-3">Using Python</h3>
      <CodeBlock filename="update_dns.py">
        {c.kw("import")}{c.plain(" urllib.request")}{"\n"}
        {"\n"}
        {c.plain("TOKEN = ")}{c.str('"YOUR_64_CHAR_TOKEN"')}{"\n"}
        {c.plain("url = ")}{c.str('f"https://novadns.io/api/update?token={TOKEN}"')}{"\n"}
        {"\n"}
        {c.kw("with")}{c.plain(" urllib.request.urlopen(url) ")}{c.kw("as")}{c.plain(" resp:")}{"\n"}
        {c.plain("    print(resp.read().decode())")}
      </CodeBlock>

      <p className="text-sm text-muted-foreground leading-relaxed mt-4 mb-4">
        Run this on a cron job every 5 minutes, or trigger it whenever your device detects
        a network change. See the{" "}
        <a href="/docs/api" className="text-primary hover:underline">API Reference</a> for
        all available parameters.
      </p>

      <SectionDivider />

      {/* Integration with platforms */}
      <h2 className="text-base font-semibold mt-8 mb-3">Platform integration</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        NovaDNS works alongside your existing IoT stack. Common integration patterns include:
      </p>
      <div className="border border-border divide-y divide-border my-5">
        {[
          {
            platform: "MQTT brokers",
            desc: "Give your broker a stable hostname so devices can always connect, even across IP changes.",
          },
          {
            platform: "Home Assistant",
            desc: "Access your Home Assistant instance remotely using a NovaDNS hostname instead of a static IP.",
          },
          {
            platform: "Industrial controllers",
            desc: "PLCs and SCADA gateways with DynDNS support can update NovaDNS directly from the field.",
          },
          {
            platform: "Edge compute (Balena, Portainer)",
            desc: "Keep remote management dashboards reachable with a stable hostname per site.",
          },
        ].map(({ platform, desc }) => (
          <div key={platform} className="px-4 py-4">
            <p className="text-sm font-medium mb-1">{platform}</p>
            <p className="text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>

      <SectionDivider />

      {/* Fleet management */}
      <h2 className="text-base font-semibold mt-8 mb-3">Managing large device fleets</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        When you have dozens or hundreds of devices, NovaDNS features help you stay organized:
      </p>
      <ul className="list-disc list-inside space-y-2 mb-4">
        <li className="text-sm text-muted-foreground">
          <strong className="text-foreground font-medium">Host groups</strong> — organize devices
          by site, project, or function. Share credentials across a group for easier provisioning.
        </li>
        <li className="text-sm text-muted-foreground">
          <strong className="text-foreground font-medium">Team workspaces</strong> — give multiple
          team members access to manage devices without sharing personal credentials.
        </li>
        <li className="text-sm text-muted-foreground">
          <strong className="text-foreground font-medium">Per-device tokens</strong> — each device
          gets its own 64-character token. Revoke one compromised device without affecting the rest.
        </li>
        <li className="text-sm text-muted-foreground">
          <strong className="text-foreground font-medium">Paid plans</strong> — scale from 25 to
          500 devices. All paid plans include IPv6 subnet support and custom TTL.
        </li>
      </ul>

      <SectionDivider />

      {/* Webhooks */}
      <h2 className="text-base font-semibold mt-8 mb-3">Webhook integration for monitoring</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        NovaDNS can send a webhook every time a device's IP changes. Use this to:
      </p>
      <ul className="list-disc list-inside space-y-2 mb-4">
        <li className="text-sm text-muted-foreground">
          Alert your monitoring system (Grafana, Datadog, PagerDuty) when a device goes offline or changes IP.
        </li>
        <li className="text-sm text-muted-foreground">
          Automatically update firewall rules or VPN configurations.
        </li>
        <li className="text-sm text-muted-foreground">
          Log IP changes to a central database for audit and compliance.
        </li>
        <li className="text-sm text-muted-foreground">
          Trigger re-provisioning scripts when a site comes back online with a new address.
        </li>
      </ul>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        See the <a href="/docs/webhooks" className="text-primary hover:underline">Webhooks guide</a> for
        setup instructions and payload format.
      </p>

      <PageNav />
    </div>
  )
}
