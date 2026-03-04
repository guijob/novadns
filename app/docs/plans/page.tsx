// Server Component
import type { Metadata } from "next"
import { CodeBlock, c } from "../_components/code-block"
import { PageNav } from "../_components/page-nav"

export const metadata: Metadata = {
  title: "Plans & Limits — NovaDNS Docs",
  description: "Compare NovaDNS Free, Pro, and Business plans. Host limits, update frequency, webhook support, and team features.",
  openGraph: {
    title: "Plans & Limits — NovaDNS Docs",
    description: "Compare NovaDNS Free, Pro, and Business plans. Host limits, update frequency, webhook support, and team features.",
    type: "article",
    url: "https://novadns.io/docs/plans",
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

export default function PlansPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-widest text-primary mb-3">Reference</p>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Plans & Limits</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          NovaDNS offers five tiers from a free personal plan up to an enterprise plan for large
          organisations. All paid plans are billed through Paddle and can be cancelled at any time.
        </p>
      </div>

      {/* Overview */}
      <h2 className="text-base font-semibold mt-8 mb-3">Overview</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        Every NovaDNS account starts on the <strong className="text-foreground font-medium">Free</strong> plan
        with no credit card required. Free accounts support up to 3 hosts on the personal workspace,
        with a 5-minute update interval. Paid plans unlock more hosts, faster update intervals, team
        workspaces, host groups, webhooks, and custom update credentials.
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        Teams have their own independent plan separate from the owner&apos;s personal plan. A user
        on the Free personal plan can still be a member of a Business team, and vice versa.
      </p>

      <SectionDivider />

      {/* Plan comparison table */}
      <h2 className="text-base font-semibold mt-8 mb-3">Plan comparison</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-border">
          <thead className="bg-muted/30">
            <tr className="divide-x divide-border border-b border-border">
              <th className="px-4 py-3 text-left text-xs font-mono font-semibold text-muted-foreground">Feature</th>
              <th className="px-4 py-3 text-center text-xs font-mono font-semibold text-muted-foreground">Free</th>
              <th className="px-4 py-3 text-center text-xs font-mono font-semibold text-muted-foreground">Starter</th>
              <th className="px-4 py-3 text-center text-xs font-mono font-semibold text-primary">Pro</th>
              <th className="px-4 py-3 text-center text-xs font-mono font-semibold text-muted-foreground">Business</th>
              <th className="px-4 py-3 text-center text-xs font-mono font-semibold text-muted-foreground">Enterprise</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {[
              {
                feature: "Hosts",
                values: ["3", "25", "100", "200", "500"],
              },
              {
                feature: "Teams",
                values: ["No", "Yes", "Yes", "Yes", "Yes"],
              },
              {
                feature: "Groups",
                values: ["No", "Yes", "Yes", "Yes", "Yes"],
              },
              {
                feature: "Webhooks",
                values: ["No", "Yes", "Yes", "Yes", "Yes"],
              },
              {
                feature: "IPv6",
                values: ["Yes", "Yes", "Yes", "Yes", "Yes"],
              },
              {
                feature: "Custom credentials",
                values: ["No", "No", "Yes", "Yes", "Yes"],
              },
              {
                feature: "Update interval",
                values: ["5 min", "1 min", "30s", "30s", "30s"],
              },
            ].map(({ feature, values }, i) => (
              <tr key={feature} className={`divide-x divide-border ${i % 2 === 1 ? "bg-muted/10" : ""}`}>
                <td className="px-4 py-3 text-xs text-muted-foreground font-medium">{feature}</td>
                {values.map((val, j) => (
                  <td
                    key={j}
                    className={`px-4 py-3 text-center text-xs font-mono ${
                      val === "No" ? "text-muted-foreground/50" :
                      val === "Yes" ? "text-emerald-500 dark:text-emerald-400" :
                      j === 2 ? "text-primary font-semibold" :
                      "text-foreground"
                    }`}
                  >
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SectionDivider />

      {/* Free plan */}
      <h2 className="text-base font-semibold mt-8 mb-3">Free plan</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        The Free plan is designed for personal use and experimentation. It includes everything you
        need to get a home server or device reliably reachable from the internet.
      </p>
      <ul className="space-y-1.5 my-4 text-sm text-muted-foreground list-disc list-inside">
        <li>Up to <strong className="text-foreground font-medium">3 hosts</strong> on your personal workspace</li>
        <li>IPv4 and IPv6 support on all hosts</li>
        <li>Update interval of <strong className="text-foreground font-medium">5 minutes</strong> — sufficient for most home internet connections</li>
        <li>No host groups, webhooks, or custom credentials</li>
        <li>Personal workspace only — no team collaboration</li>
      </ul>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        No credit card is required to sign up. The free plan does not expire.
      </p>

      <SectionDivider />

      {/* Team plans */}
      <h2 className="text-base font-semibold mt-8 mb-3">Team plans</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        Teams are available on <strong className="text-foreground font-medium">Starter and above</strong>.
        A team is a shared workspace where multiple NovaDNS users can manage hosts, groups, and
        webhooks together under role-based access control.
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        Each team has its own plan, billed separately from any personal plan held by the team owner
        or members. The team plan determines the host and feature limits for the team workspace —
        it has no effect on the personal workspaces of its members.
      </p>
      <ul className="space-y-1.5 my-4 text-sm text-muted-foreground list-disc list-inside">
        <li><strong className="text-foreground font-medium">Owner</strong> — full control, billing access, can delete the team</li>
        <li><strong className="text-foreground font-medium">Admin</strong> — can manage hosts, groups, webhooks, and invite members</li>
        <li><strong className="text-foreground font-medium">Member</strong> — read-only access; cannot create or delete resources</li>
      </ul>

      <SectionDivider />

      {/* Upgrading and downgrading */}
      <h2 className="text-base font-semibold mt-8 mb-3">Upgrading and downgrading</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        You can upgrade or downgrade your plan at any time from{" "}
        <strong className="text-foreground font-medium">Settings → Plan</strong> (personal) or{" "}
        <strong className="text-foreground font-medium">Team → Plan</strong> (team workspace).
        Plan changes take effect immediately — you are not locked into a billing period.
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        When upgrading, you are prorated for the remainder of the current billing period.
        When downgrading, any credit is applied to the next invoice.
      </p>

      <div className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4 my-5 text-sm text-amber-900 dark:text-amber-200">
        <strong>Downgrading and host limits:</strong> if your current number of hosts exceeds the
        limit on the new plan, your existing hosts are <em>not</em> automatically deleted. However,
        they will not receive IP updates until the number of active hosts is within the plan limit.
        You can archive or delete excess hosts from your dashboard.
      </div>

      <SectionDivider />

      {/* Billing */}
      <h2 className="text-base font-semibold mt-8 mb-3">Billing</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        NovaDNS billing is powered by <strong className="text-foreground font-medium">Paddle</strong>,
        a merchant of record that handles payments, taxes, and invoicing globally. Paddle accepts
        all major credit and debit cards, PayPal, and many local payment methods depending on your
        country.
      </p>
      <ul className="space-y-1.5 my-4 text-sm text-muted-foreground list-disc list-inside">
        <li>Subscriptions are billed monthly</li>
        <li>VAT and sales tax are calculated and collected by Paddle at checkout</li>
        <li>Invoices are emailed automatically after each payment</li>
        <li>Cancel at any time from the billing portal — your plan remains active until the end of the paid period</li>
      </ul>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        To access the billing portal, go to{" "}
        <strong className="text-foreground font-medium">Settings → Billing</strong> and click{" "}
        <strong className="text-foreground font-medium">Manage subscription</strong>. From there you
        can update your payment method, view invoices, and cancel.
      </p>

      <PageNav />
    </div>
  )
}
