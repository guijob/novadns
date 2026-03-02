import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { getTeamContext } from "@/lib/team-context"
import { getTeamMembers } from "@/lib/team-actions"
import { TeamMembersClient } from "./members-client"

export default async function TeamPage() {
  const session = await getSession()
  if (!session) redirect("/login")

  const ctx = await getTeamContext(session.id)
  if (!ctx) redirect("/dashboard")

  const members = await getTeamMembers()

  return (
    <TeamMembersClient
      team={ctx.team}
      members={members}
      currentUserId={session.id}
      currentUserRole={ctx.role}
    />
  )
}
