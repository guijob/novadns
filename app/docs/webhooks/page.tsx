// Server Component
import type { Metadata } from "next"
import { CodeBlock, c } from "../_components/code-block"
import { PageNav } from "../_components/page-nav"

export const metadata: Metadata = {
  title: "Webhooks — NovaDNS Docs",
  description: "Send real-time HTTP notifications when a host's IP address changes. Configure endpoints, secrets, and HMAC-SHA256 verification.",
  openGraph: {
    title: "Webhooks — NovaDNS Docs",
    description: "Send real-time HTTP notifications when a host's IP address changes. Configure endpoints, secrets, and HMAC-SHA256 verification.",
    type: "article",
    url: "https://novadns.io/docs/webhooks",
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

export default function WebhooksPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-widest text-primary mb-3">Guides</p>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Webhooks</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Receive real-time HTTP callbacks when your hosts change. Use webhooks to trigger
          automations, update firewall rules, notify your team, or integrate with external systems.
        </p>
      </div>

      {/* What are webhooks */}
      <div id="what-are-webhooks">
        <h2 className="text-base font-semibold mt-8 mb-3">What are webhooks</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Webhooks are event-driven HTTP callbacks. When something happens to one of your hosts —
          an IP change, a new host being created, or a host going offline — NovaDNS sends an HTTP{" "}
          <InlineCode>POST</InlineCode> request to the URL you registered, containing a JSON payload
          describing the event.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Unlike polling the API on a timer, webhooks push data to you the moment an event occurs.
          This makes them ideal for low-latency automation — for example, updating a firewall
          allowlist within seconds of your home IP changing.
        </p>
        <div className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 p-4 my-5 text-sm text-blue-900 dark:text-blue-200">
          Your endpoint must respond with an HTTP <strong>2xx</strong> status code within 10 seconds.
          NovaDNS will retry failed deliveries up to 3 times with exponential backoff before
          marking the delivery as failed.
        </div>
      </div>

      <SectionDivider />

      {/* Creating a webhook */}
      <div id="creating-a-webhook">
        <h2 className="text-base font-semibold mt-8 mb-3">Creating a webhook</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Webhooks are managed per workspace from the dashboard.
        </p>
        <ol className="space-y-2 my-4 text-sm text-muted-foreground list-decimal list-inside leading-relaxed">
          <li>Open the dashboard and navigate to <strong className="text-foreground">Webhooks</strong> in the sidebar.</li>
          <li>Click <strong className="text-foreground">New webhook</strong>.</li>
          <li>Enter your endpoint URL. It must be publicly reachable and use <InlineCode>https://</InlineCode>.</li>
          <li>Select one or more event types to subscribe to.</li>
          <li>Save — NovaDNS generates a signing secret for this webhook immediately.</li>
        </ol>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Copy the signing secret now — it is only shown once. You will use it to verify the
          authenticity of incoming payloads on your server.
        </p>
        <div className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4 my-5 text-sm text-amber-900 dark:text-amber-200">
          Webhook endpoints must use <strong>HTTPS</strong>. Plain HTTP endpoints are rejected at
          creation time to ensure payload integrity in transit.
        </div>
      </div>

      <SectionDivider />

      {/* Event types */}
      <div id="event-types">
        <h2 className="text-base font-semibold mt-8 mb-3">Event types</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Subscribe to any combination of the following events. You can update your subscriptions
          at any time from the webhook settings page.
        </p>
        <div className="border border-border">
          <div className="grid grid-cols-[200px_1fr] text-xs font-mono uppercase tracking-wide text-muted-foreground bg-muted/30 border-b border-border px-4 py-2">
            <span>Event</span>
            <span>Description</span>
          </div>
          {[
            {
              event: "host.ip_updated",
              desc: "Fired every time a host's IPv4 or IPv6 address changes. This is the most commonly used event — use it to keep firewalls, VPNs, or external DNS records in sync.",
            },
            {
              event: "host.created",
              desc: "Fired when a new host is added to the workspace. Useful for provisioning workflows that need to react to new hosts automatically.",
            },
            {
              event: "host.deleted",
              desc: "Fired when a host is permanently deleted. Use this to clean up external resources or audit logs.",
            },
            {
              event: "host.status_changed",
              desc: "Fired when a host transitions between online and offline states, based on whether it has sent an update recently. Useful for alerting and monitoring.",
            },
          ].map(({ event, desc }) => (
            <div key={event} className="grid grid-cols-[200px_1fr] items-start gap-4 px-4 py-3.5 border-t border-border first:border-t-0">
              <code className="text-xs font-mono text-foreground">{event}</code>
              <span className="text-xs text-muted-foreground leading-relaxed">{desc}</span>
            </div>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* Payload format */}
      <div id="payload-format">
        <h2 className="text-base font-semibold mt-8 mb-3">Payload format</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Every webhook delivery is an HTTP <InlineCode>POST</InlineCode> with a{" "}
          <InlineCode>Content-Type: application/json</InlineCode> body. The top-level{" "}
          <InlineCode>event</InlineCode> field identifies the event type; remaining fields
          are event-specific.
        </p>
        <CodeBlock filename="POST <your-endpoint>" label="host.ip_updated payload">
          {c.out("{")}{"\n"}
          {"  "}{c.key('"event"')}{c.out(":     ")}{c.str('"host.ip_updated"')}{c.out(",")}{"\n"}
          {"  "}{c.key('"host"')}{c.out(":      ")}{c.str('"home.novaip.link"')}{c.out(",")}{"\n"}
          {"  "}{c.key('"ipv4"')}{c.out(":      ")}{c.str('"203.0.113.42"')}{c.out(",")}{"\n"}
          {"  "}{c.key('"ipv6"')}{c.out(":      ")}{c.str('"2001:db8::1"')}{c.out(",")}{"\n"}
          {"  "}{c.key('"timestamp"')}{c.out(": ")}{c.str('"2024-01-15T10:30:00Z"')}{"\n"}
          {c.out("}")}
        </CodeBlock>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Fields that do not apply to the current state are <InlineCode>null</InlineCode> — for
          example, <InlineCode>ipv6</InlineCode> is <InlineCode>null</InlineCode> when the host
          has no IPv6 address recorded.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          The <InlineCode>timestamp</InlineCode> is always UTC in ISO 8601 format. Use it to
          detect out-of-order or duplicate deliveries when idempotency matters.
        </p>
      </div>

      <SectionDivider />

      {/* Verifying signatures */}
      <div id="verifying-signatures">
        <h2 className="text-base font-semibold mt-8 mb-3">Verifying signatures</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Every request includes an <InlineCode>X-NovaDNS-Signature</InlineCode> header containing
          an HMAC-SHA256 hex digest of the raw request body, signed with your webhook&apos;s secret.
          Always verify this signature before processing the payload to ensure the request
          genuinely came from NovaDNS and has not been tampered with.
        </p>

        <CodeBlock filename="webhook-handler.js" label="Node.js — Express">
          {c.kw("import")}{c.plain(" crypto ")}{c.kw("from")}{c.plain(" ")}{c.str('"node:crypto"')}{"\n"}
          {"\n"}
          {c.dim("// Use a raw body parser — signature is over the raw bytes")}{"\n"}
          {c.plain("app.")}{c.kw("post")}{c.plain("(")}{c.str('"/webhook"')}{c.plain(", express.raw({ type: ")}{c.str('"application/json"')}{c.plain(" }), (req, res) => {")}{"\n"}
          {c.plain("  ")}{c.kw("const")}{c.plain(" secret    = process.env.")}{c.key("NOVADNS_WEBHOOK_SECRET")}{"\n"}
          {c.plain("  ")}{c.kw("const")}{c.plain(" signature = req.headers[")}{c.str('"x-novadns-signature"')}{c.plain("]")}{"\n"}
          {"\n"}
          {c.plain("  ")}{c.kw("const")}{c.plain(" expected  = crypto")}{"\n"}
          {c.plain("    .")}{c.kw("createHmac")}{c.plain("(")}{c.str('"sha256"')}{c.plain(", secret)")}{"\n"}
          {c.plain("    .")}{c.kw("update")}{c.plain("(req.body)")}{"\n"}
          {c.plain("    .")}{c.kw("digest")}{c.plain("(")}{c.str('"hex"')}{c.plain(")")}{"\n"}
          {"\n"}
          {c.plain("  ")}{c.kw("if")}{c.plain(" (!crypto.")}{c.kw("timingSafeEqual")}{c.plain("(")}{"\n"}
          {c.plain("    Buffer.")}{c.kw("from")}{c.plain("(expected),")}{"\n"}
          {c.plain("    Buffer.")}{c.kw("from")}{c.plain("(signature)")}{"\n"}
          {c.plain("  )) {")}{"\n"}
          {c.plain("    ")}{c.kw("return")}{c.plain(" res.")}{c.kw("status")}{c.plain("(")}{c.str("401")}{c.plain(").")}{c.kw("send")}{c.plain("(")}{c.str('"Invalid signature"')}{c.plain(")")}{"\n"}
          {c.plain("  }")}{"\n"}
          {"\n"}
          {c.plain("  ")}{c.kw("const")}{c.plain(" payload = JSON.")}{c.kw("parse")}{c.plain("(req.body)")}{"\n"}
          {c.plain("  ")}{c.dim("// handle payload.event …")}{"\n"}
          {c.plain("  res.")}{c.kw("status")}{c.plain("(")}{c.str("200")}{c.plain(").")}{c.kw("send")}{c.plain("()")}{"\n"}
          {c.plain("})")}{"\n"}
        </CodeBlock>

        <div className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 p-4 my-5 text-sm text-blue-900 dark:text-blue-200">
          Always use <strong>crypto.timingSafeEqual</strong> (or your language&apos;s equivalent) for the
          comparison. A regular string equality check is vulnerable to timing attacks.
        </div>
      </div>

      <SectionDivider />

      {/* Security tips */}
      <div id="security-tips">
        <h2 className="text-base font-semibold mt-8 mb-3">Security tips</h2>
        <ul className="space-y-1.5 my-4 text-sm text-muted-foreground list-disc list-inside">
          <li>Always verify the <InlineCode>X-NovaDNS-Signature</InlineCode> header before trusting the payload.</li>
          <li>Only accept deliveries over HTTPS — never plain HTTP endpoints.</li>
          <li>Rotate your webhook secret periodically from the webhook settings page; NovaDNS immediately begins signing with the new secret.</li>
          <li>Respond with a 2xx status as quickly as possible — do heavy processing asynchronously to avoid delivery timeouts.</li>
          <li>Use the <InlineCode>timestamp</InlineCode> field to deduplicate retried deliveries if your handler is not idempotent.</li>
          <li>Restrict your endpoint to NovaDNS IP ranges if your infrastructure supports allowlisting (ranges published at <InlineCode>novadns.io/ips</InlineCode>).</li>
        </ul>
      </div>

      <SectionDivider />

      {/* Team webhooks */}
      <div id="team-webhooks">
        <h2 className="text-base font-semibold mt-8 mb-3">Team webhooks</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Webhooks are scoped to a workspace — personal webhooks fire only for hosts in your
          personal workspace, and team webhooks fire only for hosts belonging to that team.
          When you switch workspaces in the dashboard, the Webhooks section shows only the
          webhooks for the active workspace.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Within a team, only members with the <strong className="text-foreground">Owner</strong> or{" "}
          <strong className="text-foreground">Admin</strong> role can create, edit, or delete webhooks.
          Members with the Member role can view registered webhook endpoints but cannot modify them.
        </p>
        <div className="border border-border divide-y divide-border">
          {[
            { role: "Owner", access: "Full access — create, edit, delete, view secret." },
            { role: "Admin", access: "Full access — create, edit, delete, view secret." },
            { role: "Member", access: "Read-only — can view endpoint URLs but not secrets." },
          ].map(({ role, access }) => (
            <div key={role} className="grid grid-cols-[100px_1fr] items-start px-4 py-3 gap-4">
              <span className="text-xs font-mono font-semibold text-foreground">{role}</span>
              <span className="text-xs text-muted-foreground leading-relaxed">{access}</span>
            </div>
          ))}
        </div>
      </div>

      <PageNav />
    </div>
  )
}
