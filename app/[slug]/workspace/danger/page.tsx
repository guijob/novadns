import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { resolveWorkspace } from "@/lib/workspace"
import { db } from "@/lib/db"
import { teams, clients } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { WorkspaceDangerSection } from "../workspace-forms"

export const metadata: Metadata = {
  title: "Danger Zone — NovaDNS",
  robots: { index: false },
}

export default async function WorkspaceDangerPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const session = await getSession()
  if (!session) redirect("/login")

  const workspace = await resolveWorkspace(slug, session.id)
  if (!workspace) redirect("/login")

  if (workspace.type !== "team") redirect(`/${slug}/workspace`)

  const [team, client] = await Promise.all([
    db.query.teams.findFirst({ where: eq(teams.id, workspace.teamId) }),
    db.query.clients.findFirst({ where: eq(clients.id, session.id) }),
  ])
  if (!team) redirect("/login")

  const personalSlug = client?.slug ?? session.id.toString()
  const isOwner = workspace.role === "owner"

  return (
    <>
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Danger Zone</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Irreversible actions for this workspace</p>
      </div>
      <WorkspaceDangerSection
        teamId={workspace.teamId}
        teamName={team.name}
        isOwner={isOwner}
        personalSlug={personalSlug}
      />
    </>
  )
}
