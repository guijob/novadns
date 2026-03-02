import Link from "next/link"
import { Button } from "@/components/ui/button"

const EFFECTIVE_DATE = "1 June 2025"
const COMPANY        = "NovaDNS"
const CONTACT_EMAIL  = "support@novadns.io"
const BASE_URL       = "novadns.io"

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-base font-semibold tracking-tight mt-10 mb-3 scroll-mt-16">
      {children}
    </h2>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground leading-relaxed mb-3">{children}</p>
}

const SECTIONS = [
  "What Are Cookies",
  "Cookies We Use",
  "Third-Party Cookies",
  "What We Do Not Do",
  "Managing Cookies",
  "Changes to This Policy",
  "Contact",
]

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">

      {/* ── Nav ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 h-12 border-b border-border bg-background/80 backdrop-blur-md flex items-center shrink-0">
        <div className="w-full px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              NovaDNS
            </Link>
            <span className="text-border select-none">/</span>
            <span className="text-foreground font-medium">Cookie Policy</span>
          </div>
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/" />}>
            Back to site
          </Button>
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────────── */}
      <div className="flex flex-1">

        {/* TOC sidebar */}
        <aside className="hidden lg:block w-56 shrink-0 border-r border-border">
          <div className="sticky top-12 pt-6 pb-10 px-4 overflow-y-auto max-h-[calc(100vh-3rem)]">
            <p className="text-[0.65rem] font-mono uppercase tracking-widest text-muted-foreground mb-4">
              Contents
            </p>
            <nav className="space-y-1.5">
              {SECTIONS.map((label, i) => (
                <a
                  key={label}
                  href={`#s${i + 1}`}
                  className="flex items-baseline gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="font-mono text-[0.6rem] text-muted-foreground/50 shrink-0 w-4">
                    {i + 1}.
                  </span>
                  {label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0 px-8 py-10 lg:px-12">
          <div className="max-w-2xl">

            <p className="text-xs font-mono uppercase tracking-widest text-primary mb-3">Legal</p>
            <h1 className="text-2xl font-bold tracking-tight mb-2">Cookie Policy</h1>
            <p className="text-sm text-muted-foreground mb-8">Effective date: {EFFECTIVE_DATE}</p>

            <div className="border border-border px-4 py-3 bg-muted/20 mb-8">
              <p className="text-xs text-muted-foreground leading-relaxed">
                This Cookie Policy explains what cookies {COMPANY} uses on {BASE_URL}, why we use
                them, and how you can control them. We keep our use of cookies minimal by design.
              </p>
            </div>

            {/* 1 */}
            <H2 id="s1">1. What Are Cookies</H2>
            <P>
              Cookies are small text files that a website stores on your device when you visit.
              They are widely used to make websites work efficiently, remember your preferences,
              and provide information to site owners.
            </P>
            <P>
              Cookies can be <strong className="text-foreground font-medium">first-party</strong>{" "}
              (set by the website you are visiting) or{" "}
              <strong className="text-foreground font-medium">third-party</strong> (set by a
              different domain). They can be{" "}
              <strong className="text-foreground font-medium">session cookies</strong> (deleted
              when you close your browser) or{" "}
              <strong className="text-foreground font-medium">persistent cookies</strong> (stored
              until they expire or you delete them).
            </P>

            {/* 2 */}
            <H2 id="s2">2. Cookies We Use</H2>
            <P>
              {COMPANY} uses only one first-party cookie:
            </P>

            {/* Cookie table */}
            <div className="border border-border divide-y divide-border mb-4 text-xs">
              <div className="grid grid-cols-[1fr_auto_auto_2fr] gap-x-4 px-3 py-2 bg-muted/30 font-mono uppercase tracking-wide text-[0.6rem] text-muted-foreground">
                <span>Name</span>
                <span>Type</span>
                <span>Duration</span>
                <span>Purpose</span>
              </div>
              <div className="grid grid-cols-[1fr_auto_auto_2fr] gap-x-4 px-3 py-3 items-start">
                <code className="font-mono text-foreground">nova_session</code>
                <span className="text-muted-foreground whitespace-nowrap">1st-party · HTTP-only</span>
                <span className="text-muted-foreground whitespace-nowrap">30 days</span>
                <span className="text-muted-foreground leading-relaxed">
                  Keeps you logged in to the dashboard. Contains a signed JWT token. Set on login,
                  cleared on logout. Marked <code className="font-mono">HttpOnly</code> and{" "}
                  <code className="font-mono">Secure</code> so it is not accessible from JavaScript
                  and is only sent over HTTPS.
                </span>
              </div>
            </div>

            <P>
              This cookie is <strong className="text-foreground font-medium">strictly necessary</strong>{" "}
              for the Service to function. Without it you would be logged out on every page load.
              Because it is strictly necessary, it does not require your prior consent under
              applicable cookie laws.
            </P>

            {/* 3 */}
            <H2 id="s3">3. Third-Party Cookies</H2>
            <P>
              {COMPANY} does not set any third-party tracking or advertising cookies.
            </P>
            <P>
              <strong className="text-foreground font-medium">Paddle (payments)</strong> — when
              you interact with the Paddle checkout overlay on the settings page, Paddle may set
              its own cookies to process your payment and prevent fraud. These are governed by{" "}
              <a
                href="https://www.paddle.com/legal/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline underline-offset-4 hover:text-primary transition-colors"
              >
                Paddle&rsquo;s Cookie Policy
              </a>
              . Paddle cookies are only loaded when you initiate a checkout.
            </P>
            <P>
              <strong className="text-foreground font-medium">Vercel Analytics</strong> — we use
              Vercel&rsquo;s privacy-friendly analytics to understand aggregate page traffic.
              Vercel Analytics does not use cookies and does not track individual users across
              sessions or sites.
            </P>

            {/* 4 */}
            <H2 id="s4">4. What We Do Not Do</H2>
            <P>We do not:</P>
            <ul className="list-disc list-inside space-y-1.5 mb-3 pl-1 text-sm text-muted-foreground leading-relaxed">
              <li>Use cookies for advertising or behavioural tracking.</li>
              <li>Share cookie data with advertisers or data brokers.</li>
              <li>Use fingerprinting or other non-cookie tracking techniques.</li>
              <li>Track you across other websites.</li>
            </ul>

            {/* 5 */}
            <H2 id="s5">5. Managing Cookies</H2>
            <P>
              Because the only cookie {COMPANY} sets is strictly necessary for authentication, we
              do not provide a cookie consent banner — it would serve no purpose. You can always
              log out to have the session cookie cleared immediately, or you can delete it
              manually from your browser.
            </P>
            <P>
              Most browsers allow you to view, block, or delete cookies through their settings.
              Be aware that blocking the{" "}
              <code className="font-mono text-xs bg-muted px-1 py-0.5 border border-border">nova_session</code>{" "}
              cookie will prevent you from staying logged in to the dashboard.
            </P>
            <P>
              Guidance for common browsers:
            </P>
            <ul className="list-disc list-inside space-y-1.5 mb-3 pl-1 text-sm text-muted-foreground">
              <li>
                <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-foreground underline underline-offset-4 hover:text-primary transition-colors">
                  Google Chrome
                </a>
              </li>
              <li>
                <a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" className="text-foreground underline underline-offset-4 hover:text-primary transition-colors">
                  Mozilla Firefox
                </a>
              </li>
              <li>
                <a href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-foreground underline underline-offset-4 hover:text-primary transition-colors">
                  Apple Safari
                </a>
              </li>
              <li>
                <a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-foreground underline underline-offset-4 hover:text-primary transition-colors">
                  Microsoft Edge
                </a>
              </li>
            </ul>

            {/* 6 */}
            <H2 id="s6">6. Changes to This Policy</H2>
            <P>
              We may update this Cookie Policy if we change the cookies we use. Any changes will
              be reflected by updating the effective date at the top of this page. We encourage
              you to review this page periodically.
            </P>

            {/* 7 */}
            <H2 id="s7">7. Contact</H2>
            <P>
              If you have any questions about our use of cookies, please contact us at:{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-foreground underline underline-offset-4 hover:text-primary transition-colors"
              >
                {CONTACT_EMAIL}
              </a>
            </P>
            <P>
              For more information on how we handle your personal data, see our{" "}
              <Link href="/privacy" className="text-foreground underline underline-offset-4 hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              .
            </P>

            <div className="border-t border-border mt-12 pt-6">
              <p className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} {COMPANY} · Last updated {EFFECTIVE_DATE}
              </p>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
