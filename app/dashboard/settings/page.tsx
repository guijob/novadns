import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { ProfileForm, PasswordForm } from "./settings-forms"

export default async function SettingsPage() {
  const session = await getSession()
  if (!session) redirect("/login")

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account details</p>
      </div>
      <ProfileForm initialName={session.name} initialEmail={session.email} />
      <PasswordForm />
    </div>
  )
}
