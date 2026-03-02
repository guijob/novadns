import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { teamMembers, teams } from "@/lib/schema"
import { getSession } from "@/lib/auth"
import { AcceptInviteClient } from "./accept-client"

interface Props {
  params: Promise<{ token: string }>
}

export default async function InvitePage({ params }: Props) {
  const { token } = await params

  // Look up invite
  const invite = await db.query.teamMembers.findFirst({
    where: eq(teamMembers.inviteToken, token),
  })

  if (!invite || invite.accepted) {
    redirect("/dashboard?invite=invalid")
  }

  const team = await db.query.teams.findFirst({ where: eq(teams.id, invite.teamId) })
  if (!team) redirect("/dashboard?invite=invalid")

  const session = await getSession()

  return (
    <AcceptInviteClient
      token={token}
      teamName={team.name}
      invitedEmail={invite.email}
      isLoggedIn={!!session}
      loggedInEmail={session?.email ?? null}
    />
  )
}
