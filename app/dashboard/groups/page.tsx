import { getGroups } from "@/lib/actions"
import { GroupsTable } from "./groups-table"

export default async function GroupsPage() {
  const groups = await getGroups()
  const base   = process.env.BASE_DOMAIN ?? "novadns.io"

  const totalGroups = groups.length
  const totalAssigned = groups.reduce((sum, g) => sum + g.hostCount, 0)

  const stats = [
    { label: "Total groups",    value: totalGroups   },
    { label: "Hosts assigned",  value: totalAssigned },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Groups</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Share one set of credentials across multiple hosts
        </p>
      </div>

      <div className="grid gap-px bg-border sm:grid-cols-2 border border-border">
        {stats.map(({ label, value }) => (
          <div key={label} className="bg-background px-5 py-4">
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide mb-2">{label}</p>
            <span className="text-3xl font-bold tabular-nums leading-none">{value}</span>
          </div>
        ))}
      </div>

      <GroupsTable groups={groups} base={base} />
    </div>
  )
}
