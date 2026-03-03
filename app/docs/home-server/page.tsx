// Server Component
import type { Metadata } from "next"
import { CodeBlock, c } from "../_components/code-block"
import { PageNav } from "../_components/page-nav"

export const metadata: Metadata = {
  title: "Home Server Setup — NovaDNS Docs",
  description: "Use NovaDNS to host services at home. Configure a stable hostname, open the right ports, and access your server from anywhere.",
  openGraph: {
    title: "Home Server Setup — NovaDNS Docs",
    description: "Use NovaDNS to host services at home. Configure a stable hostname, open the right ports, and access your server from anywhere.",
    type: "article",
    url: "https://novadns.io/docs/home-server",
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

export default function HomeServerPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-widest text-primary mb-3">Learn</p>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Home Server Guide</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          A practical walkthrough of running a home server that is reliably reachable from the
          internet using NovaDNS — covering hostnames, port forwarding, reverse proxies, and
          security best practices.
        </p>
      </div>

      {/* Overview */}
      <h2 className="text-base font-semibold mt-8 mb-3">Overview</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        A home server is any machine in your home (or small office) running services you want to
        access remotely. It might be an old PC running Linux, a Raspberry Pi, a NAS device, or a
        dedicated machine. The challenge is always the same: your ISP gives you a public IP that
        can change at any time, making it impossible to reach your server reliably without DDNS.
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        With NovaDNS, you get a stable hostname like <InlineCode>home.novaip.link</InlineCode> that
        follows your IP wherever it goes. Combined with port forwarding and a reverse proxy, you can
        run a full stack of self-hosted services — all reachable by a memorable address.
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        Popular services people run at home include Home Assistant, Plex, Jellyfin, Nextcloud,
        Vaultwarden, Gitea, Grafana, and WireGuard VPN.
      </p>

      <SectionDivider />

      {/* Setting up your hostname */}
      <h2 className="text-base font-semibold mt-8 mb-3">Setting up your hostname</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        Start by creating a host in NovaDNS. Log in to your dashboard, click{" "}
        <strong className="text-foreground font-medium">Add host</strong>, and choose a subdomain.
        For a home server, something like <InlineCode>home</InlineCode> or{" "}
        <InlineCode>nas</InlineCode> works well. Your hostname will be{" "}
        <InlineCode>yoursubdomain.novaip.link</InlineCode>.
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        After creating the host, copy the <strong className="text-foreground font-medium">update token</strong> shown
        in the host detail page. You will need it to configure your DDNS client.
      </p>

      <div className="border border-border divide-y divide-border my-5">
        {[
          {
            step: "1",
            title: "Create a host",
            desc: "Dashboard → Add host → choose a subdomain (e.g. home) → save.",
          },
          {
            step: "2",
            title: "Copy the update token",
            desc: "Click the host → copy the 64-character token from the credentials panel.",
          },
          {
            step: "3",
            title: "Configure DDNS on your router",
            desc: "Most routers have a DDNS section. Set server=novadns.io, username=your email, password=the token, hostname=home.novaip.link.",
          },
          {
            step: "4",
            title: "Verify the record",
            desc: 'Run "dig home.novaip.link A +short" — it should return your public IPv4 within a minute.',
          },
        ].map(({ step, title, desc }) => (
          <div key={step} className="grid sm:grid-cols-[48px_1fr] items-start px-4 py-4 gap-4">
            <div className="size-7 border border-border flex items-center justify-center text-xs font-mono font-bold text-primary shrink-0">
              {step}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-1">{title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        If your router does not have a built-in DDNS client, install{" "}
        <strong className="text-foreground font-medium">ddclient</strong> on any Linux machine on
        your network. See the{" "}
        <a href="/docs/clients" className="text-primary underline underline-offset-4 hover:opacity-80 transition-opacity">
          Client Setup guide
        </a>{" "}
        for copy-paste configurations.
      </p>

      <SectionDivider />

      {/* Port forwarding */}
      <h2 className="text-base font-semibold mt-8 mb-3">Port forwarding</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        Your router sits between the public internet and your local network. By default it blocks
        all inbound connections. To make a service reachable from outside, you need to create a{" "}
        <strong className="text-foreground font-medium">port forwarding rule</strong> that maps a
        port on your public IP to a port on your server&apos;s local IP.
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        Find port forwarding in your router&apos;s admin panel — it may be labelled{" "}
        <em>Virtual Server</em>, <em>NAT</em>, or <em>Port Forwarding</em>. Set your server to a
        static local IP first (via a DHCP reservation) so the rule does not break when the server
        reboots.
      </p>

      <div className="border border-border">
        <div className="grid grid-cols-[1fr_80px_1fr] text-xs font-mono uppercase tracking-wide text-muted-foreground bg-muted/30 border-b border-border px-4 py-2">
          <span>Service</span>
          <span>Port(s)</span>
          <span>Notes</span>
        </div>
        {[
          { service: "HTTP / HTTPS", port: "80, 443", notes: "Web services, reverse proxy entry point" },
          { service: "SSH", port: "22", notes: "Remote terminal — consider a non-standard port for security" },
          { service: "Plex", port: "32400", notes: "Direct play without relay" },
          { service: "Home Assistant", port: "8123", notes: "Default HA port; expose via reverse proxy in production" },
          { service: "WireGuard VPN", port: "51820 UDP", notes: "Preferred: route all traffic through VPN instead of forwarding individual services" },
          { service: "Jellyfin", port: "8096", notes: "Media server; or 8920 for HTTPS" },
          { service: "Nextcloud", port: "443", notes: "Expose only via HTTPS reverse proxy" },
        ].map(({ service, port, notes }) => (
          <div key={service} className="grid grid-cols-[1fr_80px_1fr] items-start px-4 py-3 border-t border-border first:border-t-0 gap-4">
            <span className="text-xs font-mono text-foreground">{service}</span>
            <code className="text-xs font-mono text-primary">{port}</code>
            <span className="text-xs text-muted-foreground leading-relaxed">{notes}</span>
          </div>
        ))}
      </div>

      <div className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4 my-5 text-sm text-amber-900 dark:text-amber-200">
        <strong>ISP note:</strong> some residential ISPs block inbound connections on port 80 and
        443. If you cannot reach your server on these ports, check your ISP&apos;s terms of service.
        In many cases you can use a non-standard port and instruct users to specify it explicitly, or
        use a VPN tunnel (see below).
      </div>

      <SectionDivider />

      {/* Reverse proxy */}
      <h2 className="text-base font-semibold mt-8 mb-3">Reverse proxy</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        A reverse proxy sits in front of your services and routes requests to the right one based
        on the hostname or path. It also handles TLS termination, so you get HTTPS for all your
        services through a single forwarded port 443 — without exposing each service&apos;s native
        port to the internet.
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        <strong className="text-foreground font-medium">Caddy</strong> is the easiest option for
        home servers — it automatically obtains and renews Let&apos;s Encrypt TLS certificates for
        any domain you configure, with zero extra setup.
      </p>

      <CodeBlock filename="Caddyfile" label="Caddy — multi-service example">
        {c.str("home.novaip.link")}{c.plain(" {")}{"\n"}
        {c.plain("  ")}{c.key("reverse_proxy")}{c.plain(" localhost:")}{c.str("8123")}{c.plain("  ")}{c.dim("# Home Assistant")}{"\n"}
        {c.plain("}")}{"\n"}
        {"\n"}
        {c.str("media.novaip.link")}{c.plain(" {")}{"\n"}
        {c.plain("  ")}{c.key("reverse_proxy")}{c.plain(" localhost:")}{c.str("8096")}{c.plain("  ")}{c.dim("# Jellyfin")}{"\n"}
        {c.plain("}")}{"\n"}
        {"\n"}
        {c.str("files.novaip.link")}{c.plain(" {")}{"\n"}
        {c.plain("  ")}{c.key("reverse_proxy")}{c.plain(" localhost:")}{c.str("11000")}{c.plain(" ")}{c.dim("# Nextcloud AIO")}{"\n"}
        {c.plain("}")}
      </CodeBlock>

      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        Each subdomain above would be a separate NovaDNS host pointing to the same IP. Caddy routes
        traffic based on the <InlineCode>Host</InlineCode> header, so you only forward ports 80 and
        443 on your router — all services share the same entry point.
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        <strong className="text-foreground font-medium">Nginx Proxy Manager</strong> is a popular
        alternative with a graphical web interface — suitable if you prefer not to edit config files.
      </p>

      <SectionDivider />

      {/* Popular self-hosted services */}
      <h2 className="text-base font-semibold mt-8 mb-3">Popular self-hosted services</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        These are some of the most popular services people run at home and expose via DDNS.
      </p>

      <div className="border border-border divide-y divide-border">
        {[
          {
            name: "Home Assistant",
            desc: "Home automation platform. Runs on a Raspberry Pi or any Linux machine. Expose via Caddy for remote access.",
            port: "8123",
          },
          {
            name: "Plex / Jellyfin",
            desc: "Media server for movies, TV shows, and music. Jellyfin is the fully open-source option.",
            port: "32400 / 8096",
          },
          {
            name: "Nextcloud",
            desc: "Self-hosted cloud storage and collaboration suite. Replaces Google Drive, Docs, and Calendar.",
            port: "443 (via proxy)",
          },
          {
            name: "Vaultwarden",
            desc: "Lightweight Bitwarden-compatible password manager server. Run your own end-to-end encrypted vault.",
            port: "443 (via proxy)",
          },
          {
            name: "Gitea",
            desc: "Lightweight self-hosted Git service. A fast alternative to GitHub for private or team repositories.",
            port: "3000 / 443 (via proxy)",
          },
          {
            name: "Grafana",
            desc: "Metrics and monitoring dashboards. Pair with Prometheus to monitor your server and services.",
            port: "3000",
          },
        ].map(({ name, desc, port }) => (
          <div key={name} className="grid sm:grid-cols-[160px_1fr_100px] items-start px-4 py-3.5 gap-4">
            <span className="text-xs font-semibold text-foreground">{name}</span>
            <span className="text-xs text-muted-foreground leading-relaxed">{desc}</span>
            <code className="text-xs font-mono text-muted-foreground">{port}</code>
          </div>
        ))}
      </div>

      <SectionDivider />

      {/* VPN access (WireGuard) */}
      <h2 className="text-base font-semibold mt-8 mb-3">VPN access with WireGuard</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        Rather than exposing individual services to the internet, a better approach for many users
        is to run a <strong className="text-foreground font-medium">WireGuard VPN server</strong> on
        their home network. Remote devices connect to the VPN and then access all home services over
        the private tunnel — as if they were sitting on the local network.
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        Use your NovaDNS hostname as the <InlineCode>Endpoint</InlineCode> in your WireGuard
        client configuration. When your home IP changes, NovaDNS updates the DNS record within
        60 seconds, and WireGuard automatically resolves the new IP on the next reconnect.
      </p>

      <CodeBlock filename="wg0.conf" label="WireGuard client — minimal config">
        {c.dim("[Interface]")}{"\n"}
        {c.key("PrivateKey")}{c.plain(" = ")}{c.str("YOUR_CLIENT_PRIVATE_KEY")}{"\n"}
        {c.key("Address")}{c.plain("    = ")}{c.str("10.0.0.2/32")}{"\n"}
        {c.key("DNS")}{c.plain("        = ")}{c.str("10.0.0.1")}{"\n"}
        {"\n"}
        {c.dim("[Peer]")}{"\n"}
        {c.key("PublicKey")}{c.plain("           = ")}{c.str("YOUR_SERVER_PUBLIC_KEY")}{"\n"}
        {c.key("Endpoint")}{c.plain("            = ")}{c.url("home.novaip.link")}{c.str(":51820")}{"\n"}
        {c.key("AllowedIPs")}{c.plain("          = ")}{c.str("0.0.0.0/0, ::/0")}{"\n"}
        {c.key("PersistentKeepalive")}{c.plain(" = ")}{c.str("25")}
      </CodeBlock>

      <div className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 p-4 my-5 text-sm text-blue-900 dark:text-blue-200">
        <strong>PersistentKeepalive = 25</strong> sends a keepalive packet every 25 seconds. This
        keeps the tunnel alive through NAT and ensures your WireGuard client notices an IP change
        and re-resolves the endpoint promptly.
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        On your router, forward only <strong className="text-foreground font-medium">UDP port 51820</strong> to
        your WireGuard server. No other ports need to be exposed — all your services remain on the
        private network.
      </p>

      <SectionDivider />

      {/* Security recommendations */}
      <h2 className="text-base font-semibold mt-8 mb-3">Security recommendations</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        Exposing services to the internet comes with responsibility. Follow these practices to keep
        your home server safe.
      </p>

      <ul className="space-y-1.5 my-4 text-sm text-muted-foreground list-disc list-inside">
        <li>
          <strong className="text-foreground font-medium">Always use HTTPS.</strong> Use Caddy or
          Nginx Proxy Manager to get free Let&apos;s Encrypt certificates. Never expose a service
          over plain HTTP in production.
        </li>
        <li>
          <strong className="text-foreground font-medium">Move SSH off port 22.</strong> Automated
          bots scan port 22 constantly. Changing to a non-standard port (e.g. 2222) significantly
          reduces noise. Better still, disable password auth and require SSH keys only.
        </li>
        <li>
          <strong className="text-foreground font-medium">Enable MFA everywhere.</strong> Use
          two-factor authentication on all exposed services — especially Nextcloud, Gitea, and
          Home Assistant.
        </li>
        <li>
          <strong className="text-foreground font-medium">Keep services updated.</strong> Outdated
          software with known CVEs is one of the most common attack vectors. Set up automatic
          updates or check for new releases regularly.
        </li>
        <li>
          <strong className="text-foreground font-medium">Consider a VPN instead.</strong> For
          personal use, routing everything through WireGuard and keeping services off the public
          internet is the most secure approach.
        </li>
        <li>
          <strong className="text-foreground font-medium">Use fail2ban.</strong> Install fail2ban
          on your server to automatically block IPs that repeatedly fail authentication.
        </li>
      </ul>

      <PageNav
        prev={{ href: "/docs/what-is-ddns", label: "What is DDNS?" }}
        next={{ href: "/docs/static-vs-dynamic", label: "Static vs Dynamic IP" }}
      />
    </div>
  )
}
