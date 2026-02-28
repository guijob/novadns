import { notFound } from "next/navigation"
import { getHost, getUpdateLog, updateHost, regenerateToken, deleteHost } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CopyTokenButton } from "@/components/copy-token-button"

// Server action form-compatible wrappers
const updateHostVoid = updateHost as unknown as (id: number, formData: FormData) => Promise<void>

export default async function HostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const hostId = Number(id)
  const [host, log] = await Promise.all([getHost(hostId), getUpdateLog(hostId)])

  if (!host) notFound()

  const base = process.env.BASE_DOMAIN ?? "novadns.io"
  const updateUrl = `https://${base}/api/update?token=${host.token}`

  const updateHostById    = updateHostVoid.bind(null, hostId)
  const regenerateById    = regenerateToken.bind(null, hostId)
  const deleteById        = deleteHost.bind(null, hostId)

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{host.subdomain}.{base}</h1>
          <p className="text-sm text-muted-foreground mt-1">{host.description ?? "No description"}</p>
        </div>
        <Badge variant={host.active ? "default" : "secondary"}>
          {host.active ? "Active" : "Disabled"}
        </Badge>
      </div>

      {/* Update URL */}
      <Card>
        <CardHeader>
          <CardTitle>Update URL</CardTitle>
          <CardDescription>Configure your router&apos;s DDNS client with this URL</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <code className="flex-1 text-xs bg-muted rounded px-3 py-2 break-all">{updateUrl}</code>
            <CopyTokenButton text={updateUrl} label="Copy URL" />
          </div>
          <p className="text-xs text-muted-foreground">
            Append <code className="bg-muted px-1 rounded">&amp;ip=&lt;myip&gt;</code> if your router doesn&apos;t
            auto-fill the IP, or <code className="bg-muted px-1 rounded">&amp;ip6=&lt;myip6&gt;</code> for IPv6.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <form action={regenerateById}>
              <Button type="submit" variant="outline" size="sm">Regenerate token</Button>
            </form>
            <span className="text-xs text-muted-foreground">Invalidates the current token immediately</span>
          </div>
        </CardContent>
      </Card>

      {/* Current status */}
      <Card>
        <CardHeader><CardTitle>Current status</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted-foreground">IPv4</dt>
            <dd className="font-mono">{host.ipv4 ?? "—"}</dd>
            <dt className="text-muted-foreground">IPv6</dt>
            <dd className="font-mono text-xs">{host.ipv6 ?? "—"}</dd>
            <dt className="text-muted-foreground">Last seen</dt>
            <dd>{host.lastSeenAt?.toLocaleString() ?? "Never"}</dd>
            <dt className="text-muted-foreground">Last caller IP</dt>
            <dd className="font-mono">{host.lastSeenIp ?? "—"}</dd>
          </dl>
        </CardContent>
      </Card>

      {/* Edit */}
      <Card>
        <CardHeader><CardTitle>Settings</CardTitle></CardHeader>
        <CardContent>
          <form action={updateHostById}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <Textarea id="description" name="description" defaultValue={host.description ?? ""} rows={2} />
              </Field>
              <Field>
                <FieldLabel htmlFor="ttl">TTL (seconds)</FieldLabel>
                <Input id="ttl" name="ttl" type="number" defaultValue={host.ttl} min={30} max={86400} />
              </Field>
              <Field>
                <FieldLabel>Status</FieldLabel>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="active" value="true" defaultChecked={host.active} /> Active
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="active" value="false" defaultChecked={!host.active} /> Disabled
                  </label>
                </div>
              </Field>
              <Field orientation="horizontal">
                <Button type="submit">Save changes</Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      {/* Update log */}
      {log.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Update log</CardTitle>
            <CardDescription>Last {log.length} IP changes</CardDescription>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b">
                  <th className="pb-2 font-medium">Time</th>
                  <th className="pb-2 font-medium">IPv4</th>
                  <th className="pb-2 font-medium">IPv6</th>
                  <th className="pb-2 font-medium">Caller IP</th>
                </tr>
              </thead>
              <tbody>
                {log.map(entry => (
                  <tr key={entry.id} className="border-b last:border-0">
                    <td className="py-2 text-muted-foreground text-xs">{entry.createdAt.toLocaleString()}</td>
                    <td className="py-2 font-mono">{entry.ipv4 ?? "—"}</td>
                    <td className="py-2 font-mono text-xs">{entry.ipv6 ?? "—"}</td>
                    <td className="py-2 font-mono text-xs">{entry.callerIp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Danger zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={deleteById}>
            <Button type="submit" variant="destructive" size="sm">Delete host</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
