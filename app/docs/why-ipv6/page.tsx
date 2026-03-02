// Server Component
import { PageNav } from "../_components/page-nav"

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return <h2 id={id} className="text-base font-semibold mb-3 mt-10 first:mt-0">{children}</h2>
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold mb-2 mt-6">{children}</h3>
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground leading-relaxed mb-4">{children}</p>
}

function Strong({ children }: { children: React.ReactNode }) {
  return <strong className="text-foreground font-medium">{children}</strong>
}

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-xs bg-muted px-1.5 py-0.5 border border-border text-foreground">
      {children}
    </code>
  )
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

function CheckList({ items }: { items: string[] }) {
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
        <h1 className="text-2xl font-bold tracking-tight mb-2">Why IPv6 Changes Everything for Dynamic DNS</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The internet is undergoing a quiet revolution. As IPv4 addresses become scarcer,
          IPv6 adoption continues to climb — and with it comes a fundamental shift in how we
          think about Dynamic DNS.
        </p>
      </div>

      {/* The IPv4 Problem */}
      <H2 id="ipv4-problem">The IPv4 Problem: Why DDNS Existed in the First Place</H2>
      <P>
        Dynamic DNS was born out of necessity. Most ISPs assign dynamic IPv4 addresses to
        residential and small business customers, meaning your public IP can change at any time
        — after a router reboot, a lease expiration, or just because the ISP felt like it. If
        you wanted to reach a home server, a security camera, or a NAS remotely, you needed DDNS
        to keep a hostname pointed at your ever-changing IP.
      </P>
      <P>
        But the real problem runs deeper. IPv4 only offers roughly 4.3 billion addresses, and we
        ran out of fresh allocations years ago. The workaround? <Strong>NAT (Network Address Translation)</Strong> —
        hiding dozens, hundreds, or even thousands of devices behind a single public IP. NAT broke
        the end-to-end principle of the internet and made direct device access a headache involving
        port forwarding, UPnP, and other fragile hacks.
      </P>

      <Divider />

      {/* Enter IPv6 */}
      <H2 id="enter-ipv6">Enter IPv6: A Different World</H2>
      <P>
        IPv6 doesn&apos;t just give us more addresses — it gives us an almost incomprehensible number
        of them. With 2¹²⁸ possible addresses (roughly 340 undecillion), every device on earth can
        have its own globally routable address. No NAT. No port forwarding. Every device is directly
        reachable.
      </P>
      <P>This changes the DDNS game entirely.</P>

      <Divider />

      {/* Benefits */}
      <H2 id="benefits">The Benefits of IPv6 for DDNS</H2>

      <H3>1. Every Device Gets Its Own Address</H3>
      <P>
        With IPv4, your entire home network typically shares one public IP. Want to reach your
        camera on port 80? Too bad — your web server is already using port 80 on that IP. You&apos;d
        have to use awkward port mappings like <InlineCode>yourdomain.com:8080</InlineCode> for
        the camera and <InlineCode>yourdomain.com:80</InlineCode> for the web server.
      </P>
      <P>
        With IPv6, each device has its own globally unique address. Your camera, your NAS, your
        home automation hub — they all get their own address and their own DDNS hostname.
        <InlineCode>camera.home.example.com</InlineCode> and <InlineCode>nas.home.example.com</InlineCode>{" "}
        can both listen on port 443 without conflict. It&apos;s clean, intuitive, and how the
        internet was always meant to work.
      </P>

      <CodeBox>
        <div className="text-muted-foreground mb-1"># Each device gets its own hostname — no port conflicts</div>
        <div><span className="text-primary">camera.home.example.com</span>   <span className="text-foreground">AAAA  2001:db8::1001</span></div>
        <div><span className="text-primary">nas.home.example.com</span>       <span className="text-foreground">AAAA  2001:db8::1002</span></div>
        <div><span className="text-primary">homelab.home.example.com</span>   <span className="text-foreground">AAAA  2001:db8::1003</span></div>
      </CodeBox>

      <H3>2. No More NAT Traversal Nightmares</H3>
      <P>
        NAT is the bane of remote access. Port forwarding is fragile, UPnP is a security risk,
        and carrier-grade NAT (CGNAT) — where your ISP puts you behind <em>their</em> NAT — makes
        inbound connections nearly impossible without relay services or VPN tunnels.
      </P>
      <P>
        IPv6 eliminates NAT entirely. When you update a DDNS record with a device&apos;s IPv6 address,
        anyone on the IPv6 internet can reach it directly. No port forwarding rules to maintain, no
        praying that your ISP doesn&apos;t change your NAT mapping. It just works.
      </P>

      <H3>3. Stability and Predictability</H3>
      <P>
        While IPv6 addresses can still be dynamic (many ISPs rotate the prefix), in practice IPv6
        tends to be more stable than IPv4:
      </P>
      <CheckList items={[
        "SLAAC (Stateless Address Autoconfiguration) generates addresses based on the network prefix plus the device's own identifier, so the host part often stays the same even if the prefix changes.",
        "Many ISPs assign stable IPv6 prefixes via DHCPv6-PD (Prefix Delegation), especially on business-tier plans. Some even give you a static /48 or /56 block.",
        "With IPv6 privacy extensions, devices maintain a stable address for inbound connections — perfect for DDNS — while using temporary addresses for outbound traffic.",
      ]} />
      <P>The result: DDNS updates happen less frequently, and your services experience fewer disruptions.</P>

      <H3>4. Better for IoT and Edge Devices</H3>
      <P>
        When you have dozens of smart devices — cameras, sensors, controllers — giving each one
        a dedicated DDNS entry over IPv6 creates a clean, manageable topology. Instead of one IP
        with a maze of port forwards:
      </P>
      <CodeBox>
        <div><span className="text-primary">camera-front.iot.example.com</span>  <span className="text-foreground">→ 2001:db8::1001</span></div>
        <div><span className="text-primary">camera-back.iot.example.com</span>   <span className="text-foreground">→ 2001:db8::1002</span></div>
        <div><span className="text-primary">thermostat.iot.example.com</span>    <span className="text-foreground">→ 2001:db8::1003</span></div>
        <div><span className="text-primary">doorbell.iot.example.com</span>      <span className="text-foreground">→ 2001:db8::1004</span></div>
      </CodeBox>
      <P>
        Each device is independently addressable, independently firewalled, and independently
        monitored. It scales naturally in a way that IPv4 with NAT never could.
      </P>

      <H3>5. Simplified Firewall Rules</H3>
      <P>
        Without NAT, firewall rules become straightforward. You&apos;re not translating ports and
        juggling forwarding rules — you&apos;re simply allowing or denying traffic to specific addresses
        on specific ports:
      </P>
      <CheckList items={[
        "Rules are explicit and per-device rather than per-port-on-a-shared-IP.",
        "There's no confusion about which device a port forward targets.",
        "You can apply granular policies: allow SSH to the NAS from your office's IPv6 range, allow HTTPS to the camera from everywhere, block everything else.",
      ]} />

      <H3>6. Future-Proofing Your Infrastructure</H3>
      <P>
        IPv4 is a shrinking resource. ISPs are increasingly deploying CGNAT, making traditional
        IPv4 DDNS unreliable or impossible for some users. If your ISP puts you behind CGNAT, no
        amount of DDNS will help — inbound connections simply won&apos;t reach you.
      </P>
      <P>
        IPv6 DDNS sidesteps this entirely. Even as IPv4 becomes more restricted, IPv6 connectivity
        continues to expand. Building your DDNS infrastructure around IPv6 ensures you won&apos;t be
        locked out when your ISP inevitably tightens IPv4 access.
      </P>

      <H3>7. Dual-Stack DDNS: The Best of Both Worlds</H3>
      <P>
        You don&apos;t have to choose. A modern DDNS setup maintains both <Strong>A records (IPv4)</Strong> and{" "}
        <Strong>AAAA records (IPv6)</Strong> for each hostname. Clients that support IPv6 use the AAAA
        record; legacy clients fall back to the A record automatically.
      </P>
      <P>
        NovaDNS does this by default — every host simultaneously tracks both addresses. Your update
        client reports both, and both records are kept current.
      </P>

      <Divider />

      {/* Practical Considerations */}
      <H2 id="practical">Practical Considerations</H2>

      <H3>Privacy Extensions and Address Tracking</H3>
      <P>
        IPv6 privacy extensions (RFC 4941) generate randomized temporary addresses for outbound
        traffic, preventing tracking. For DDNS, use the device&apos;s <Strong>stable address</Strong>{" "}
        (EUI-64 or manually configured) rather than the temporary one. Most operating systems let
        you configure which address is used for outbound vs. inbound.
      </P>

      <H3>ISP Support Varies</H3>
      <P>
        Not all ISPs handle IPv6 equally. Some provide full, native IPv6 with stable prefix
        delegation. Others offer only 6to4 tunnels or no IPv6 at all. Before building an IPv6 DDNS
        setup, verify what your ISP actually provides. Global IPv6 adoption has crossed 40% and
        continues to grow steadily.
      </P>

      <H3>Firewall Defaults Matter</H3>
      <Note>
        With IPv4 and NAT, your devices were &quot;protected&quot; by obscurity — nothing could reach them
        because NAT blocked unsolicited inbound connections. With IPv6, every device is reachable
        by default. Verify that your router has a default-deny inbound policy for IPv6. DDNS without
        proper firewalling is an open invitation.
      </Note>

      <H3>Client and Application Support</H3>
      <P>
        Most modern operating systems, browsers, and applications handle IPv6 natively. However,
        some older IoT devices, embedded systems, or legacy applications may not. Test connectivity
        end-to-end before relying on IPv6 DDNS for critical access.
      </P>

      <Divider />

      {/* Getting Started */}
      <H2 id="getting-started">Getting Started</H2>
      <P>Setting up IPv6 DDNS isn&apos;t much different from IPv4. The key steps are:</P>
      <div className="border border-border divide-y divide-border mb-6">
        {[
          { step: "1", text: "Confirm your ISP provides IPv6 — check your router's WAN status or visit test-ipv6.com." },
          { step: "2", text: "Register a host on NovaDNS — both A and AAAA records are tracked automatically." },
          { step: "3", text: "Configure your update client to detect and report the device's IPv6 address, not just IPv4." },
          { step: "4", text: "Set up firewall rules — explicitly allow only the traffic you want to each device." },
          { step: "5", text: "Test from an external IPv6 connection — verify the hostname resolves and the device is reachable." },
        ].map(({ step, text }) => (
          <div key={step} className="flex items-start gap-4 px-4 py-3">
            <span className="text-xs font-mono text-primary font-bold shrink-0 mt-0.5">{step}</span>
            <span className="text-sm text-muted-foreground">{text}</span>
          </div>
        ))}
      </div>

      <Divider />

      {/* Conclusion */}
      <H2 id="conclusion">Conclusion</H2>
      <P>
        IPv6 doesn&apos;t just solve address exhaustion — it fundamentally improves how DDNS works.
        Direct addressability, no NAT, cleaner management, better security posture, and future-proof
        infrastructure all make IPv6 the natural companion to dynamic DNS.
      </P>
      <P>
        If you&apos;ve been fighting with port forwarding, CGNAT limitations, or IP conflicts, IPv6 DDNS
        might be the solution you didn&apos;t know you were looking for. The transition takes some
        learning, but the payoff is a simpler, more reliable, and more scalable network that works
        the way the internet was always designed to.
      </P>

      <PageNav
        prev={{ href: "/docs/clients", label: "Client Setup" }}
      />
    </div>
  )
}
