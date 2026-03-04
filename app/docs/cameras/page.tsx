// Server Component
import type { Metadata } from "next"
import { PageNav } from "../_components/page-nav"

export const metadata: Metadata = {
  title: "IP Cameras Guide — NovaDNS Docs",
  description: "Set up dynamic DNS for IP cameras. Remote access for Hikvision, Dahua, Reolink, Axis, and NVR/DVR systems with NovaDNS.",
  openGraph: {
    title: "IP Cameras Guide — NovaDNS Docs",
    description: "Set up dynamic DNS for IP cameras. Remote access for Hikvision, Dahua, Reolink, Axis, and NVR/DVR systems with NovaDNS.",
    type: "article",
    url: "https://novadns.io/docs/cameras",
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

export default function CamerasPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-widest text-primary mb-3">Learn</p>
        <h1 className="text-2xl font-bold tracking-tight mb-2">IP Cameras Guide</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          A practical guide to setting up dynamic DNS for IP cameras — covering remote access,
          brand-specific setup, NVR configuration, and security best practices.
        </p>
      </div>

      {/* Why cameras need DDNS */}
      <h2 className="text-base font-semibold mt-8 mb-3">Why cameras need Dynamic DNS</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        IP cameras let you monitor a location remotely — but only if you can reach them. Most
        internet connections use a dynamic IP address that changes periodically. When your IP
        changes, your camera feed becomes unreachable unless you manually update the address in
        your viewing app.
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        Dynamic DNS solves this by giving your camera a stable hostname like{" "}
        <InlineCode>cam-lobby.novaip.link</InlineCode> that always points to your current IP.
        Most IP cameras and NVRs have a built-in DDNS client that can update this automatically.
      </p>

      <SectionDivider />

      {/* Brand-specific setup */}
      <h2 className="text-base font-semibold mt-8 mb-3">Setting up by brand</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        Most IP cameras support DynDNS or No-IP as a DDNS provider. Since NovaDNS is
        protocol-compatible with both, you can select either option in your camera's settings.
      </p>

      <div className="border border-border divide-y divide-border my-5">
        {[
          {
            brand: "Hikvision",
            steps: [
              "Open Configuration > Network > DDNS",
              "Enable DDNS and select \"DynDNS\" as the provider",
              "Server Address: novadns.io",
              "Domain: your-host.novaip.link",
              "User Name: your NovaDNS email",
              "Password: your host update token",
            ],
          },
          {
            brand: "Dahua",
            steps: [
              "Open Setup > Network > DDNS",
              "Enable DDNS and select \"NO-IP\" as the provider",
              "Server Address: novadns.io",
              "Domain: your-host.novaip.link",
              "Username: your NovaDNS email",
              "Password: your host update token",
            ],
          },
          {
            brand: "Reolink",
            steps: [
              "Open Device Settings > Network > Advanced > DDNS",
              "Enable DDNS and select \"NO-IP\" as the provider",
              "Server: novadns.io",
              "Domain Name: your-host.novaip.link",
              "User Name: your NovaDNS email",
              "Password: your host update token",
            ],
          },
          {
            brand: "Axis",
            steps: [
              "Open Settings > System > Network > Dynamic DNS",
              "Enable Dynamic DNS",
              "Provider: select \"DynDNS\"",
              "Hostname: your-host.novaip.link",
              "Username: your NovaDNS email",
              "Password: your host update token",
            ],
          },
        ].map(({ brand, steps }) => (
          <div key={brand} className="px-4 py-4">
            <p className="text-sm font-medium mb-2">{brand}</p>
            <ol className="list-decimal list-inside space-y-1">
              {steps.map((step, i) => (
                <li key={i} className="text-sm text-muted-foreground">{step}</li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        The exact menu paths may vary by firmware version. The key is to select DynDNS or No-IP
        as the provider and use <InlineCode>novadns.io</InlineCode> as the server address.
      </p>

      <SectionDivider />

      {/* NVR / DVR */}
      <h2 className="text-base font-semibold mt-8 mb-3">NVR and DVR configuration</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        If you use a network video recorder (NVR) or DVR, you typically configure DDNS on
        the recorder rather than on each individual camera. The NVR acts as the gateway for
        all connected cameras.
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        The setup is identical to configuring a single camera — navigate to the DDNS settings
        in your NVR's web interface, select DynDNS or No-IP, and enter your NovaDNS credentials.
        All cameras connected to the NVR will be reachable through the same hostname.
      </p>

      <SectionDivider />

      {/* Port forwarding */}
      <h2 className="text-base font-semibold mt-8 mb-3">Port forwarding for remote access</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        DDNS gives you a stable hostname, but you also need to forward the right ports on your
        router so traffic can reach your camera or NVR from the internet.
      </p>
      <div className="border border-border divide-y divide-border my-5">
        {[
          { port: "80 / 443", protocol: "HTTP / HTTPS", use: "Web interface and mobile app access" },
          { port: "554", protocol: "RTSP", use: "Live video streaming" },
          { port: "8000", protocol: "Hikvision SDK", use: "Hikvision device management" },
          { port: "37777", protocol: "Dahua SDK", use: "Dahua device management" },
        ].map(({ port, protocol, use }) => (
          <div key={port} className="px-4 py-3 grid grid-cols-3 gap-4">
            <span className="text-sm font-mono text-foreground">{port}</span>
            <span className="text-sm text-muted-foreground">{protocol}</span>
            <span className="text-sm text-muted-foreground">{use}</span>
          </div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        For security, prefer HTTPS (port 443) over HTTP and consider changing default ports
        to non-standard ones to reduce automated scanning.
      </p>

      <SectionDivider />

      {/* Webhooks */}
      <h2 className="text-base font-semibold mt-8 mb-3">Webhooks for IP change alerts</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        NovaDNS can send a webhook notification every time your IP address changes. This is
        useful for triggering alerts in your monitoring system or updating firewall rules
        automatically.
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        Configure webhooks in your NovaDNS dashboard under the host settings. You can point
        them at any HTTP endpoint — a Slack webhook, a monitoring API, or a custom script.
        See the <a href="/docs/webhooks" className="text-primary hover:underline">Webhooks guide</a> for
        details.
      </p>

      <SectionDivider />

      {/* Security */}
      <h2 className="text-base font-semibold mt-8 mb-3">Security best practices</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        Exposing cameras to the internet requires care. Follow these practices to reduce risk:
      </p>
      <ul className="list-disc list-inside space-y-2 mb-4">
        <li className="text-sm text-muted-foreground">
          <strong className="text-foreground font-medium">Always use HTTPS</strong> — enable
          TLS on your camera or NVR to encrypt traffic in transit.
        </li>
        <li className="text-sm text-muted-foreground">
          <strong className="text-foreground font-medium">Change default passwords</strong> — factory
          credentials are the most common attack vector for IP cameras.
        </li>
        <li className="text-sm text-muted-foreground">
          <strong className="text-foreground font-medium">Use non-standard ports</strong> — moving
          services off default ports reduces exposure to automated scanners.
        </li>
        <li className="text-sm text-muted-foreground">
          <strong className="text-foreground font-medium">Keep firmware updated</strong> — camera
          manufacturers regularly patch security vulnerabilities.
        </li>
        <li className="text-sm text-muted-foreground">
          <strong className="text-foreground font-medium">Consider a VPN</strong> — for maximum
          security, access cameras through a VPN tunnel instead of direct port forwarding.
        </li>
        <li className="text-sm text-muted-foreground">
          <strong className="text-foreground font-medium">Use per-host tokens</strong> — NovaDNS
          gives each device its own credentials, so compromising one device doesn't affect others.
        </li>
      </ul>

      <PageNav />
    </div>
  )
}
