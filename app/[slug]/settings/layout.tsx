import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { clients } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { resolveWorkspace } from "@/lib/workspace"
import { SettingsNav } from "./settings-nav"

export default async function SettingsLayout({
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

  // Settings is personal-only — redirect team workspace to personal settings
  if (workspace.type === "team") {
    const client = await db.query.clients.findFirst({ where: eq(clients.id, session.id) })
    redirect(`/${client?.slug ?? session.id}/settings`)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight">Account Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your account and preferences</p>
      </div>
      <div className="flex gap-10">
        <SettingsNav slug={slug} />
        <div className="flex-1 min-w-0 space-y-8">
          {children}
        </div>
      </div>
    </div>
  )
}
