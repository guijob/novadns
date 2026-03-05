import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { PlanSection } from "../settings-forms"
import { PAID_PLANS, getPriceId, type PlanKey } from "@/lib/plans"

export const metadata: Metadata = {
  title: "Billing — NovaDNS",
  robots: { index: false },
}

export default async function BillingPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const session = await getSession()
  if (!session) redirect("/login")

  const priceIds: Partial<Record<PlanKey, string>> = {}
  for (const plan of PAID_PLANS) {
    try { priceIds[plan] = getPriceId(plan) } catch { /* env var not set */ }
  }

  return (
    <PlanSection
      plan={session.plan}
      email={session.email}
      clientId={session.id}
      priceIds={priceIds}
      redirectBase={`/${slug}/settings/billing`}
    />
  )
}
