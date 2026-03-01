// Server Component
import { CodeBlock, c } from "../_components/code-block"
import { PageNav } from "../_components/page-nav"

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

function Method({ method, path, desc }: { method: string; path: string; desc: string }) {
  return (
    <div className="border border-border">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/20">
        <span className="text-xs font-mono font-bold text-primary">{method}</span>
        <code className="text-xs font-mono text-foreground">{path}</code>
      </div>
      <p className="px-4 py-3 text-sm text-muted-foreground">{desc}</p>
    </div>
  )
}

export default function ApiPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-widest text-primary mb-3">Reference</p>
        <h1 className="text-2xl font-bold tracking-tight mb-2">API Reference</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          NovaDNS exposes two update endpoints: a native token-based API and a DynDNS-compatible
          endpoint for legacy clients and firmware.
        </p>
      </div>

      {/* Authentication */}
      <div id="authentication">
        <h2 className="text-base font-semibold mb-3">Authentication</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Two authentication methods are supported. Both are equivalent in capability.
        </p>
        <div className="border border-border divide-y divide-border">
          <div className="grid sm:grid-cols-[140px_1fr] gap-4 px-4 py-4">
            <div>
              <span className="text-xs font-mono font-semibold text-foreground">Token</span>
              <p className="text-xs text-muted-foreground mt-1">Recommended</p>
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed">
              Pass your 64-character host token as the <InlineCode>token</InlineCode> query parameter.
              Each host has its own token, rotatable from the dashboard at any time.
            </div>
          </div>
          <div className="grid sm:grid-cols-[140px_1fr] gap-4 px-4 py-4">
            <div>
              <span className="text-xs font-mono font-semibold text-foreground">Basic Auth</span>
              <p className="text-xs text-muted-foreground mt-1">Legacy compat</p>
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed">
              Use HTTP Basic Auth with your account email as the username and the host token as
              the password. Required by most routers and NAS firmware using the DynDNS protocol.
            </div>
          </div>
        </div>
      </div>

      <SectionDivider />

      {/* Endpoints */}
      <div id="endpoints">
        <h2 className="text-base font-semibold mb-3">Endpoints</h2>
        <div className="space-y-4">
          <div>
            <Method
              method="GET / POST"
              path="/api/update"
              desc="Native token-based endpoint. Detects your public IP automatically from the incoming request. Optionally accepts an explicit IP via the myip parameter."
            />
            <CodeBlock filename="curl" label="token auth">
              {c.prompt("$ ")}{c.kw("curl")}{c.plain(" ")}{c.str('"https://novadns.io/api/update?token=')}{c.url("YOUR_TOKEN")}{c.str('"')}
            </CodeBlock>
          </div>

          <div>
            <Method
              method="GET"
              path="/nic/update"
              desc="DynDNS-compatible endpoint. Accepts Basic Auth (email:token) and the standard hostname and myip query parameters. Returns a DynDNS-style response string."
            />
            <CodeBlock filename="curl" label="basic auth — DynDNS compat">
              {c.prompt("$ ")}{c.kw("curl")}{c.plain(" \\\n")
              }{c.plain("  ")}{c.str('"https://')}{c.url("email%40example.com")}{c.str(":")}{c.url("YOUR_TOKEN")}{c.str("@novadns.io/nic/update")}{c.plain(" \\\n")
              }{c.plain("  ")}{c.flag("?hostname=")}{c.str("home.novadns.io")}{c.flag("&myip=")}{c.str("203.0.113.42")}{c.str('"')}
            </CodeBlock>
          </div>
        </div>
      </div>

      <SectionDivider />

      {/* Parameters */}
      <div id="parameters">
        <h2 className="text-base font-semibold mb-3">Parameters</h2>
        <div className="border border-border">
          <div className="grid grid-cols-[1fr_80px_1fr] text-xs font-mono uppercase tracking-wide text-muted-foreground bg-muted/30 border-b border-border px-4 py-2">
            <span>Parameter</span>
            <span>Required</span>
            <span>Description</span>
          </div>
          {[
            {
              param:    "token",
              required: true,
              desc:     "Your 64-character host update token. Required for /api/update.",
            },
            {
              param:    "hostname",
              required: false,
              desc:     "The full hostname to update (e.g. home.novadns.io). Required for /nic/update.",
            },
            {
              param:    "myip",
              required: false,
              desc:     "Explicit IP address or CIDR prefix (IPv4 or IPv6). Auto-detected from request if omitted.",
            },
          ].map(({ param, required, desc }) => (
            <div key={param} className="grid grid-cols-[1fr_80px_1fr] items-start gap-4 px-4 py-3.5 border-t border-border first:border-t-0">
              <code className="text-xs font-mono text-foreground">{param}</code>
              <span className={`text-xs font-mono ${required ? "text-primary" : "text-muted-foreground"}`}>
                {required ? "yes" : "no"}
              </span>
              <span className="text-xs text-muted-foreground leading-relaxed">{desc}</span>
            </div>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* Responses */}
      <div id="responses">
        <h2 className="text-base font-semibold mb-3">Responses</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-1">
          The native endpoint returns JSON. The DynDNS endpoint returns a plain-text string.
        </p>

        <CodeBlock filename="GET /api/update" label="200 OK — JSON">
          {c.out("{")}{"\n"}
          {"  "}{c.key('"ipv4"')}{c.out(": ")}{c.str('"203.0.113.42"')}{c.out(",")}{"\n"}
          {"  "}{c.key('"ipv6"')}{c.out(": ")}{c.str('"2001:db8::1"')}{"\n"}
          {c.out("}")}
        </CodeBlock>

        <CodeBlock filename="GET /nic/update" label="200 OK — DynDNS">
          {c.out("good 203.0.113.42")}
        </CodeBlock>

        <p className="text-sm text-muted-foreground leading-relaxed mt-2">
          If only IPv4 is detected, <InlineCode>ipv6</InlineCode> is <InlineCode>null</InlineCode>.
          If only IPv6 is detected, <InlineCode>ipv4</InlineCode> is <InlineCode>null</InlineCode>.
        </p>
      </div>

      <SectionDivider />

      {/* Error codes */}
      <div id="errors">
        <h2 className="text-base font-semibold mb-3">Error codes</h2>
        <div className="border border-border">
          {[
            { code: "400", title: "Bad Request",       desc: "Missing required parameters, or the myip value is malformed." },
            { code: "401", title: "Unauthorized",      desc: "Invalid or missing token. Check your token and that it belongs to the correct host." },
            { code: "404", title: "Host not found",    desc: "No host matches the provided token or hostname." },
            { code: "429", title: "Rate limited",      desc: "Too many requests in a short window. Back off and retry." },
            { code: "500", title: "Internal error",    desc: "Something went wrong on our end. Check status.novadns.io." },
          ].map(({ code, title, desc }) => (
            <div key={code} className="grid grid-cols-[72px_1fr] items-start border-t border-border first:border-t-0">
              <div className="px-4 py-3.5 border-r border-border">
                <span className="text-xs font-mono text-foreground">{code}</span>
              </div>
              <div className="px-4 py-3.5">
                <span className="text-xs font-medium text-foreground block mb-0.5">{title}</span>
                <span className="text-xs text-muted-foreground leading-relaxed">{desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <PageNav
        prev={{ href: "/docs/getting-started", label: "Quick Start"    }}
        next={{ href: "/docs/ipv6",             label: "IPv6 & Subnets" }}
      />
    </div>
  )
}
