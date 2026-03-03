import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { resolveWorkspace } from "@/lib/workspace"
import { db } from "@/lib/db"

export const metadata: Metadata = {
  title: "Settings — NovaDNS",
  robots: { index: false },
}
import { clients } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { ProfileForm, PasswordForm, PlanSection, ConnectedAccountsSection, UsernameForm, MfaSection } from "./settings-forms"
import { PAID_PLANS, getPriceId, type PlanKey } from "@/lib/plans"

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const session = await getSession()
  if (!session) redirect("/login")

  const workspace = await resolveWorkspace(slug, session.id)
  if (!workspace) redirect("/login")

  // Settings is personal-only — redirect team workspace to personal settings
  if (workspace.type === "team") {
    const client = await db.query.clients.findFirst({ where: eq(clients.id, session.id) })
    redirect(`/${client?.slug ?? session.id}/settings`)
  }

  const priceIds: Partial<Record<PlanKey, string>> = {}
  for (const plan of PAID_PLANS) {
    try { priceIds[plan] = getPriceId(plan) } catch { /* env var not set */ }
  }

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your account and plan</p>
      </div>

      <PlanSection
        plan={session.plan}
        email={session.email}
        clientId={session.id}
        priceIds={priceIds}
        redirectBase={`/${slug}/settings`}
      />
      <UsernameForm currentSlug={slug} />
      <ProfileForm initialName={session.name} initialEmail={session.email} />
      <PasswordForm hasPassword={!!session.passwordHash} />
      <MfaSection mfaEnabled={session.mfaEnabled} />
      <ConnectedAccountsSection
        googleId={session.googleId ?? null}
        microsoftId={session.microsoftId ?? null}
        hasPassword={!!session.passwordHash}
      />
    </div>
  )
}
