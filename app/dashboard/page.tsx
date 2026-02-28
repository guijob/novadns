import { getHosts } from "@/lib/actions"
import { getSession } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HostsTable } from "./hosts-table"

export default async function DashboardPage() {
  const [hosts, session] = await Promise.all([getHosts(), getSession()])
  const base  = process.env.BASE_DOMAIN ?? "novadns.io"
  const plan  = session?.plan ?? "free"

  const total    = hosts.length
  const active   = hosts.filter(h => h.active).length
  const online   = hosts.filter(h => h.active && h.lastSeenAt && (Date.now() - new Date(h.lastSeenAt).getTime()) < 10 * 60 * 1000).length
  const inactive = hosts.filter(h => !h.active).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hosts</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your dynamic DNS entries</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total hosts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">Online</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{online}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inactive</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-muted-foreground">{inactive}</p>
          </CardContent>
        </Card>
      </div>

      <HostsTable hosts={hosts} base={base} plan={plan} />
    </div>
  )
}
