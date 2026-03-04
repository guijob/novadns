import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"

export const metadata: Metadata = {
  title: "Host Groups — NovaDNS",
  robots: { index: false },
}
import { getGroups } from "@/lib/actions"
import { resolveWorkspace } from "@/lib/workspace"
import { GroupsTable } from "./groups-table"

export default async function GroupsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const session = await getSession()
  if (!session) redirect("/login")

  const workspace = await resolveWorkspace(slug, session.id)
  if (!workspace) redirect("/login")

  const base = process.env.BASE_DOMAIN ?? "novaip.link"
  const plan = workspace.plan

  const groups = await getGroups(slug)

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

      <GroupsTable slug={slug} groups={groups} base={base} plan={plan} />
    </div>
  )
}
