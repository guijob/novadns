import { redirect } from "next/navigation"
import Link from "next/link"
import { getSession } from "@/lib/auth"
import { getGroups } from "@/lib/actions"
import { GroupsTable } from "./groups-table"
import { canCustomizeCredentials } from "@/lib/plans"
import { Button } from "@/components/ui/button"

export default async function GroupsPage() {
  const session = await getSession()
  if (!session) redirect("/login")

  const base = process.env.BASE_DOMAIN ?? "novadns.io"

  if (!canCustomizeCredentials(session.plan)) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Groups</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Share one set of credentials across multiple hosts
          </p>
        </div>
        <div className="border border-border px-6 py-10 flex flex-col items-center text-center gap-3 max-w-sm">
          <p className="font-semibold text-sm">Pro plan required</p>
          <p className="text-xs text-muted-foreground">
            Groups and shared credentials are available on the Pro plan ($15/mo) and above.
          </p>
          <Button size="sm" render={<Link href="/dashboard/settings" />}>
            Upgrade plan
          </Button>
        </div>
      </div>
    )
  }

  const groups = await getGroups()

  const stats = [
    { label: "Total groups",   value: groups.length },
    { label: "Hosts assigned", value: groups.reduce((sum, g) => sum + g.hostCount, 0) },
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

      <GroupsTable groups={groups} base={base} plan={session.plan} />
    </div>
  )
}
