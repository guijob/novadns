import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { PasswordForm, MfaSection } from "../settings-forms"

export const metadata: Metadata = {
  title: "Security — NovaDNS",
  robots: { index: false },
}

export default async function SecurityPage() {
  const session = await getSession()
  if (!session) redirect("/login")

  return (
    <>
      <PasswordForm hasPassword={!!session.passwordHash} />
      <MfaSection mfaEnabled={session.mfaEnabled} />
    </>
  )
}
