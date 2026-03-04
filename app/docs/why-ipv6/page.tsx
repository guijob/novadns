// Server Component
import type { Metadata } from "next"
import { PageNav } from "../_components/page-nav"

export const metadata: Metadata = {
  title: "Benefits of IPv6 for DDNS — NovaDNS Docs",
  description: "How IPv6 makes Dynamic DNS more powerful: no NAT, CGNAT-proof, one address per device, and simpler firewall rules.",
  openGraph: {
    title: "Benefits of IPv6 for DDNS — NovaDNS Docs",
    description: "How IPv6 makes Dynamic DNS more powerful: no NAT, CGNAT-proof, one address per device, and simpler firewall rules.",
    type: "article",
    url: "https://novadns.io/docs/why-ipv6",
    siteName: "NovaDNS",
    images: [{ url: "https://novadns.io/opengraph-image" }],
  },
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return <h2 id={id} className="text-base font-semibold mb-3 mt-10 first:mt-0">{children}</h2>
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground leading-relaxed mb-4">{children}</p>
}

function Strong({ children }: { children: React.ReactNode }) {
  return <strong className="text-foreground font-medium">{children}</strong>
}

function Divider() {
  return <div className="border-t border-border mt-10 pt-2" />
}

function CodeBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-border bg-muted/30 p-4 font-mono text-xs leading-relaxed overflow-x-auto mb-4">
      {children}
    </div>
  )
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-border bg-muted/20 px-4 py-3 mb-4">
      <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>
    </div>
  )
}

function CheckList({ items }: { items: (string | React.ReactNode)[] }) {
  return (
    <ul className="space-y-2 mb-4">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
          <span className="text-primary font-mono shrink-0 mt-0.5">→</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export default function WhyIPv6Page() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-widest text-primary mb-3">Guide</p>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Benefits of Using IPv6 as DDNS</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Dynamic DNS has traditionally been used to map hostnames to dynamic IPv4 addresses. With IPv6, DDNS becomes
          significantly more powerful. The massive address space, the elimination of NAT, and direct device
          addressability solve many of the pain points that plagued IPv4-based setups.
        </p>
      </div>

      {/* 1 */}
      <H2 id="one-address-per-device">1. One Address Per Device</H2>
      <P>
        IPv4 forces all devices to share a single public IP through NAT. Accessing different services requires port
        forwarding and non-standard port mappings (e.g., <code className="font-mono text-xs bg-muted px-1.5 py-0.5 border border-border text-foreground">:8080</code>,{" "}
        <code className="font-mono text-xs bg-muted px-1.5 py-0.5 border border-border text-foreground">:8443</code>).
      </P>
      <P>
        With IPv6, every device gets its own globally routable address. Each one can have a dedicated DDNS hostname
        and use standard ports without conflict:
      </P>
      <CodeBox>
        <div><span className="text-primary">camera-front.example.com</span>  <span className="text-foreground">→ 2001:db8::1001</span></div>
        <div><span className="text-primary">camera-back.example.com</span>   <span className="text-foreground">→ 2001:db8::1002</span></div>
        <div><span className="text-primary">nas.example.com</span>            <span className="text-foreground">→ 2001:db8::1003</span></div>
      </CodeBox>


      {/* 2 */}
      <H2 id="no-nat">2. No NAT, No Port Forwarding</H2>
      <P>
        NAT is the biggest obstacle to reliable remote access on IPv4. Port forwarding is fragile, UPnP is a security
        risk, and Carrier-Grade NAT (CGNAT) can make inbound connections completely impossible.
      </P>
      <P>
        IPv6 removes NAT from the equation. A DDNS hostname pointing to an IPv6 address is directly reachable from
        anywhere on the IPv6 internet — no forwarding rules, no relay services, no workarounds.
      </P>


      {/* 3 */}
      <H2 id="cgnat-proof">3. CGNAT-Proof</H2>
      <P>
        Many ISPs now deploy CGNAT, placing customers behind a shared IPv4 address. In this scenario, traditional
        IPv4 DDNS is useless because inbound traffic never reaches your router.
      </P>
      <P>
        IPv6 bypasses CGNAT entirely. Even if your ISP restricts IPv4, your IPv6 connectivity remains end-to-end,
        keeping your DDNS-based services accessible.
      </P>


      {/* 4 */}
      <H2 id="stable-addresses">4. More Stable Addresses</H2>
      <P>IPv6 addresses tend to change less frequently than IPv4:</P>
      <CheckList items={[
        <><Strong>SLAAC</Strong> generates the host portion of the address locally, so it often remains constant even if the prefix changes.</>,
        <>Many ISPs assign <Strong>stable prefixes</Strong> via DHCPv6 Prefix Delegation.</>,
        <>Devices can maintain a <Strong>stable address for inbound traffic</Strong> while using temporary addresses for outbound (privacy extensions).</>,
      ]} />
      <P>This means fewer DDNS updates and fewer service interruptions.</P>


      {/* 5 */}
      <H2 id="iot">5. Better IoT and Multi-Device Management</H2>
      <P>
        When every device has its own address and hostname, network management becomes much cleaner. Instead of
        tracking which port maps to which device behind a shared IP, you have a flat, readable structure where each
        device is independently addressable, firewalled, and monitored.
      </P>
      <P>
        This scales naturally — adding a new device is just adding a new DDNS entry, not reworking your port
        forwarding table.
      </P>


      {/* 6 */}
      <H2 id="firewall">6. Simpler and More Secure Firewall Rules</H2>
      <P>
        Without NAT, firewall rules are explicit and per-device. You allow or deny traffic to specific addresses on
        specific ports — no ambiguity about which device a forwarded port targets.
      </P>
      <P>
        This improves security because rules are granular and auditable. For example: allow HTTPS to the camera from
        everywhere, allow SSH to the NAS only from your office&apos;s IPv6 range, deny everything else.
      </P>


      {/* 7 */}
      <H2 id="dual-stack">7. Dual-Stack Compatibility</H2>
      <P>
        You don&apos;t have to go IPv6-only. A DDNS setup can maintain both A (IPv4) and AAAA (IPv6) records for each
        hostname. IPv6-capable clients use the AAAA record; legacy clients fall back to IPv4. This gives full
        compatibility today while preparing for an IPv6-dominant future.
      </P>


      {/* Practical Considerations */}
      <H2 id="practical">Practical Considerations</H2>
      <Note>
        <Strong>Firewall configuration is critical.</Strong> Without NAT, devices are directly reachable. Ensure your
        router has a default-deny inbound policy for IPv6 and only open what you need.
      </Note>
      <CheckList items={[
        <><Strong>ISP support varies.</Strong> Verify that your ISP provides native IPv6 with prefix delegation before building around it. Global adoption is above 40% and growing.</>,
        <><Strong>Use stable addresses for DDNS.</Strong> Configure devices to use their stable (non-temporary) address for inbound connections, not the randomized privacy address.</>,
        <><Strong>Test end-to-end.</Strong> Some older devices and applications may not fully support IPv6. Verify connectivity before relying on it for critical access.</>,
      ]} />

      <PageNav />
    </div>
  )
}
