"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { HugeiconsIcon } from "@hugeicons/react"
import { CrownIcon } from "@hugeicons/core-free-icons"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
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
    <Dialog open onOpenChange={() => router.back()}>
      <DialogContent showCloseButton className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Create a team</DialogTitle>
          <DialogDescription>
            Teams let you share hosts and groups with collaborators.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 border border-border px-4 py-3 bg-muted/30">
          <HugeiconsIcon icon={CrownIcon} strokeWidth={1.5} className="size-4 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            Teams require a paid plan to add hosts. You can create the team now and subscribe from the team&apos;s Settings page.
          </p>
        </div>

        <form id="new-team-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Team name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Acme Corp"
              required
              autoFocus
              disabled={pending}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" form="new-team-form" disabled={pending}>
            {pending ? "Creating…" : "Create team"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
