import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { resolveWorkspace } from "@/lib/workspace"
import { getTeamMembers } from "@/lib/team-actions"
import { WorkspaceMembersSection } from "../workspace-forms"

export const metadata: Metadata = {
  title: "Members — NovaDNS",
  robots: { index: false },
}

export default async function WorkspaceMembersPage({
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

  const members = await getTeamMembers(workspace.teamId)

  return (
    <>
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Members</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage team members and invitations</p>
      </div>
      <WorkspaceMembersSection
        teamId={workspace.teamId}
        members={members}
        currentUserId={session.id}
        currentUserRole={workspace.role}
      />
    </>
  )
}
