// Server Component
import type { Metadata } from "next"
import { CodeBlock, c } from "../_components/code-block"
import { PageNav } from "../_components/page-nav"

export const metadata: Metadata = {
  title: "Security — NovaDNS Docs",
  description: "Security best practices for NovaDNS: token rotation, HTTPS enforcement, HMAC webhook verification, and credential management.",
  openGraph: {
    title: "Security — NovaDNS Docs",
    description: "Security best practices for NovaDNS: token rotation, HTTPS enforcement, HMAC webhook verification, and credential management.",
    type: "article",
    url: "https://novadns.io/docs/security",
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

export default function SecurityPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-widest text-primary mb-3">Guides</p>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Security</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Best practices for keeping your NovaDNS account, hosts, and integrations secure.
          Most incidents are caused by leaked tokens or overly broad team permissions — both
          are straightforward to prevent.
        </p>
      </div>

      {/* ── Token security ────────────────────────────────────────── */}
      <div id="token-security">
        <h2 className="text-base font-semibold mt-8 mb-3">Token security</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Each host has a 64-character update token that grants anyone who holds it the ability to
          update that host's IP address. Treat tokens with the same care you would a password.
        </p>

        <ul className="space-y-1.5 my-4 text-sm text-muted-foreground list-disc list-inside">
          <li>Never commit tokens to source control — use environment variables or a secrets manager instead.</li>
          <li>Never share tokens in public forums, chat rooms, or screenshots.</li>
          <li>Use one host (and therefore one token) per device or location, so you can rotate individually.</li>
          <li>If you suspect a token has been exposed, regenerate it immediately from the dashboard.</li>
        </ul>

        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          The recommended pattern for scripts and containers is to read the token from an environment
          variable rather than hard-coding it in the command or config file:
        </p>

        <CodeBlock filename="shell" label="safe usage">
          {c.dim("# Set once in your shell profile or .env file (never commit this file)")}{"\n"}
          {c.key("export")}{c.plain(" ")}{c.key("NOVA_TOKEN")}{c.plain("=")}{c.str("your-64-char-token-here")}{"\n"}
          {"\n"}
          {c.dim("# Reference it in the update command — the token never appears in scripts")}{"\n"}
          {c.prompt("$ ")}{c.kw("curl")}{c.plain(" -s ")}{c.str('"https://novadns.io/api/update?token=')}{c.plain("$NOVA_TOKEN")}{c.str('"')}
        </CodeBlock>

        <div className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4 my-5 text-sm text-amber-900 dark:text-amber-200">
          Shell history, process lists, and container inspect commands can all expose tokens that
          are passed as literal strings. Using environment variables prevents this.
        </div>
      </div>

      <SectionDivider />

      {/* ── Credential rotation ───────────────────────────────────── */}
      <div id="credential-rotation">
        <h2 className="text-base font-semibold mt-8 mb-3">Credential rotation</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          You can regenerate a host token at any time from the dashboard. Navigate to your host,
          open <InlineCode>Host Settings</InlineCode>, and click{" "}
          <InlineCode>Regenerate Token</InlineCode>. The old token is invalidated immediately.
        </p>

        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Plan your rotation to minimise downtime:
        </p>

        <ul className="space-y-1.5 my-4 text-sm text-muted-foreground list-disc list-inside">
          <li>Generate the new token in the dashboard but do not save yet.</li>
          <li>Update the token in every client that uses the host (router, script, container).</li>
          <li>Confirm all clients are configured, then click Save to invalidate the old token.</li>
          <li>Check the update log in the dashboard to confirm a successful update with the new token.</li>
        </ul>

        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Your account password can be changed under{" "}
          <InlineCode>Settings → Account → Change Password</InlineCode>. Changing your password does
          not affect host tokens — they are independent credentials.
        </p>

        <div className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 p-4 my-5 text-sm text-blue-900 dark:text-blue-200">
          We recommend rotating tokens at least once a year, or immediately after any personnel change
          that involved someone having access to the token.
        </div>
      </div>

      <SectionDivider />

      {/* ── MFA ───────────────────────────────────────────────────── */}
      <div id="mfa">
        <h2 className="text-base font-semibold mt-8 mb-3">Multi-factor authentication</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          NovaDNS supports TOTP-based multi-factor authentication (Google Authenticator, Authy,
          1Password, Bitwarden, and any standard TOTP app). Enabling MFA protects your account even
          if your password is compromised.
        </p>

        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          To enable MFA, navigate to <InlineCode>Settings → Security → Two-factor authentication</InlineCode>{" "}
          and follow these steps:
        </p>

        <ul className="space-y-1.5 my-4 text-sm text-muted-foreground list-disc list-inside">
          <li>Scan the QR code with your authenticator app, or enter the manual setup key.</li>
          <li>Enter the 6-digit code from your app to verify the setup is working.</li>
          <li>Save your backup codes somewhere secure — they are single-use codes for account recovery.</li>
          <li>Click Enable to activate MFA on your account.</li>
        </ul>

        <div className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4 my-5 text-sm text-amber-900 dark:text-amber-200">
          Store your backup codes offline — in a password manager or printed in a secure location.
          If you lose access to your authenticator app and have no backup codes, account recovery
          requires identity verification and takes time.
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Google and Microsoft OAuth logins delegate MFA enforcement to those providers. If you sign
          in via OAuth, enable MFA at the provider level for equivalent protection.
        </p>
      </div>

      <SectionDivider />

      {/* ── Webhook secrets ───────────────────────────────────────── */}
      <div id="webhook-secrets">
        <h2 className="text-base font-semibold mt-8 mb-3">Webhook secrets</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Every webhook delivery is signed with an HMAC-SHA256 signature over the request body,
          using your webhook's signing secret. The signature is sent in the{" "}
          <InlineCode>X-NovaDNS-Signature</InlineCode> header.
        </p>

        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          Always verify the signature before processing a webhook event. A minimal verification
          looks like this:
        </p>

        <CodeBlock filename="server.ts" label="HMAC verification">
          {c.kw("import")}{c.plain(" { createHmac } ")}{c.kw("from")}{c.plain(" ")}{c.str('"crypto"')}{"\n"}
          {"\n"}
          {c.kw("function")}{c.plain(" ")}{c.key("verifySignature")}{c.plain("(")}{"\n"}
          {c.plain("  ")}{c.key("body")}{c.plain(": string,")}{"\n"}
          {c.plain("  ")}{c.key("secret")}{c.plain(": string,")}{"\n"}
          {c.plain("  ")}{c.key("signature")}{c.plain(": string")}{"\n"}
          {c.plain(") {")}{"\n"}
          {c.plain("  ")}{c.kw("const")}{c.plain(" ")}{c.key("expected")}{c.plain(" = ")}{c.str('"sha256="')}{c.plain(" + createHmac(")}{c.str('"sha256"')}{c.plain(", secret)")}{"\n"}
          {c.plain("    .update(body).digest(")}{c.str('"hex"')}{c.plain(")")}{"\n"}
          {c.plain("  ")}{c.kw("return")}{c.plain(" ")}{c.key("expected")}{c.plain(" === ")}{c.key("signature")}{"\n"}
          {c.plain("}")}
        </CodeBlock>

        <p className="text-sm text-muted-foreground leading-relaxed mb-4 mt-2">
          Rotate webhook secrets periodically, or immediately after a potential exposure. To rotate,
          go to <InlineCode>Settings → Webhooks</InlineCode>, select the webhook, and click{" "}
          <InlineCode>Regenerate Secret</InlineCode>. Update your server with the new secret before
          saving to avoid a gap in verification.
        </p>

        <ul className="space-y-1.5 my-4 text-sm text-muted-foreground list-disc list-inside">
          <li>Always reject requests where the signature is missing or does not match.</li>
          <li>Use a timing-safe comparison function (e.g. <InlineCode>crypto.timingSafeEqual</InlineCode>) to prevent timing attacks.</li>
          <li>Never log the raw signature header alongside the secret.</li>
        </ul>
      </div>

      <SectionDivider />

      {/* ── HTTPS only ────────────────────────────────────────────── */}
      <div id="https">
        <h2 className="text-base font-semibold mt-8 mb-3">HTTPS only</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          All NovaDNS endpoints — including the update API and the DynDNS-compatible endpoint —
          require HTTPS. Plain HTTP requests are rejected to prevent tokens from being transmitted
          in cleartext.
        </p>

        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Ensure your client is configured to use HTTPS:
        </p>

        <CodeBlock filename="shell" label="correct">
          {c.prompt("$ ")}{c.kw("curl")}{c.plain(" ")}{c.str('"https://novadns.io/api/update?token=YOUR_TOKEN"')}
        </CodeBlock>

        <CodeBlock filename="shell" label="will be rejected">
          {c.dim("# HTTP is not accepted")}{"\n"}
          {c.prompt("$ ")}{c.kw("curl")}{c.plain(" ")}{c.str('"http://novadns.io/api/update?token=YOUR_TOKEN"')}
        </CodeBlock>

        <p className="text-sm text-muted-foreground leading-relaxed mb-4 mt-2">
          If your router or embedded device cannot verify TLS certificates (common on older firmware),
          check for an option to install updated CA certificates rather than disabling certificate
          verification — sending tokens over an unverified TLS connection negates the security benefit.
        </p>
      </div>

      <SectionDivider />

      {/* ── Team access control ───────────────────────────────────── */}
      <div id="team-access">
        <h2 className="text-base font-semibold mt-8 mb-3">Team access control</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          NovaDNS teams use role-based access control with three levels:
        </p>

        <div className="border border-border divide-y divide-border my-4">
          {[
            {
              role: "Owner",
              desc: "Full control: billing, team settings, member management, and all hosts. One owner per team.",
            },
            {
              role: "Admin",
              desc: "Can manage hosts, groups, webhooks, and team members. Cannot change billing or transfer ownership.",
            },
            {
              role: "Member",
              desc: "Read access to hosts and update logs. Cannot create or delete hosts or manage members.",
            },
          ].map(({ role, desc }) => (
            <div key={role} className="grid sm:grid-cols-[100px_1fr] items-start gap-4 px-4 py-3.5">
              <span className="text-xs font-mono font-semibold text-foreground">{role}</span>
              <span className="text-xs text-muted-foreground leading-relaxed">{desc}</span>
            </div>
          ))}
        </div>

        <ul className="space-y-1.5 my-4 text-sm text-muted-foreground list-disc list-inside">
          <li>Assign the minimum role required for each member's function.</li>
          <li>Remove members promptly when they leave the organisation — go to <InlineCode>Settings → Team → Members</InlineCode> and click <InlineCode>Remove</InlineCode>.</li>
          <li>Revoked members immediately lose access; any host tokens they configured will still work until rotated.</li>
          <li>After removing a member who had Admin access, audit your host tokens and rotate any they could have copied.</li>
        </ul>
      </div>

      <SectionDivider />

      {/* ── Monitoring ────────────────────────────────────────────── */}
      <div id="monitoring">
        <h2 className="text-base font-semibold mt-8 mb-3">Monitoring</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          The update log records every IP change received for each host, including the timestamp,
          source IP of the request, and the new address that was set. Reviewing this log helps you
          detect unexpected or unauthorised changes.
        </p>

        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Signs that warrant investigation:
        </p>

        <ul className="space-y-1.5 my-4 text-sm text-muted-foreground list-disc list-inside">
          <li>Updates arriving from a source IP you do not recognise (could indicate a leaked token being used by a third party).</li>
          <li>Unusually frequent updates — legitimate clients update every few minutes at most.</li>
          <li>IP changes at unexpected times, such as in the middle of the night when the device should be idle.</li>
          <li>Multiple different IPs being set in a short window, which may indicate a misconfigured client or a replay attack.</li>
        </ul>

        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Access the update log by opening a host in the dashboard and selecting the{" "}
          <InlineCode>Update Log</InlineCode> tab. If you observe suspicious activity, rotate the
          host token immediately and investigate the source.
        </p>

        <div className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 p-4 my-5 text-sm text-blue-900 dark:text-blue-200">
          Configure a webhook on your team to receive real-time notifications whenever a host IP
          changes. This lets you pipe events into a logging system, alerting tool, or Slack channel
          without polling the dashboard.
        </div>
      </div>

      <PageNav />
    </div>
  )
}
