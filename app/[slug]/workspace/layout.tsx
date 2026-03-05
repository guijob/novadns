import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { resolveWorkspace } from "@/lib/workspace"

export default async function WorkspaceSettingsLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const session = await getSession()
  if (!session) redirect("/login")

  const workspace = await resolveWorkspace(slug, session.id)
  if (!workspace) redirect("/login")

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {children}
    </div>
  )
}
