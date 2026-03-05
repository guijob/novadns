import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { resolveWorkspace } from "@/lib/workspace"
import { db } from "@/lib/db"
import { teams } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { WorkspaceNameForm, WorkspaceAvatarForm } from "./workspace-forms"

export const metadata: Metadata = {
  title: "Workspace Settings — NovaDNS",
  robots: { index: false },
}

export default async function WorkspaceGeneralPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const session = await getSession()
  if (!session) redirect("/login")

  const workspace = await resolveWorkspace(slug, session.id)
  if (!workspace) redirect("/login")

  if (workspace.type === "team") {
    const team = await db.query.teams.findFirst({ where: eq(teams.id, workspace.teamId) })
    if (!team) redirect("/login")

    const isOwner = workspace.role === "owner"

    if (isOwner) {
      return (
        <>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">General</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage your workspace details</p>
          </div>
          <WorkspaceAvatarForm slug={slug} initialUrl={team.avatarUrl ?? null} name={team.name} />
          <WorkspaceNameForm teamId={workspace.teamId} initialName={team.name} />
        </>
      )
    }

    return (
      <>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">General</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Your workspace details</p>
        </div>
        <div className="space-y-3">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50 select-none">
            Workspace
          </p>
          <div className="border border-border divide-y divide-border">
            <div className="grid grid-cols-[140px_1fr] items-center gap-4 px-4 py-3">
              <span className="text-sm text-muted-foreground">Name</span>
              <span className="text-sm">{team.name}</span>
            </div>
            <div className="grid grid-cols-[140px_1fr] items-center gap-4 px-4 py-3">
              <span className="text-sm text-muted-foreground">Your role</span>
              <span className="text-sm capitalize">{workspace.role}</span>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div>
        <h1 className="text-xl font-semibold tracking-tight">General</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your personal workspace</p>
      </div>
      <div className="space-y-3">
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50 select-none">
          Workspace
        </p>
        <div className="border border-border divide-y divide-border">
          <div className="grid grid-cols-[140px_1fr] items-center gap-4 px-4 py-3">
            <span className="text-sm text-muted-foreground">Type</span>
            <span className="text-sm">Personal</span>
          </div>
          <div className="grid grid-cols-[140px_1fr] items-center gap-4 px-4 py-3">
            <span className="text-sm text-muted-foreground">Slug</span>
            <span className="text-sm font-mono text-muted-foreground">{slug}</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Personal workspace settings like username and billing are managed in{" "}
          <a href={`/${slug}/settings`} className="underline underline-offset-2 hover:text-foreground">Account Settings</a>.
        </p>
      </div>
    </>
  )
}
