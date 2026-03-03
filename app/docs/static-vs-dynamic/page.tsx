// Server Component
import type { Metadata } from "next"
import { CodeBlock, c } from "../_components/code-block"
import { PageNav } from "../_components/page-nav"

export const metadata: Metadata = {
  title: "Static vs Dynamic IP — NovaDNS Docs",
  description: "Understand the difference between static and dynamic IP addresses, and why dynamic DNS is the practical solution for home users.",
  openGraph: {
    title: "Static vs Dynamic IP — NovaDNS Docs",
    description: "Understand the difference between static and dynamic IP addresses, and why dynamic DNS is the practical solution for home users.",
    type: "article",
    url: "https://novadns.io/docs/static-vs-dynamic",
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

export default function StaticVsDynamicPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-widest text-primary mb-3">Learn</p>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Static vs Dynamic IP</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Understanding the difference between static and dynamic IP addresses — and why DDNS
          is the practical solution for almost everyone who needs a reliable remote access address.
        </p>
      </div>

      {/* What is a static IP */}
      <h2 className="text-base font-semibold mt-8 mb-3">What is a static IP?</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        A static IP address is one that is permanently assigned and never changes. It may be
        configured manually on the device itself (common in data centres and server environments)
        or assigned by your ISP as a fixed address tied to your account.
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        Static IPs have a clear advantage: once you know the address, you can hard-code it anywhere
        and rely on it being correct indefinitely. They are used by web servers, mail servers, and
        any system that needs a permanent, published address.
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        Cloud servers (VPS, EC2, Lightsail, etc.) typically come with a static IP by default.
        On-premises business servers often have static IPs purchased from their ISP.
      </p>

      <SectionDivider />

      {/* What is a dynamic IP */}
      <h2 className="text-base font-semibold mt-8 mb-3">What is a dynamic IP?</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        A dynamic IP address is one assigned automatically by your ISP using the DHCP protocol,
        typically from a pool of available addresses. The address is leased for a period of time —
        anywhere from a few hours to a few days — and may change when the lease expires, when your
        modem or router reboots, or when your ISP performs network maintenance.
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        Dynamic IPs are the default for virtually all residential internet connections worldwide.
        They are also universal on mobile and cellular connections, where the IP changes every time
        you reconnect to the network.
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        In practice, many residential dynamic IPs are <em>semi-stable</em> — they do not change
        every day, and some ISPs effectively give the same address to the same customer for months.
        But this is not guaranteed, and you cannot rely on it for anything that needs to stay
        reachable.
      </p>

      <SectionDivider />

      {/* Who gets which */}
      <h2 className="text-base font-semibold mt-8 mb-3">Who gets which type?</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        The type of IP you get depends almost entirely on who you are and what you are paying for.
      </p>

      <div className="border border-border divide-y divide-border">
        {[
          {
            who: "Home internet customers",
            type: "Dynamic",
            note: "Almost always dynamic, regardless of ISP or connection type. Some ISPs offer a static add-on for £5–20/month.",
          },
          {
            who: "Business internet customers",
            type: "Static available",
            note: "Business broadband packages often include one or more static IPs, sometimes as standard.",
          },
          {
            who: "Cloud VPS / servers",
            type: "Static",
            note: "Cloud providers assign a static public IP (called an Elastic IP, Floating IP, etc.) by default.",
          },
          {
            who: "Mobile / cellular",
            type: "Dynamic (CGNAT)",
            note: "Mobile connections are dynamic and are often behind carrier-grade NAT (CGNAT), making them unreachable from the internet regardless of IP stability.",
          },
          {
            who: "Office / SMB on leased line",
            type: "Static",
            note: "Dedicated leased lines typically come with a static IP block as part of the contract.",
          },
        ].map(({ who, type, note }) => (
          <div key={who} className="grid sm:grid-cols-[180px_100px_1fr] items-start px-4 py-3.5 gap-4">
            <span className="text-xs font-semibold text-foreground">{who}</span>
            <span className={`text-xs font-mono ${type === "Static" ? "text-emerald-500 dark:text-emerald-400" : type === "Dynamic" ? "text-amber-500 dark:text-amber-400" : "text-muted-foreground"}`}>
              {type}
            </span>
            <span className="text-xs text-muted-foreground leading-relaxed">{note}</span>
          </div>
        ))}
      </div>

      <SectionDivider />

      {/* Comparison table */}
      <h2 className="text-base font-semibold mt-8 mb-3">Comparison</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-border">
          <thead className="bg-muted/30">
            <tr className="divide-x divide-border border-b border-border">
              <th className="px-4 py-3 text-left text-xs font-mono font-semibold text-muted-foreground">Feature</th>
              <th className="px-4 py-3 text-center text-xs font-mono font-semibold text-muted-foreground">Static IP</th>
              <th className="px-4 py-3 text-center text-xs font-mono font-semibold text-primary">Dynamic IP + DDNS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {[
              {
                feature: "Cost",
                staticVal: "$10–20/month extra",
                ddnsVal: "Free or low cost",
                ddnsGood: true,
              },
              {
                feature: "Reliability",
                staticVal: "Permanent",
                ddnsVal: "Updates in ~60s",
                ddnsGood: true,
              },
              {
                feature: "Setup complexity",
                staticVal: "ISP contract required",
                ddnsVal: "5 minutes",
                ddnsGood: true,
              },
              {
                feature: "Availability",
                staticVal: "Not always offered",
                ddnsVal: "Works with any connection",
                ddnsGood: true,
              },
              {
                feature: "IPv6 support",
                staticVal: "Sometimes",
                ddnsVal: "Yes with NovaDNS",
                ddnsGood: true,
              },
              {
                feature: "PTR / rDNS record",
                staticVal: "Yes (usually)",
                ddnsVal: "No",
                ddnsGood: false,
              },
              {
                feature: "Best for",
                staticVal: "Business servers, email servers",
                ddnsVal: "Home, SMB, personal projects",
                ddnsGood: true,
              },
            ].map(({ feature, staticVal, ddnsVal, ddnsGood }, i) => (
              <tr key={feature} className={`divide-x divide-border ${i % 2 === 1 ? "bg-muted/10" : ""}`}>
                <td className="px-4 py-3 text-xs text-muted-foreground font-medium">{feature}</td>
                <td className="px-4 py-3 text-center text-xs text-muted-foreground">{staticVal}</td>
                <td className={`px-4 py-3 text-center text-xs font-mono ${ddnsGood ? "text-primary" : "text-muted-foreground"}`}>
                  {ddnsVal}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SectionDivider />

      {/* When you actually need a static IP */}
      <h2 className="text-base font-semibold mt-8 mb-3">When you actually need a static IP</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        DDNS covers the overwhelming majority of home and small business use cases — but there are
        a few scenarios where a true static IP is genuinely required.
      </p>

      <div className="border border-border divide-y divide-border">
        {[
          {
            case: "Email servers (MX records)",
            reason: "Email delivery relies on PTR (reverse DNS) records that map your IP back to your domain. ISPs only assign PTR records to static IPs. Without one, your outgoing email will be rejected or marked as spam by most providers.",
          },
          {
            case: "Payment processor IP allowlisting",
            reason: "Some payment processors, banks, and enterprise APIs require you to register a fixed IP address that is allowed to make API calls. A dynamic IP that changes will lock you out until you re-register.",
          },
          {
            case: "Legacy VPN systems",
            reason: "Some older IPsec or SSL VPN configurations hard-code peer IP addresses rather than using DNS lookups. These require a static IP on both ends.",
          },
          {
            case: "Regulatory / compliance requirements",
            reason: "Certain regulated industries or enterprise contracts specify that services must be hosted on a static IP for audit trail purposes.",
          },
        ].map(({ case: caseName, reason }) => (
          <div key={caseName} className="px-4 py-4">
            <p className="text-xs font-semibold text-foreground mb-1">{caseName}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{reason}</p>
          </div>
        ))}
      </div>

      <div className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 p-4 my-5 text-sm text-blue-900 dark:text-blue-200">
        If you are running an email server, the canonical solution is to use a cloud VPS (which comes
        with a static IP) for the mail server, while keeping your other self-hosted services on your
        home network with DDNS. You do not need a static IP from your ISP.
      </div>

      <SectionDivider />

      {/* DDNS as the practical solution */}
      <h2 className="text-base font-semibold mt-8 mb-3">DDNS as the practical solution</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        For the vast majority of home users and small businesses, dynamic DNS with a short TTL is
        <strong className="text-foreground font-medium"> functionally indistinguishable from a static IP</strong>.
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        NovaDNS publishes all records with a <strong className="text-foreground font-medium">60-second TTL</strong>.
        When your IP changes, the DDNS client detects it and calls the update API within its
        configured interval (as low as 30 seconds on paid plans). The new IP propagates globally
        within approximately two minutes.
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        For a WireGuard VPN, a home server, a security camera, or any service where you are the
        only regular user, a two-minute changeover during an IP change — which may happen once every
        few weeks — is completely acceptable. In many cases it goes entirely unnoticed.
      </p>

      <CodeBlock filename="example" label="typical IP change lifecycle">
        {c.dim("# Your ISP reassigns your IP at 03:14 AM")}{"\n"}
        {c.dim("# Timeline:")}{"\n"}
        {"\n"}
        {c.plain("03:14:00  ")}{c.out("ISP assigns new IP: 198.51.100.7")}{"\n"}
        {c.plain("03:14:22  ")}{c.out("DDNS client detects change, calls /api/update")}{"\n"}
        {c.plain("03:14:23  ")}{c.out("NovaDNS updates home.novaip.link → 198.51.100.7")}{"\n"}
        {c.plain("03:15:23  ")}{c.out("TTL expires — new IP visible globally")}{"\n"}
        {"\n"}
        {c.dim("# Total downtime: ~83 seconds, at 3am")}
      </CodeBlock>

      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        If you need the absolute minimum changeover time, use a paid plan with a 30-second update
        interval and configure your client to poll as frequently as allowed. Combined with the
        60-second TTL, you can achieve end-to-end propagation in under two minutes.
      </p>

      <div className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4 my-5 text-sm text-amber-900 dark:text-amber-200">
        <strong>CGNAT warning:</strong> if your ISP places you behind carrier-grade NAT (common
        with 4G/5G home broadband and mobile connections), you do not have a publicly routable IP
        address at all — static or dynamic. DDNS cannot help in this situation. Check with your ISP
        whether you have a publicly routable IP, or use a VPN tunnel service like Tailscale or
        Cloudflare Tunnel to bypass the NAT.
      </div>

      <PageNav
        prev={{ href: "/docs/home-server", label: "Home Server Guide" }}
        next={undefined}
      />
    </div>
  )
}
