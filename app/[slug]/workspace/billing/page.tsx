import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { resolveWorkspace } from "@/lib/workspace"
import { db } from "@/lib/db"
import { teams } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { PlanSection } from "@/app/[slug]/settings/settings-forms"
import { PAID_PLANS, getPriceId, type PlanKey } from "@/lib/plans"

export const metadata: Metadata = {
  title: "Billing — NovaDNS",
  robots: { index: false },
}

export default async function WorkspaceBillingPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const session = await getSession()
  if (!session) redirect("/login")

  const workspace = await resolveWorkspace(slug, session.id)
  if (!workspace) redirect("/login")

  const priceIds: Partial<Record<PlanKey, string>> = {}
  for (const plan of PAID_PLANS) {
    try { priceIds[plan] = getPriceId(plan) } catch { /* env var not set */ }
  }

  if (workspace.type === "team") {
    const team = await db.query.teams.findFirst({ where: eq(teams.id, workspace.teamId) })
    if (!team) redirect("/login")
    const isOwner = workspace.role === "owner"

    return (
      <>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Billing</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your workspace plan</p>
        </div>
        <PlanSection
          plan={team.plan}
          email={session.email}
          clientId={session.id}
          priceIds={priceIds}
          teamId={workspace.teamId}
          teamName={team.name}
          canManage={isOwner}
          redirectBase={`/${slug}/workspace/billing`}
        />
      </>
    )
  }

  return (
    <>
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Billing</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your workspace plan</p>
      </div>
      <PlanSection
        plan={workspace.plan}
        email={session.email}
        clientId={session.id}
        priceIds={priceIds}
        redirectBase={`/${slug}/workspace/billing`}
      />
    </>
  )
}
