import { getWebhooks } from "@/lib/actions"
import { WebhooksTable } from "./webhooks-table"

export default async function WebhooksPage() {
  const webhooks = await getWebhooks()

  const total  = webhooks.length
  const active = webhooks.filter(w => w.active).length

  const stats = [
    { label: "Total webhooks",   value: total  },
    { label: "Active",           value: active },
  ]

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

      <WebhooksTable webhooks={webhooks} />
    </div>
  )
}
