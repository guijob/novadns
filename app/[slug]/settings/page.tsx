import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { DisplayNameForm, EmailForm, UsernameForm, AvatarForm } from "./settings-forms"

export const metadata: Metadata = {
  title: "Account Settings — NovaDNS",
  robots: { index: false },
}

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const session = await getSession()
  if (!session) redirect("/login")

  return (
    <>
      <AvatarForm initialUrl={session.avatarUrl ?? null} name={session.name} />
      <DisplayNameForm initialName={session.name} />
      <EmailForm initialEmail={session.email} initialName={session.name} />
      <UsernameForm currentSlug={slug} />
    </>
  )
}
