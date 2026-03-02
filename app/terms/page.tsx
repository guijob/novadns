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
  "Acceptance of Terms",
  "The Service",
  "Account Registration",
  "Acceptable Use",
  "Subscription and Billing",
  "Service Availability",
  "Intellectual Property",
  "Disclaimer of Warranties",
  "Limitation of Liability",
  "Termination",
  "Changes to These Terms",
  "Governing Law",
  "Contact",
]

export default function TermsPage() {
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
            <span className="text-foreground font-medium">Terms</span>
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
            <h1 className="text-2xl font-bold tracking-tight mb-2">Terms of Service</h1>
            <p className="text-sm text-muted-foreground mb-8">Effective date: {EFFECTIVE_DATE}</p>

            <div className="border border-border px-4 py-3 bg-muted/20 mb-8">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Please read these Terms of Service carefully before using {COMPANY}. By accessing or
                using the service you agree to be bound by these terms. If you do not agree, do not
                use the service.
              </p>
            </div>

            {/* 1 */}
            <H2 id="s1">1. Acceptance of Terms</H2>
            <P>
              These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement
              between you (&ldquo;User&rdquo; or &ldquo;you&rdquo;) and {COMPANY}
              (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) governing your use of the
              dynamic DNS service available at {BASE_URL} and any associated APIs, documentation,
              and software (collectively, the &ldquo;Service&rdquo;).
            </P>
            <P>
              By creating an account or using the Service in any way, you confirm that you are at
              least 18 years old (or the age of majority in your jurisdiction), have the legal
              capacity to enter into this agreement, and accept these Terms in full.
            </P>

            {/* 2 */}
            <H2 id="s2">2. The Service</H2>
            <P>
              {COMPANY} provides a dynamic DNS (DDNS) hosting service that allows you to associate
              human-readable hostnames under the {BASE_URL} domain with dynamically assigned IP
              addresses. The Service supports the DynDNS/No-IP update protocol and offers
              additional features such as IPv6, host groups, and webhooks depending on your plan.
            </P>
            <P>
              We reserve the right to modify, suspend, or discontinue any feature of the Service
              at any time. We will make reasonable efforts to notify you of significant changes.
            </P>

            {/* 3 */}
            <H2 id="s3">3. Account Registration</H2>
            <P>
              You must register for an account to use the Service. You agree to provide accurate,
              current, and complete information and to keep it up to date. You are responsible for
              maintaining the confidentiality of your credentials and for all activity that occurs
              under your account.
            </P>
            <P>
              You must notify us immediately at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-foreground underline underline-offset-4 hover:text-primary transition-colors">
                {CONTACT_EMAIL}
              </a>{" "}
              if you suspect any unauthorized access to your account.
            </P>

            {/* 4 */}
            <H2 id="s4">4. Acceptable Use</H2>
            <P>You agree not to use the Service to:</P>
            <ul className="list-disc list-inside space-y-1.5 mb-3 pl-1">
              <Li>Violate any applicable local, national, or international law or regulation.</Li>
              <Li>Distribute malware, spyware, or any other harmful or malicious software.</Li>
              <Li>Conduct phishing, fraud, spam, or other deceptive activities.</Li>
              <Li>Host command-and-control infrastructure for botnets or other malicious networks.</Li>
              <Li>Attempt to gain unauthorized access to other systems or networks.</Li>
              <Li>Interfere with or disrupt the integrity or performance of the Service.</Li>
              <Li>Resell or sublicense access to the Service without our prior written consent.</Li>
            </ul>
            <P>
              We reserve the right to suspend or terminate accounts that violate these policies
              without prior notice and without refund.
            </P>

            {/* 5 */}
            <H2 id="s5">5. Subscription and Billing</H2>
            <P>
              Some features of the Service require a paid subscription. Billing is handled by
              Paddle, our authorized reseller and Merchant of Record. By subscribing, you agree to
              Paddle&rsquo;s terms of service in addition to these Terms.
            </P>
            <P>
              Subscriptions are billed on a monthly recurring basis. You authorize us (via Paddle)
              to charge your payment method at the start of each billing cycle. Prices are listed
              in US dollars and are exclusive of any applicable taxes, which Paddle will collect
              where required by law.
            </P>
            <P>
              You may cancel your subscription at any time through the billing portal in your
              account settings. Cancellation takes effect at the end of the current billing period.
              Refunds are governed by our{" "}
              <Link href="/refunds" className="text-foreground underline underline-offset-4 hover:text-primary transition-colors">
                Refund Policy
              </Link>
              . If your subscription lapses, your account will revert to the free plan and hosts
              exceeding the free-plan limit will be disabled.
            </P>

            {/* 6 */}
            <H2 id="s6">6. Service Availability</H2>
            <P>
              We aim to provide a reliable service but do not guarantee 100% uptime. The Service
              is provided &ldquo;as is&rdquo; and may be subject to scheduled maintenance or
              unplanned outages. We are not liable for any losses arising from service
              interruptions.
            </P>
            <P>
              DNS propagation times are outside our control and depend on third-party resolvers
              and TTL settings. We do not guarantee that DNS updates will propagate within any
              specific time frame.
            </P>

            {/* 7 */}
            <H2 id="s7">7. Intellectual Property</H2>
            <P>
              The Service, including its software, design, trademarks, and content, is owned by
              {COMPANY} and is protected by applicable intellectual property laws. You are granted
              a limited, non-exclusive, non-transferable license to use the Service solely for its
              intended purpose.
            </P>
            <P>
              You retain ownership of any data you submit to the Service (e.g., hostnames, IP
              addresses). By using the Service, you grant us a limited license to process and store
              that data for the sole purpose of providing the Service.
            </P>

            {/* 8 */}
            <H2 id="s8">8. Disclaimer of Warranties</H2>
            <P>
              To the fullest extent permitted by law, the Service is provided &ldquo;as is&rdquo;
              and &ldquo;as available&rdquo; without warranties of any kind, express or implied,
              including but not limited to warranties of merchantability, fitness for a particular
              purpose, or non-infringement. We do not warrant that the Service will be
              uninterrupted, error-free, or free of harmful components.
            </P>

            {/* 9 */}
            <H2 id="s9">9. Limitation of Liability</H2>
            <P>
              To the maximum extent permitted by applicable law, {COMPANY} and its affiliates,
              officers, employees, and agents shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages arising out of or related to your use of
              the Service, even if advised of the possibility of such damages.
            </P>
            <P>
              Our total cumulative liability to you for any claims arising from these Terms or the
              Service shall not exceed the amount you paid us in the three months preceding the
              claim.
            </P>

            {/* 10 */}
            <H2 id="s10">10. Termination</H2>
            <P>
              You may delete your account at any time from your account settings, which will
              permanently remove your data. We may suspend or terminate your account immediately
              if you breach these Terms, engage in abusive behavior, or fail to pay applicable
              fees.
            </P>
            <P>
              Upon termination, your right to use the Service ceases immediately. Sections that by
              their nature should survive termination (including liability, disclaimers, and
              dispute resolution) will remain in effect.
            </P>

            {/* 11 */}
            <H2 id="s11">11. Changes to These Terms</H2>
            <P>
              We may update these Terms from time to time. When we make material changes, we will
              update the effective date at the top of this page and, where appropriate, notify you
              by email. Continued use of the Service after changes become effective constitutes
              your acceptance of the revised Terms.
            </P>

            {/* 12 */}
            <H2 id="s12">12. Governing Law</H2>
            <P>
              These Terms are governed by and construed in accordance with applicable law. Any
              disputes arising under these Terms shall be resolved through good-faith negotiation
              in the first instance. If a dispute cannot be resolved informally, it shall be
              referred to binding arbitration or the courts of competent jurisdiction, as
              applicable in your region.
            </P>

            {/* 13 */}
            <H2 id="s13">13. Contact</H2>
            <P>
              If you have any questions about these Terms, please contact us at:{" "}
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
