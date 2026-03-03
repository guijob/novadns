import { redirect } from "next/navigation"
import { getHosts, getGroups } from "@/lib/actions"
import { getSession } from "@/lib/auth"
import { resolveWorkspace } from "@/lib/workspace"
import { getUserTeams } from "@/lib/team-context"
import { HostsTable } from "./hosts-table"
import { HugeiconsIcon } from "@hugeicons/react"
import { ServerStack01Icon, CheckmarkCircle02Icon, Wifi01Icon, Cancel01Icon } from "@hugeicons/core-free-icons"

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const session = await getSession()
  if (!session) redirect("/login")

  const workspace = await resolveWorkspace(slug, session.id)
  if (!workspace) redirect("/login")

  const [hostsData, groups] = await Promise.all([
    getHosts(slug),
    getGroups(slug).catch(() => [] as Awaited<ReturnType<typeof getGroups>>),
  ])
  const base      = process.env.BASE_DOMAIN ?? "novadns.io"
  const plan      = workspace.plan
  const userTeams = await getUserTeams(session.id)

  const total    = hostsData.length
  const active   = hostsData.filter(h => h.active).length
  const online   = hostsData.filter(h => h.active && h.lastSeenAt && (Date.now() - new Date(h.lastSeenAt).getTime()) < 10 * 60 * 1000).length
  const inactive = hostsData.filter(h => !h.active).length

  const stats = [
    { label: "Total",    value: total,    icon: ServerStack01Icon,      accent: false },
    { label: "Active",   value: active,   icon: CheckmarkCircle02Icon,  accent: false },
    { label: "Online",   value: online,   icon: Wifi01Icon,             accent: true  },
    { label: "Inactive", value: inactive, icon: Cancel01Icon,           accent: false },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Hosts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your dynamic DNS entries</p>
        </div>
      </div>

      <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4 border border-border">
        {stats.map(({ label, value, icon, accent }) => (
          <div key={label} className="bg-background px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">{label}</p>
              <HugeiconsIcon icon={icon} strokeWidth={1.5} className={`size-3.5 ${accent ? "text-green-500" : "text-muted-foreground/40"}`} />
            </div>
            <div className="flex items-end gap-2">
              <span className={`text-3xl font-bold tabular-nums leading-none ${accent ? "text-green-600 dark:text-green-400" : ""}`}>
                {value}
              </span>
              {accent && value > 0 && (
                <span className="size-1.5 rounded-full bg-green-500 mb-1 animate-pulse" />
              )}
            </div>
          </div>
        ))}
      </div>

      <HostsTable slug={slug} hosts={hostsData} base={base} plan={plan} isTeam={workspace.type === "team"} groups={groups} userTeams={userTeams} />
    </div>
  )
}
