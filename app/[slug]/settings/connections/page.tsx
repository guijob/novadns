import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { ConnectedAccountsSection } from "../settings-forms"

export const metadata: Metadata = {
  title: "Connections — NovaDNS",
  robots: { index: false },
}

export default async function ConnectionsPage() {
  const session = await getSession()
  if (!session) redirect("/login")

  return (
    <ConnectedAccountsSection
      googleId={session.googleId ?? null}
      microsoftId={session.microsoftId ?? null}
      hasPassword={!!session.passwordHash}
    />
  )
}
