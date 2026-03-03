import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { resolveWorkspace } from "@/lib/workspace"
import { getWebhooks } from "@/lib/actions"

export const metadata: Metadata = {
  title: "Webhooks — NovaDNS",
  robots: { index: false },
}
import { WebhooksTable } from "./webhooks-table"

export default async function WebhooksPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const session = await getSession()
  if (!session) redirect("/login")

  const workspace = await resolveWorkspace(slug, session.id)
  if (!workspace) redirect("/login")

  const webhooksList = await getWebhooks(slug)

  const total  = webhooksList.length
  const active = webhooksList.filter(w => w.active).length

  const stats = [
    { label: "Total webhooks", value: total  },
    { label: "Active",         value: active },
  ]

  const canManage = workspace.type === "personal" || workspace.role !== "member"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Webhooks</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Receive HTTP callbacks when DNS events occur
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

      <WebhooksTable slug={slug} webhooks={webhooksList} canManage={canManage} />
    </div>
  )
}
