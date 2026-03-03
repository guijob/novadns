// Server Component
import type { Metadata } from "next"
import { CodeBlock, c } from "../_components/code-block"
import { PageNav } from "../_components/page-nav"

export const metadata: Metadata = {
  title: "Teams — NovaDNS Docs",
  description: "Collaborate on dynamic DNS with team workspaces. Invite members, assign roles, and manage shared hosts together.",
  openGraph: {
    title: "Teams — NovaDNS Docs",
    description: "Collaborate on dynamic DNS with team workspaces. Invite members, assign roles, and manage shared hosts together.",
    type: "article",
    url: "https://novadns.io/docs/teams",
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

export default function TeamsPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-widest text-primary mb-3">Guides</p>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Teams</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Teams let you collaborate on hosts, groups, and webhooks with other people under a
          shared workspace. Each team has its own plan, billing, and member roles — completely
          separate from your personal account.
        </p>
      </div>

      {/* Workspaces */}
      <div id="workspaces">
        <h2 className="text-base font-semibold mt-8 mb-3">Workspaces</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Every NovaDNS account has a <strong className="text-foreground">personal workspace</strong> by
          default. Your personal workspace is private — only you can see and manage its hosts,
          groups, and webhooks.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Teams are <strong className="text-foreground">shared workspaces</strong>. When you create
          or join a team, it appears alongside your personal workspace in the workspace switcher
          in the top-left corner of the dashboard. Clicking a workspace name switches the entire
          dashboard to that context — all lists, settings, and actions apply only to the active
          workspace.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Resources are never shared between workspaces. A host created in your personal workspace
          cannot be seen or managed by team members, and vice versa, unless you explicitly transfer
          it.
        </p>
        <div className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 p-4 my-5 text-sm text-blue-900 dark:text-blue-200">
          The active workspace is remembered per browser session. If you manage both a personal
          account and a team, double-check the workspace switcher before making changes to avoid
          editing the wrong workspace.
        </div>
      </div>

      <SectionDivider />

      {/* Creating a team */}
      <div id="creating-a-team">
        <h2 className="text-base font-semibold mt-8 mb-3">Creating a team</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Any account on a paid personal plan can create a team. Teams have their own plan and
          billing that are separate from the creator&apos;s personal plan.
        </p>
        <ol className="space-y-2 my-4 text-sm text-muted-foreground list-decimal list-inside leading-relaxed">
          <li>Click the <strong className="text-foreground">workspace switcher</strong> in the top-left corner of the dashboard.</li>
          <li>Select <strong className="text-foreground">New team</strong> from the dropdown.</li>
          <li>Enter a team name. This is displayed to all members and in billing receipts.</li>
          <li>Confirm — you are immediately set as the team Owner and taken into the new workspace.</li>
        </ol>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          After creation the team starts on a free trial. Navigate to{" "}
          <strong className="text-foreground">Settings → Billing</strong> within the team workspace
          to select a plan before the trial ends.
        </p>
        <div className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4 my-5 text-sm text-amber-900 dark:text-amber-200">
          Creating a team requires a paid personal plan. If your personal account is on the Free
          tier, upgrade it first from your personal workspace billing settings.
        </div>
      </div>

      <SectionDivider />

      {/* Inviting members */}
      <div id="inviting-members">
        <h2 className="text-base font-semibold mt-8 mb-3">Inviting members</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Owners and Admins can invite new members. Invitations are sent by email and expire
          after 7 days if not accepted.
        </p>
        <ol className="space-y-2 my-4 text-sm text-muted-foreground list-decimal list-inside leading-relaxed">
          <li>Switch to the team workspace using the workspace switcher.</li>
          <li>Navigate to <strong className="text-foreground">Team</strong> in the sidebar.</li>
          <li>Click <strong className="text-foreground">Invite member</strong>.</li>
          <li>Enter the invitee&apos;s email address and select their role.</li>
          <li>Click <strong className="text-foreground">Send invite</strong> — they receive an email with an accept link.</li>
        </ol>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          The invitee clicks the link in the email, which takes them to{" "}
          <InlineCode>novadns.io/invite/[token]</InlineCode>. If they do not already have a
          NovaDNS account, they are prompted to create one before accepting. Once accepted,
          the team workspace appears in their workspace switcher immediately.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Pending invites are listed on the Team page. An Owner or Admin can cancel an invite
          before it is accepted by clicking the trash icon next to the pending entry.
        </p>
      </div>

      <SectionDivider />

      {/* Roles */}
      <div id="roles">
        <h2 className="text-base font-semibold mt-8 mb-3">Roles</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Every team member is assigned one of three roles. Roles control what actions a member
          can perform within the team workspace.
        </p>
        <div className="border border-border">
          <div className="grid grid-cols-[100px_1fr] text-xs font-mono uppercase tracking-wide text-muted-foreground bg-muted/30 border-b border-border px-4 py-2">
            <span>Role</span>
            <span>Permissions</span>
          </div>
          {[
            {
              role: "Owner",
              perms: [
                "All Admin permissions",
                "Manage team billing and plan",
                "Transfer or delete the team",
                "Promote members to Admin or Owner",
              ],
            },
            {
              role: "Admin",
              perms: [
                "Create, edit, and delete hosts, groups, and webhooks",
                "Invite new members and set their role (up to Admin)",
                "Remove members from the team",
                "View and copy host credentials",
              ],
            },
            {
              role: "Member",
              perms: [
                "View all hosts and their current IPs",
                "Use group credentials to update hosts (read credentials, cannot rotate)",
                "Read-only access to groups and webhooks",
                "Cannot modify any team resource",
              ],
            },
          ].map(({ role, perms }) => (
            <div key={role} className="grid grid-cols-[100px_1fr] items-start px-4 py-4 gap-4 border-t border-border">
              <span className="text-xs font-mono font-semibold text-foreground pt-0.5">{role}</span>
              <ul className="space-y-1 text-xs text-muted-foreground list-disc list-inside">
                {perms.map(p => <li key={p}>{p}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mt-4">
          A team can have at most one Owner. To transfer ownership, the current Owner must
          promote another member to Owner — this demotes the previous Owner to Admin automatically.
        </p>
      </div>

      <SectionDivider />

      {/* Transferring hosts */}
      <div id="transferring-hosts">
        <h2 className="text-base font-semibold mt-8 mb-3">Transferring hosts</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Hosts can be moved between workspaces — from your personal account to a team, from a
          team back to your personal account, or between teams you own or administer. The hostname
          and all update history are preserved; only the owning workspace changes.
        </p>
        <ol className="space-y-2 my-4 text-sm text-muted-foreground list-decimal list-inside leading-relaxed">
          <li>Open the host settings sheet from the dashboard.</li>
          <li>Scroll to <strong className="text-foreground">Transfer to workspace</strong>.</li>
          <li>Select the destination workspace from the dropdown. Only workspaces where you hold an Owner or Admin role are listed.</li>
          <li>Confirm the transfer.</li>
        </ol>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          The host immediately disappears from the source workspace and appears in the destination.
          The host&apos;s individual update token does not change, so any devices configured with
          that token continue to work without reconfiguration.
        </p>
        <div className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4 my-5 text-sm text-amber-900 dark:text-amber-200">
          If the host belongs to a group, it is <strong>removed from the group</strong> upon
          transfer, since groups are workspace-scoped and do not cross workspace boundaries.
          Reassign it to a group in the destination workspace after the transfer if needed.
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Only Owners and Admins of the <em>source</em> workspace can initiate a transfer. Members
          do not have access to the transfer option.
        </p>
      </div>

      <SectionDivider />

      {/* Team billing */}
      <div id="team-billing">
        <h2 className="text-base font-semibold mt-8 mb-3">Team billing</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Each team has its own subscription, entirely separate from any personal plans held by its
          members. The team plan determines the limits that apply within the team workspace —
          maximum hosts, groups, webhooks, and member seats.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Only the team <strong className="text-foreground">Owner</strong> can view and manage
          team billing. Admins and Members do not have access to the Billing section within a
          team workspace.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          To manage the team plan, switch to the team workspace and navigate to{" "}
          <strong className="text-foreground">Settings → Billing</strong>. From there you can
          upgrade or downgrade the plan, update the payment method, and download invoices.
        </p>
        <div className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 p-4 my-5 text-sm text-blue-900 dark:text-blue-200">
          Billing for the team is independent of the individual accounts of its members.
          A member&apos;s personal plan does not affect what the team can do, and vice versa.
        </div>
      </div>

      <SectionDivider />

      {/* Leaving and deleting */}
      <div id="leaving-and-deleting">
        <h2 className="text-base font-semibold mt-8 mb-3">Leaving and deleting</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Any member — including Admins — can leave a team at any time from the Team settings
          page. Leaving removes you from the workspace immediately; you lose access to all team
          hosts, groups, and webhooks. Your personal workspace is unaffected.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          The team <strong className="text-foreground">Owner cannot leave</strong> while the team
          has other members. Transfer ownership to another member first, then leave, or delete the
          team entirely.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Deleting a team is a permanent, irreversible action. Only the Owner can delete a team.
          To delete:
        </p>
        <ol className="space-y-2 my-4 text-sm text-muted-foreground list-decimal list-inside leading-relaxed">
          <li>Switch to the team workspace.</li>
          <li>Navigate to <strong className="text-foreground">Settings → Danger zone</strong>.</li>
          <li>Click <strong className="text-foreground">Delete team</strong> and confirm by typing the team name.</li>
        </ol>
        <div className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4 my-5 text-sm text-amber-900 dark:text-amber-200">
          Deleting a team <strong>permanently deletes all hosts</strong> in the workspace. DNS
          records for those hosts are removed immediately. There is no recovery option. Export
          or transfer any important hosts before deleting the team.
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          All active team subscriptions are cancelled at the end of the current billing period
          when the team is deleted. No further charges are made after deletion.
        </p>
      </div>

      <PageNav
        prev={{ href: "/docs/groups", label: "Groups" }}
        next={{ href: "/docs/webhooks", label: "Webhooks" }}
      />
    </div>
  )
}
