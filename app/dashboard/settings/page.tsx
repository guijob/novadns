import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { ProfileForm, PasswordForm, PlanSection } from "./settings-forms"

export default async function SettingsPage() {
  const session = await getSession()
  if (!session) redirect("/login")

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your account and plan</p>
      </div>

      <PlanSection plan={session.plan} email={session.email} />
      <ProfileForm initialName={session.name} initialEmail={session.email} />
      <PasswordForm />
    </div>
  )
}
