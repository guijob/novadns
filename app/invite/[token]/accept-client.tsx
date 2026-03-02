"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { acceptInvite } from "@/lib/team-actions"

export function AcceptInviteClient({
  token,
  teamName,
  invitedEmail,
  isLoggedIn,
  loggedInEmail,
}: {
  token: string
  teamName: string
  invitedEmail: string
  isLoggedIn: boolean
  loggedInEmail: string | null
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const emailMismatch = isLoggedIn && loggedInEmail && loggedInEmail.toLowerCase() !== invitedEmail.toLowerCase()

  function handleAccept() {
    startTransition(async () => {
      const res = await acceptInvite(token)
      if ("error" in res) {
        setError(res.error ?? "Something went wrong")
      } else {
        router.push("/dashboard")
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center justify-center size-12 rounded-xl bg-primary text-primary-foreground text-xl font-bold">
            N
          </div>
          <h1 className="text-xl font-bold">Join {teamName}</h1>
          <p className="text-sm text-muted-foreground">
            You&apos;ve been invited to join the <strong>{teamName}</strong> workspace on NovaDNS.
          </p>
          <p className="text-xs text-muted-foreground">
            Invite sent to: <span className="font-mono">{invitedEmail}</span>
          </p>
        </div>

        {!isLoggedIn && (
          <div className="space-y-3">
            <p className="text-sm text-center text-muted-foreground">
              Sign in or create an account to accept this invitation.
            </p>
            <div className="flex flex-col gap-2">
              <Button render={<Link href={`/login?next=/invite/${token}`} />} className="w-full">
                Sign in
              </Button>
              <Button variant="outline" render={<Link href={`/register?next=/invite/${token}`} />} className="w-full">
                Create account
              </Button>
            </div>
          </div>
        )}

        {isLoggedIn && emailMismatch && (
          <div className="space-y-3">
            <div className="rounded-md bg-destructive/10 text-destructive text-sm p-3 text-center">
              This invite was sent to <span className="font-mono">{invitedEmail}</span>, but you&apos;re signed in as <span className="font-mono">{loggedInEmail}</span>.
            </div>
            <p className="text-sm text-center text-muted-foreground">
              Sign in with the correct account to accept this invitation.
            </p>
            <Button variant="outline" render={<Link href={`/login?next=/invite/${token}`} />} className="w-full">
              Sign in with different account
            </Button>
          </div>
        )}

        {isLoggedIn && !emailMismatch && (
          <div className="space-y-3">
            {error && (
              <div className="rounded-md bg-destructive/10 text-destructive text-sm p-3 text-center">
                {error}
              </div>
            )}
            <Button onClick={handleAccept} disabled={pending} className="w-full">
              {pending ? "Joining…" : `Accept & join ${teamName}`}
            </Button>
            <Button variant="ghost" render={<Link href="/dashboard" />} className="w-full">
              Decline
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
