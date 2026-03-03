// Server Component
import type { Metadata } from "next"
import { CodeBlock, c } from "../_components/code-block"
import { PageNav } from "../_components/page-nav"

export const metadata: Metadata = {
  title: "Host Groups — NovaDNS Docs",
  description: "Group multiple hosts under shared Basic Auth credentials and update all of them with a single request.",
  openGraph: {
    title: "Host Groups — NovaDNS Docs",
    description: "Group multiple hosts under shared Basic Auth credentials and update all of them with a single request.",
    type: "article",
    url: "https://novadns.io/docs/groups",
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

export default function GroupsPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-widest text-primary mb-3">Guides</p>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Groups</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Groups are credential pools that let multiple hosts share a single set of DynDNS
          credentials. They eliminate the need to configure each device individually when
          you have a fleet of cameras, sensors, or other hosts that all update from the same network.
        </p>
      </div>

      {/* What are groups */}
      <div id="what-are-groups">
        <h2 className="text-base font-semibold mt-8 mb-3">What are groups</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Every host in NovaDNS has its own unique update token, which is perfect for devices
          you configure individually. However, many IoT devices — IP cameras, smart home hubs,
          NVRs — use a shared DynDNS username and password that applies to all units on the same
          router or system. Groups exist to serve this pattern.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          A group has a single username and password. Any host assigned to the group will accept
          updates authenticated with those group credentials, regardless of which specific hostname
          is being updated. The DynDNS client passes the target hostname in the{" "}
          <InlineCode>hostname</InlineCode> parameter, so each host in the group still updates
          independently and maintains its own IP record.
        </p>
        <div className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 p-4 my-5 text-sm text-blue-900 dark:text-blue-200">
          A host&apos;s individual update token always continues to work, even when the host belongs
          to a group. Group credentials are an additional authentication path, not a replacement.
        </div>
      </div>

      <SectionDivider />

      {/* Creating a group */}
      <div id="creating-a-group">
        <h2 className="text-base font-semibold mt-8 mb-3">Creating a group</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Groups are created and managed from the Groups section of the dashboard.
        </p>
        <ol className="space-y-2 my-4 text-sm text-muted-foreground list-decimal list-inside leading-relaxed">
          <li>Open the dashboard and click <strong className="text-foreground">Groups</strong> in the sidebar.</li>
          <li>Click <strong className="text-foreground">New group</strong>.</li>
          <li>Enter a name for the group (e.g. <InlineCode>ip-cameras</InlineCode> or <InlineCode>home-sensors</InlineCode>).</li>
          <li>Optionally add a description to help identify the group&apos;s purpose later.</li>
          <li>Save — NovaDNS generates a username and password for the group immediately.</li>
        </ol>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          The generated credentials are shown in the group settings. Copy them into your devices
          before navigating away — the password can be regenerated at any time, but the current
          value is not redisplayed after you leave the page.
        </p>
      </div>

      <SectionDivider />

      {/* Adding hosts to a group */}
      <div id="adding-hosts-to-a-group">
        <h2 className="text-base font-semibold mt-8 mb-3">Adding hosts to a group</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          A host can belong to at most one group at a time. You assign the group from the host&apos;s
          own settings panel.
        </p>
        <ol className="space-y-2 my-4 text-sm text-muted-foreground list-decimal list-inside leading-relaxed">
          <li>Open the dashboard and find the host you want to assign.</li>
          <li>Click the host to open its settings sheet.</li>
          <li>Locate the <strong className="text-foreground">Group</strong> dropdown.</li>
          <li>Select the group you created from the list.</li>
          <li>Save the host settings.</li>
        </ol>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Repeat for each host you want to include. A single group can contain an unlimited number
          of hosts on Starter and above plans. Once assigned, the host is immediately accessible
          via the group&apos;s credentials.
        </p>
        <div className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4 my-5 text-sm text-amber-900 dark:text-amber-200">
          Removing a host from a group (setting the Group field to <strong>None</strong>) takes
          effect immediately. Any device still configured with the group credentials will stop
          being able to update that host until reconfigured.
        </div>
      </div>

      <SectionDivider />

      {/* How credentials work */}
      <div id="how-credentials-work">
        <h2 className="text-base font-semibold mt-8 mb-3">How credentials work</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          When NovaDNS receives a DynDNS update request via <InlineCode>/nic/update</InlineCode>,
          it checks the provided <InlineCode>hostname</InlineCode> parameter against all hosts
          that the supplied credentials can update. A host is reachable by credentials if:
        </p>
        <ul className="space-y-1.5 my-4 text-sm text-muted-foreground list-disc list-inside">
          <li>The credentials match the host&apos;s individual token (email + host token), <strong className="text-foreground">or</strong></li>
          <li>The credentials match the group credentials of the group the host belongs to.</li>
        </ul>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          In practice, a device configured with the group username and password issues a request like:
        </p>
        <CodeBlock filename="shell" label="group credential update">
          {c.prompt("$ ")}{c.kw("curl")}{c.plain(" \\\n")
          }{c.plain("  ")}{c.str('"https://')}{c.url("group-username")}{c.str(":")}{c.url("group-password")}{c.str("@novadns.io/nic/update")}{c.plain(" \\\n")
          }{c.plain("  ")}{c.flag("?hostname=")}{c.str("camera1.novaip.link")}{c.str('"')}
        </CodeBlock>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          NovaDNS resolves <InlineCode>camera1.novaip.link</InlineCode>, confirms it belongs to a
          group whose credentials match the supplied username and password, and updates the record.
          Each device in the group still updates its own hostname independently — they are not
          linked in any other way.
        </p>
      </div>

      <SectionDivider />

      {/* Use cases */}
      <div id="use-cases">
        <h2 className="text-base font-semibold mt-8 mb-3">Use cases</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Groups are best suited to situations where you cannot or do not want to configure
          per-host tokens individually.
        </p>
        <div className="border border-border divide-y divide-border">
          {[
            {
              title: "IP cameras and NVRs",
              desc: "Most camera systems have a single DDNS credential field that applies to every camera on the recorder. Configure the recorder once with group credentials and add each camera host to the group.",
            },
            {
              title: "Smart home devices",
              desc: "Hubs like Home Assistant or Hubitat can update DDNS on behalf of multiple endpoints. A single group credential covers all registered hosts without per-device configuration.",
            },
            {
              title: "Multiple hosts on the same router",
              desc: "Routers typically support only one DDNS account. Assign all hosts on that router to a group, configure the router with the group credentials and a comma-separated hostname list if supported.",
            },
            {
              title: "Shared team environments",
              desc: "When a team manages a large set of hosts and doesn't want to distribute individual tokens, a group keeps credential management centralised and easy to rotate.",
            },
          ].map(({ title, desc }) => (
            <div key={title} className="px-4 py-4">
              <p className="text-xs font-semibold text-foreground mb-1">{title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* Credential rotation */}
      <div id="credential-rotation">
        <h2 className="text-base font-semibold mt-8 mb-3">Credential rotation</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          You can regenerate the group password at any time from the group settings page. Click{" "}
          <strong className="text-foreground">Regenerate credentials</strong> and confirm the action.
          The new credentials take effect immediately — all hosts in the group will require the
          updated password from that point on.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Rotation does not affect a host&apos;s individual update token. Devices that were configured
          with the host&apos;s own token continue working without any changes.
        </p>
        <div className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4 my-5 text-sm text-amber-900 dark:text-amber-200">
          After rotating credentials, update every device in the group before the old password
          is no longer valid. There is no grace period — the old password is invalidated the
          moment you confirm the rotation.
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          We recommend rotating group credentials whenever a team member who had access to them
          leaves, or on a regular schedule (e.g. every 90 days) as part of your security hygiene.
        </p>
      </div>

      <SectionDivider />

      {/* Plan availability */}
      <div id="plan-availability">
        <h2 className="text-base font-semibold mt-8 mb-3">Plan availability</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Groups are available on the <strong className="text-foreground">Starter</strong> plan and
          above. The Free plan does not include group support.
        </p>
        <div className="border border-border">
          <div className="grid grid-cols-[160px_1fr] text-xs font-mono uppercase tracking-wide text-muted-foreground bg-muted/30 border-b border-border px-4 py-2">
            <span>Plan</span>
            <span>Groups</span>
          </div>
          {[
            { plan: "Free", groups: "Not available" },
            { plan: "Starter", groups: "Up to 5 groups, unlimited hosts per group" },
            { plan: "Pro", groups: "Unlimited groups, unlimited hosts per group" },
            { plan: "Team", groups: "Unlimited groups, scoped per workspace" },
          ].map(({ plan, groups }) => (
            <div key={plan} className="grid grid-cols-[160px_1fr] items-start px-4 py-3 gap-4 border-t border-border">
              <span className="text-xs font-mono font-semibold text-foreground">{plan}</span>
              <span className="text-xs text-muted-foreground leading-relaxed">{groups}</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mt-4">
          Upgrade your plan from the <strong className="text-foreground">Billing</strong> section
          of the dashboard settings at any time.
        </p>
      </div>

      <PageNav
        prev={{ href: "/docs/clients", label: "Client Setup" }}
        next={{ href: "/docs/webhooks", label: "Webhooks" }}
      />
    </div>
  )
}
