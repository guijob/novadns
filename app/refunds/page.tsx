import Link from "next/link"
import { Button } from "@/components/ui/button"

const EFFECTIVE_DATE = "1 June 2025"
const COMPANY        = "NovaDNS"
const CONTACT_EMAIL  = "support@novadns.io"

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
  "Overview",
  "30-Day Money-Back Guarantee",
  "How to Request a Refund",
  "Processing Time",
  "Contact",
]

export default function RefundsPage() {
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
            <span className="text-foreground font-medium">Refund Policy</span>
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
            <h1 className="text-2xl font-bold tracking-tight mb-2">Refund Policy</h1>
            <p className="text-sm text-muted-foreground mb-8">Effective date: {EFFECTIVE_DATE}</p>

            <div className="border border-border px-4 py-3 bg-muted/20 mb-8">
              <p className="text-xs text-muted-foreground leading-relaxed">
                We want you to be completely satisfied with {COMPANY}. All payments are processed
                by <strong className="text-foreground">Paddle</strong>, our Merchant of Record, who
                also manages refund requests on our behalf.
              </p>
            </div>

            {/* 1 */}
            <H2 id="s1">1. Overview</H2>
            <P>
              {COMPANY} offers monthly subscriptions. We stand behind the quality of our service
              and offer a straightforward 30-day money-back guarantee on all paid plans.
            </P>

            {/* 2 */}
            <H2 id="s2">2. 30-Day Money-Back Guarantee</H2>
            <P>
              If you are not satisfied with your subscription for any reason, you may request a
              full refund within <strong className="text-foreground font-medium">30 days</strong> of
              your payment. No questions asked.
            </P>
            <P>
              To request a refund, simply contact us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-foreground underline underline-offset-4 hover:text-primary transition-colors">
                {CONTACT_EMAIL}
              </a>{" "}
              within 30 days of the charge. We will arrange the refund through Paddle.
            </P>

            {/* 3 */}
            <H2 id="s3">3. How to Request a Refund</H2>
            <P>To request a refund, please:</P>
            <ol className="list-decimal list-inside space-y-1.5 mb-3 pl-1">
              <li className="text-sm text-muted-foreground leading-relaxed">
                Email{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-foreground underline underline-offset-4 hover:text-primary transition-colors">
                  {CONTACT_EMAIL}
                </a>{" "}
                with the subject line <strong className="text-foreground font-medium">&ldquo;Refund request&rdquo;</strong>.
              </li>
              <li className="text-sm text-muted-foreground leading-relaxed">
                Include the email address associated with your {COMPANY} account.
              </li>
            </ol>
            <P>
              We will respond within 1 business day. Approved refunds are processed through
              Paddle back to your original payment method.
            </P>

            {/* 4 */}
            <H2 id="s4">4. Processing Time</H2>
            <P>
              Once a refund is approved, Paddle typically processes it within{" "}
              <strong className="text-foreground font-medium">5–10 business days</strong>. The
              time for the funds to appear in your account depends on your bank or card issuer.
            </P>
            <P>
              You will receive an email confirmation from Paddle when the refund has been initiated.
            </P>

            {/* 5 */}
            <H2 id="s5">5. Contact</H2>
            <P>
              For refund requests or billing questions, contact us at:{" "}
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
