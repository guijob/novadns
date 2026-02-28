import { getHosts, getGroups } from "@/lib/actions"
import { getSession } from "@/lib/auth"
import { HostsTable } from "./hosts-table"

export default async function DashboardPage() {
  const [hosts, session, groups] = await Promise.all([
    getHosts(),
    getSession(),
    getGroups().catch(() => [] as Awaited<ReturnType<typeof getGroups>>),
  ])
  const base = process.env.BASE_DOMAIN ?? "novadns.io"
  const plan = session?.plan ?? "free"

  const total    = hosts.length
  const active   = hosts.filter(h => h.active).length
  const online   = hosts.filter(h => h.active && h.lastSeenAt && (Date.now() - new Date(h.lastSeenAt).getTime()) < 10 * 60 * 1000).length
  const inactive = hosts.filter(h => !h.active).length

  const stats = [
    { label: "Total hosts",  value: total,    accent: false },
    { label: "Active",       value: active,   accent: false },
    { label: "Online",       value: online,   accent: true  },
    { label: "Inactive",     value: inactive, accent: false },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Hosts</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your dynamic DNS entries</p>
      </div>

      <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4 border border-border">
        {stats.map(({ label, value, accent }) => (
          <div key={label} className="bg-background px-5 py-4">
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide mb-2">{label}</p>
            <div className="flex items-end gap-2">
              <span className={`text-3xl font-bold tabular-nums leading-none ${accent ? "text-green-600 dark:text-green-400" : ""}`}>
                {value}
              </span>
              {accent && value > 0 && (
                <span className="size-2 rounded-full bg-green-500 mb-1 animate-pulse" />
              )}
            </div>
          </div>
        ))}
      </div>

      <HostsTable hosts={hosts} base={base} plan={plan} groups={groups} />
    </div>
  )
}
