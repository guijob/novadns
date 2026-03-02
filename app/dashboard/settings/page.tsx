import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { ProfileForm, PasswordForm, PlanSection, ConnectedAccountsSection } from "./settings-forms"
import { PAID_PLANS, getPriceId, type PlanKey } from "@/lib/plans"

export default async function SettingsPage() {
  const session = await getSession()
  if (!session) redirect("/login")

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

      <PlanSection plan={session.plan} email={session.email} clientId={session.id} priceIds={priceIds} />
      <ProfileForm initialName={session.name} initialEmail={session.email} />
      <PasswordForm hasPassword={!!session.passwordHash} />
      <ConnectedAccountsSection googleId={session.googleId ?? null} microsoftId={session.microsoftId ?? null} hasPassword={!!session.passwordHash} />
    </div>
  )
}
