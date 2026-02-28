"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { LogoutIcon } from "@hugeicons/core-free-icons"

export function LogoutButton() {
  const router = useRouter()

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  return (
    <Button variant="ghost" size="sm" onClick={logout} className="w-full justify-start text-muted-foreground">
      <HugeiconsIcon icon={LogoutIcon} strokeWidth={2} data-icon="inline-start" />
      Sign out
    </Button>
  )
}
