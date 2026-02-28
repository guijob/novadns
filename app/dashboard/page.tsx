import { getHosts } from "@/lib/actions"
import { HostsTable } from "./hosts-table"

export default async function DashboardPage() {
  const hosts = await getHosts()
  const base  = process.env.BASE_DOMAIN ?? "novadns.io"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hosts</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your dynamic DNS entries</p>
      </div>
      <HostsTable hosts={hosts} base={base} />
    </div>
  )
}
