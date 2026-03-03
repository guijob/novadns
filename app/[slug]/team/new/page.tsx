"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { HugeiconsIcon } from "@hugeicons/react"
import { CrownIcon } from "@hugeicons/core-free-icons"
import { createTeam } from "@/lib/team-actions"

export default function NewTeamPage() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await createTeam(fd)
      if ("error" in res) {
        setError(res.error ?? "Something went wrong")
      } else {
        router.push(`/${res.teamSlug}/team`)
      }
    })
  }

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create a team</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Teams let you share hosts and groups with collaborators.
        </p>
      </div>

      <div className="flex gap-3 border border-border px-4 py-3 bg-muted/30">
        <HugeiconsIcon icon={CrownIcon} strokeWidth={1.5} className="size-4 text-primary shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          Teams require a paid plan to add hosts. You can create the team now and subscribe from the team&apos;s Settings page.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Team name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Acme Corp"
            required
            autoFocus
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Creating…" : "Create team"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={pending}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
