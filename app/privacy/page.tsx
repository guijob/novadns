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

function Li({ children }: { children: React.ReactNode }) {
  return <li className="text-sm text-muted-foreground leading-relaxed">{children}</li>
}

const SECTIONS = [
  "Who We Are",
  "What Data We Collect",
  "How We Use Your Data",
  "Legal Bases for Processing",
  "Data Sharing",
  "Payments",
  "Data Retention",
  "Your Rights",
  "Cookies",
  "Children's Privacy",
  "Changes to This Policy",
  "Contact",
]

export default function PrivacyPage() {
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
            <span className="text-foreground font-medium">Privacy</span>
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
            <h1 className="text-2xl font-bold tracking-tight mb-2">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground mb-8">Effective date: {EFFECTIVE_DATE}</p>

            <div className="border border-border px-4 py-3 bg-muted/20 mb-8">
              <p className="text-xs text-muted-foreground leading-relaxed">
                This Privacy Policy explains what personal data {COMPANY} collects, why we collect
                it, and how you can exercise your rights. We are committed to handling your data
                responsibly and transparently.
              </p>
            </div>

            {/* 1 */}
            <H2 id="s1">1. Who We Are</H2>
            <P>
              {COMPANY} operates the dynamic DNS service available at {BASE_URL}. For the purposes
              of data protection law, {COMPANY} is the data controller responsible for your
              personal data.
            </P>
            <P>
              You can reach us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-foreground underline underline-offset-4 hover:text-primary transition-colors">
                {CONTACT_EMAIL}
              </a>{" "}
              for any privacy-related enquiries.
            </P>

            {/* 2 */}
            <H2 id="s2">2. What Data We Collect</H2>
            <P>We collect the following categories of personal data:</P>
            <ul className="list-disc list-inside space-y-1.5 mb-3 pl-1">
              <Li>
                <strong className="text-foreground font-medium">Account data</strong> — name,
                email address, and hashed password when you register.
              </Li>
              <Li>
                <strong className="text-foreground font-medium">Billing data</strong> — Paddle
                customer ID and subscription ID. We do not store card numbers or full payment
                details; these are handled directly by Paddle.
              </Li>
              <Li>
                <strong className="text-foreground font-medium">Host & DNS data</strong> —
                subdomain names, IPv4/IPv6 addresses you send us, TTL settings, and update
                timestamps.
              </Li>
              <Li>
                <strong className="text-foreground font-medium">Usage data</strong> — IP addresses
                of update requests, timestamps, and HTTP user-agent strings, used for rate limiting
                and abuse prevention.
              </Li>
              <Li>
                <strong className="text-foreground font-medium">Communication data</strong> —
                any information you provide when contacting support.
              </Li>
            </ul>
            <P>
              We do not collect sensitive personal data (e.g. health information, racial or ethnic
              origin) and we do not sell your data to third parties.
            </P>

            {/* 3 */}
            <H2 id="s3">3. How We Use Your Data</H2>
            <P>We use your data to:</P>
            <ul className="list-disc list-inside space-y-1.5 mb-3 pl-1">
              <Li>Provide and maintain the DNS service, including processing update requests.</Li>
              <Li>Manage your account, authenticate you, and reset your password.</Li>
              <Li>Process payments and manage your subscription via Paddle.</Li>
              <Li>Send transactional emails (password resets, billing receipts).</Li>
              <Li>Detect and prevent abuse, fraud, and violations of our Terms of Service.</Li>
              <Li>Comply with legal obligations.</Li>
            </ul>
            <P>
              We do not use your data for advertising or sell it to data brokers.
            </P>

            {/* 4 */}
            <H2 id="s4">4. Legal Bases for Processing</H2>
            <P>
              Where data protection law requires a legal basis, we rely on the following:
            </P>
            <ul className="list-disc list-inside space-y-1.5 mb-3 pl-1">
              <Li>
                <strong className="text-foreground font-medium">Contract</strong> — processing
                necessary to provide the Service you have signed up for.
              </Li>
              <Li>
                <strong className="text-foreground font-medium">Legitimate interests</strong> —
                security monitoring, abuse prevention, and product improvement, where these do not
                override your rights.
              </Li>
              <Li>
                <strong className="text-foreground font-medium">Legal obligation</strong> —
                compliance with applicable laws and regulations.
              </Li>
              <Li>
                <strong className="text-foreground font-medium">Consent</strong> — where we
                explicitly ask for it (e.g. optional marketing emails).
              </Li>
            </ul>

            {/* 5 */}
            <H2 id="s5">5. Data Sharing</H2>
            <P>
              We share your data only where necessary:
            </P>
            <ul className="list-disc list-inside space-y-1.5 mb-3 pl-1">
              <Li>
                <strong className="text-foreground font-medium">Paddle</strong> — our payment
                processor and Merchant of Record. Paddle processes billing information under their
                own privacy policy.
              </Li>
              <Li>
                <strong className="text-foreground font-medium">Cloud infrastructure</strong> —
                our hosting and database providers process data on our behalf under data processing
                agreements.
              </Li>
              <Li>
                <strong className="text-foreground font-medium">AWS Route 53</strong> — DNS
                record updates are written to Amazon Web Services. Subdomain names and IP addresses
                are transmitted for this purpose.
              </Li>
              <Li>
                <strong className="text-foreground font-medium">Legal requirements</strong> — we
                may disclose data if required by law, court order, or to protect the rights and
                safety of {COMPANY} or others.
              </Li>
            </ul>
            <P>
              We do not transfer your personal data outside your region without appropriate
              safeguards (e.g. Standard Contractual Clauses).
            </P>

            {/* 6 */}
            <H2 id="s6">6. Payments</H2>
            <P>
              All payment processing is handled by Paddle, who acts as the Merchant of Record for
              transactions on {BASE_URL}. {COMPANY} does not receive or store your full credit
              card number, CVV, or bank account details. We only store the Paddle customer ID and
              subscription ID needed to manage your account status.
            </P>
            <P>
              For more information on how Paddle processes your payment data, please see{" "}
              <a
                href="https://www.paddle.com/legal/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline underline-offset-4 hover:text-primary transition-colors"
              >
                Paddle&rsquo;s Privacy Policy
              </a>
              .
            </P>

            {/* 7 */}
            <H2 id="s7">7. Data Retention</H2>
            <P>
              We retain your personal data for as long as your account is active or as needed to
              provide the Service. Specifically:
            </P>
            <ul className="list-disc list-inside space-y-1.5 mb-3 pl-1">
              <Li>Account data is kept until you delete your account.</Li>
              <Li>
                DNS update logs (IP addresses, timestamps) are retained for up to 90 days for
                abuse prevention and debugging.
              </Li>
              <Li>
                Billing records may be retained for up to 7 years to comply with financial
                regulations.
              </Li>
            </ul>
            <P>
              When you delete your account, we will permanently erase your personal data within
              30 days, except where retention is required by law.
            </P>

            {/* 8 */}
            <H2 id="s8">8. Your Rights</H2>
            <P>
              Depending on your location, you may have the following rights regarding your personal
              data:
            </P>
            <ul className="list-disc list-inside space-y-1.5 mb-3 pl-1">
              <Li><strong className="text-foreground font-medium">Access</strong> — request a copy of the data we hold about you.</Li>
              <Li><strong className="text-foreground font-medium">Rectification</strong> — ask us to correct inaccurate or incomplete data.</Li>
              <Li><strong className="text-foreground font-medium">Erasure</strong> — request deletion of your data (subject to legal obligations).</Li>
              <Li><strong className="text-foreground font-medium">Restriction</strong> — ask us to limit how we process your data.</Li>
              <Li><strong className="text-foreground font-medium">Portability</strong> — receive your data in a structured, machine-readable format.</Li>
              <Li><strong className="text-foreground font-medium">Objection</strong> — object to processing based on legitimate interests.</Li>
              <Li><strong className="text-foreground font-medium">Withdraw consent</strong> — where processing is based on consent, withdraw it at any time.</Li>
            </ul>
            <P>
              To exercise any of these rights, email us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-foreground underline underline-offset-4 hover:text-primary transition-colors">
                {CONTACT_EMAIL}
              </a>
              . We will respond within 30 days. You also have the right to lodge a complaint with
              your local data protection authority.
            </P>

            {/* 9 */}
            <H2 id="s9">9. Cookies</H2>
            <P>
              We use a single session cookie (<code className="font-mono text-xs bg-muted px-1 py-0.5 border border-border">nova_session</code>) to keep you logged in. This cookie is
              strictly necessary for the Service to function and does not track you across other
              websites.
            </P>
            <P>
              We do not use third-party advertising cookies or cross-site tracking. If you use our
              analytics (Vercel Analytics), aggregate, anonymized page-view data may be collected
              without using cookies. For full details, see our{" "}
              <Link href="/cookies" className="text-foreground underline underline-offset-4 hover:text-primary transition-colors">
                Cookie Policy
              </Link>
              .
            </P>

            {/* 10 */}
            <H2 id="s10">10. Children&rsquo;s Privacy</H2>
            <P>
              The Service is not directed at children under the age of 13 (or 16 in the EU). We do
              not knowingly collect personal data from children. If you believe a child has
              provided us with personal data, please contact us and we will delete it promptly.
            </P>

            {/* 11 */}
            <H2 id="s11">11. Changes to This Policy</H2>
            <P>
              We may update this Privacy Policy from time to time. When we make material changes,
              we will update the effective date at the top of this page and, where appropriate,
              notify you by email. We encourage you to review this page periodically.
            </P>

            {/* 12 */}
            <H2 id="s12">12. Contact</H2>
            <P>
              For any questions, concerns, or requests regarding this Privacy Policy or your
              personal data, please contact us at:{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-foreground underline underline-offset-4 hover:text-primary transition-colors"
              >
                {CONTACT_EMAIL}
              </a>
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
