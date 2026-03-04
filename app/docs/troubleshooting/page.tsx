// Server Component
import type { Metadata } from "next"
import { CodeBlock, c } from "../_components/code-block"
import { PageNav } from "../_components/page-nav"

export const metadata: Metadata = {
  title: "Troubleshooting — NovaDNS Docs",
  description: "Common issues and fixes for NovaDNS: DNS not updating, authentication errors, client configuration problems, and more.",
  openGraph: {
    title: "Troubleshooting — NovaDNS Docs",
    description: "Common issues and fixes for NovaDNS: DNS not updating, authentication errors, client configuration problems, and more.",
    type: "article",
    url: "https://novadns.io/docs/troubleshooting",
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

export default function TroubleshootingPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-widest text-primary mb-3">Guides</p>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Troubleshooting</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Solutions to the most common problems encountered when setting up or running NovaDNS.
          If you do not find an answer here, the update log in the dashboard is usually the fastest
          way to diagnose what is happening.
        </p>
      </div>

      {/* ── Host shows as Offline ─────────────────────────────────── */}
      <div id="host-offline">
        <h2 className="text-base font-semibold mt-8 mb-3">Host shows as Offline</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          A host is marked Offline when NovaDNS has not received a successful update in the last
          10 minutes. This means either the client has stopped sending updates, or the updates are
          failing before they reach the server.
        </p>

        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          Work through this checklist in order:
        </p>

        <ul className="space-y-1.5 my-4 text-sm text-muted-foreground list-disc list-inside">
          <li>Confirm the DDNS client or script is actually running (check process list, service status, or cron log).</li>
          <li>Verify the token in your client matches the one shown in the dashboard under Host Settings.</li>
          <li>Check that the device can reach <InlineCode>novadns.io</InlineCode> — try a manual curl from the same machine.</li>
          <li>Open the <InlineCode>Update Log</InlineCode> tab on the host in the dashboard — if entries appear there, the server is receiving updates and the issue may be in how the status is calculated.</li>
          <li>If no log entries appear at all, the updates are not reaching the server. Check firewall rules and outbound HTTPS access.</li>
        </ul>

        <CodeBlock filename="shell" label="quick connectivity test">
          {c.prompt("$ ")}{c.kw("curl")}{c.plain(" -sv ")}{c.str('"https://novadns.io/api/update?token=YOUR_TOKEN"')}
        </CodeBlock>

        <p className="text-sm text-muted-foreground leading-relaxed mt-3 mb-4">
          A successful response looks like <InlineCode>{"{ \"ipv4\": \"...\", \"ipv6\": null }"}</InlineCode>.
          Any other response indicates the specific error — check the HTTP status code and body.
        </p>
      </div>

      <SectionDivider />

      {/* ── IP is not updating ────────────────────────────────────── */}
      <div id="ip-not-updating">
        <h2 className="text-base font-semibold mt-8 mb-3">IP is not updating</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          The host shows as Online (updates are arriving), but the IP address in the dashboard is
          wrong or stale. This usually means the client is sending the wrong IP address.
        </p>

        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Common causes:
        </p>

        <ul className="space-y-1.5 my-4 text-sm text-muted-foreground list-disc list-inside">
          <li>
            The client is sending a private or LAN IP via the <InlineCode>myip</InlineCode> parameter.
            Remove the parameter to let NovaDNS auto-detect the public IP from the request, or ensure
            the value is your actual public IP.
          </li>
          <li>
            The client is behind a proxy or VPN and the auto-detected IP is the proxy's address rather
            than your true WAN IP. Use an external IP-check service (e.g.{" "}
            <InlineCode>https://api4.my-ip.io/ip</InlineCode>) to get the correct address and pass it
            explicitly.
          </li>
          <li>
            The client's IP change detection is not triggering because it compares against a locally
            cached value that has become stale. Force a manual update to reset the cache.
          </li>
        </ul>

        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          Check the update log to see exactly what IP was sent in each update:
        </p>

        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Dashboard → your host → <InlineCode>Update Log</InlineCode> tab. Each row shows the IP
          that was recorded. If you see the wrong IP there, the problem is on the client side.
        </p>
      </div>

      <SectionDivider />

      {/* ── Invalid token (401) ───────────────────────────────────── */}
      <div id="invalid-token">
        <h2 className="text-base font-semibold mt-8 mb-3">Invalid token error (401)</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          A <InlineCode>401 Unauthorized</InlineCode> response means the token was not recognised.
          The most common cause is that the token was regenerated in the dashboard after the client
          was set up, leaving the client with an outdated token.
        </p>

        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          To fix this:
        </p>

        <ul className="space-y-1.5 my-4 text-sm text-muted-foreground list-disc list-inside">
          <li>Go to the host in the dashboard and copy the current token from <InlineCode>Host Settings → Update Token</InlineCode>.</li>
          <li>The token is a 64-character hex string — make sure you copied the full token with no trailing spaces or line breaks.</li>
          <li>Paste the complete token into your client configuration and save.</li>
          <li>Trigger a manual update to verify the new token is accepted.</li>
        </ul>

        <CodeBlock filename="shell" label="verify your token length">
          {c.prompt("$ ")}{c.kw("echo")}{c.plain(" -n ")}{c.str('"YOUR_TOKEN"')}{c.plain(" | ")}{c.kw("wc")}{c.plain(" -c")}{"\n"}
          {c.out("64")}
        </CodeBlock>

        <div className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4 my-5 text-sm text-amber-900 dark:text-amber-200">
          The host token is not the same as your account password. Routers and clients using Basic
          Auth (DynDNS protocol) must use the host token as the password, not your login password.
        </div>
      </div>

      <SectionDivider />

      {/* ── Too many requests (429) ───────────────────────────────── */}
      <div id="rate-limited">
        <h2 className="text-base font-semibold mt-8 mb-3">Too many requests (429)</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          NovaDNS enforces a rate limit of 30 requests per 60 seconds per source IP address. If
          your client exceeds this limit, further requests are rejected with a{" "}
          <InlineCode>429 Too Many Requests</InlineCode> response until the window resets.
        </p>

        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          A well-behaved DDNS client should not normally hit this limit. If you are seeing 429
          responses:
        </p>

        <ul className="space-y-1.5 my-4 text-sm text-muted-foreground list-disc list-inside">
          <li>Increase the update interval to at least 5 minutes (300 seconds). More frequent updates provide no benefit — DNS TTLs mean the change propagates at the same rate regardless.</li>
          <li>Check whether multiple clients or scripts are sharing the same source IP and all updating the same host — their requests are aggregated against the same rate limit bucket.</li>
          <li>If you have a script in a retry loop, add a minimum backoff of 60 seconds between retries.</li>
        </ul>

        <CodeBlock filename="crontab" label="correct — every 5 minutes">
          {c.dim("# m  h  dom mon dow  command")}{"\n"}
          {c.str("*/5")}{c.plain("  ")}{c.str("*")}{c.plain("  ")}{c.str("*")}{c.plain("  ")}{c.str("*")}{c.plain("  ")}{c.str("*")}{c.plain("  ")}{c.kw("curl")}{c.plain(" -s ")}{c.str('"https://novadns.io/api/update?token=YOUR_TOKEN"')}{c.plain(" > /dev/null")}
        </CodeBlock>
      </div>

      <SectionDivider />

      {/* ── DNS not resolving ─────────────────────────────────────── */}
      <div id="dns-not-resolving">
        <h2 className="text-base font-semibold mt-8 mb-3">DNS not resolving</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          After a host is updated for the first time, DNS propagation can take up to 48 hours
          depending on resolver caching and your ISP's DNS infrastructure. Subsequent updates are
          faster because the record already exists and resolvers respect the TTL.
        </p>

        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          To diagnose a DNS issue, first confirm that the update was actually received by NovaDNS —
          open the host in the dashboard and check the Update Log. If the update is there, the
          problem is propagation or resolver caching, not NovaDNS itself.
        </p>

        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          Query the authoritative nameserver directly to bypass local resolver caches:
        </p>

        <CodeBlock filename="shell" label="check DNS">
          {c.dim("# Query the authoritative nameserver directly")}{"\n"}
          {c.prompt("$ ")}{c.kw("dig")}{c.plain(" ")}{c.str("home.novaip.link")}{c.plain(" A")}{"\n"}
          {"\n"}
          {c.dim("# Or use a public resolver to check propagation")}{"\n"}
          {c.prompt("$ ")}{c.kw("dig")}{c.plain(" ")}{c.str("@1.1.1.1")}{c.plain(" ")}{c.str("home.novaip.link")}{c.plain(" A")}
        </CodeBlock>

        <div className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 p-4 my-5 text-sm text-blue-900 dark:text-blue-200">
          NovaDNS sets a 60-second TTL on all records. Once the update is received, most resolvers
          will pick up the change within 1–2 minutes. The 48-hour figure applies only to ISPs that
          ignore TTLs and cache aggressively.
        </div>
      </div>

      <SectionDivider />

      {/* ── IPv6 not updating ─────────────────────────────────────── */}
      <div id="ipv6-not-updating">
        <h2 className="text-base font-semibold mt-8 mb-3">IPv6 not updating</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Many DDNS clients and routers only send an IPv4 address by default, even on dual-stack
          connections. If your AAAA record is not updating, the client is likely not sending an
          IPv6 address.
        </p>

        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Solutions:
        </p>

        <ul className="space-y-1.5 my-4 text-sm text-muted-foreground list-disc list-inside">
          <li>
            Use the <InlineCode>myip6</InlineCode> parameter to explicitly pass your IPv6 address.
            NovaDNS will set both the A and AAAA records in a single request.
          </li>
          <li>
            Configure two separate DDNS entries in your router — one bound to the IPv4 WAN interface
            and one bound to the IPv6 WAN interface — each pointing to the same host.
          </li>
          <li>
            On Linux, use a client like <InlineCode>inadyn</InlineCode> which supports separate IPv4
            and IPv6 update providers in the same config file.
          </li>
        </ul>

        <CodeBlock filename="shell" label="explicit dual-stack update">
          {c.prompt("$ ")}{c.kw("curl")}{c.plain(" \\\n")
          }{c.plain("  ")}{c.str('"https://novadns.io/api/update')}{c.plain("\n")
          }{c.plain("    ")}{c.flag("?token=")}{c.url("YOUR_TOKEN")}{c.plain("\n")
          }{c.plain("    ")}{c.flag("&myip=")}{c.str("203.0.113.42")}{c.plain("\n")
          }{c.plain("    ")}{c.flag("&myip6=")}{c.str("2001:db8::1")}{c.str('"')}
        </CodeBlock>

        <p className="text-sm text-muted-foreground leading-relaxed mt-3 mb-4">
          See the <a href="/docs/ipv6" className="text-primary underline underline-offset-2 hover:no-underline">IPv6 & Subnets</a> guide
          for full details on dual-stack configuration.
        </p>
      </div>

      <SectionDivider />

      {/* ── Webhook not firing ────────────────────────────────────── */}
      <div id="webhook-not-firing">
        <h2 className="text-base font-semibold mt-8 mb-3">Webhook not firing</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          If you have configured a webhook but are not receiving events, work through the following
          checks:
        </p>

        <ul className="space-y-1.5 my-4 text-sm text-muted-foreground list-disc list-inside">
          <li>Confirm the webhook is set to <InlineCode>Active</InlineCode> in <InlineCode>Settings → Webhooks</InlineCode> — inactive webhooks are skipped.</li>
          <li>Verify the endpoint URL is reachable from the public internet, not just from your local network. NovaDNS makes outbound HTTPS calls to your URL.</li>
          <li>Check your server logs for incoming requests — if requests are arriving but being rejected, the problem is on your server side (often a signature verification failure).</li>
          <li>Ensure your endpoint returns a <InlineCode>2xx</InlineCode> response within 10 seconds. Timeouts or <InlineCode>5xx</InlineCode> responses are treated as delivery failures.</li>
          <li>Check that your server is not blocking the NovaDNS outbound IP range with a firewall or WAF rule.</li>
        </ul>

        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          You can trigger a test delivery from the dashboard to help diagnose connectivity issues
          without waiting for a real IP change event. Go to the webhook and click{" "}
          <InlineCode>Send Test Event</InlineCode>.
        </p>

        <div className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 p-4 my-5 text-sm text-blue-900 dark:text-blue-200">
          During development, use a service like <InlineCode>https://webhook.site</InlineCode> as a
          temporary endpoint to confirm that NovaDNS is sending correctly formatted payloads before
          pointing to your production server.
        </div>
      </div>

      <SectionDivider />

      {/* ── DynDNS client returns 'badauth' ───────────────────────── */}
      <div id="badauth">
        <h2 className="text-base font-semibold mt-8 mb-3">DynDNS client returns "badauth"</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          A <InlineCode>badauth</InlineCode> response from the <InlineCode>/nic/update</InlineCode>{" "}
          endpoint means the Basic Auth credentials were rejected. This is almost always caused by
          using the wrong value in the password field.
        </p>

        <div className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4 my-5 text-sm text-amber-900 dark:text-amber-200">
          <strong>The password field must contain your host token, not your account password.</strong>{" "}
          Your account password is used only to log into the NovaDNS dashboard. The host token
          (a 64-character string from Host Settings) is what the DynDNS endpoint expects.
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          Correct credentials for the DynDNS endpoint:
        </p>

        <div className="border border-border divide-y divide-border my-4">
          {[
            { field: "Username", value: "your@email.com  (your account email)" },
            { field: "Password", value: "YOUR_HOST_TOKEN  (64-char token from the dashboard)" },
          ].map(({ field, value }) => (
            <div key={field} className="grid grid-cols-[120px_1fr] items-center px-4 py-3 gap-4">
              <span className="text-xs text-muted-foreground">{field}</span>
              <code className="text-xs font-mono text-foreground">{value}</code>
            </div>
          ))}
        </div>

        <CodeBlock filename="shell" label="test DynDNS auth manually">
          {c.prompt("$ ")}{c.kw("curl")}{c.plain(" -v \\\n")
          }{c.plain("  ")}{c.str('"https://')}{c.url("your%40email.com")}{c.str(":")}{c.url("YOUR_TOKEN")}{c.str("@novadns.io/nic/update")}{c.plain(" \\\n")
          }{c.plain("  ")}{c.flag("?hostname=")}{c.str("home.novaip.link")}{c.str('"')}{"\n"}
          {"\n"}
          {c.dim("# Expected response on success:")}{"\n"}
          {c.out("good 203.0.113.42")}
        </CodeBlock>

        <p className="text-sm text-muted-foreground leading-relaxed mt-3 mb-4">
          Note that the <InlineCode>@</InlineCode> symbol in your email address must be
          URL-encoded as <InlineCode>%40</InlineCode> when it appears in the URL. Most router
          firmware and DynDNS clients handle this automatically when you enter the username in a
          separate field.
        </p>
      </div>

      <PageNav />
    </div>
  )
}
