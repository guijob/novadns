"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Settings01Icon,
  LogoutIcon,
  Home01Icon,
  Sun01Icon,
  MoonIcon,
  ComputerIcon,
  CrownIcon,
} from "@hugeicons/core-free-icons"

interface UserMenuProps {
  email: string
  plan: string
  avatarUrl?: string | null
  settingsHref?: string
}

export function UserMenu({ email, plan, avatarUrl, settingsHref = "/dashboard/settings" }: UserMenuProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        <button className="flex size-7 items-center justify-center rounded-full overflow-hidden bg-muted text-xs font-semibold hover:opacity-80 transition-opacity select-none">
          {avatarUrl
            ? <img src={avatarUrl} alt="Avatar" className="size-full object-cover" />
            : email[0]?.toUpperCase() ?? "U"
          }
        </button>
      } />

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Signed in as</span>
            <span className="truncate font-medium">{email}</span>
            {plan === "pro" && (
              <span className="inline-flex items-center gap-1 text-xs text-primary font-medium mt-0.5">
                <HugeiconsIcon icon={CrownIcon} strokeWidth={2} className="size-3" />
                Pro plan
              </span>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href="/" />}>
            <HugeiconsIcon icon={Home01Icon} strokeWidth={2} />
            Homepage
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href={settingsHref} />}>
            <HugeiconsIcon icon={Settings01Icon} strokeWidth={2} />
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <HugeiconsIcon icon={theme === "dark" ? MoonIcon : theme === "light" ? Sun01Icon : ComputerIcon} strokeWidth={2} />
            Theme
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup value={theme} onValueChange={(v) => setTheme(v as "light" | "dark" | "system")}>
              <DropdownMenuRadioItem value="light">
                <HugeiconsIcon icon={Sun01Icon} strokeWidth={2} />
                Light
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark">
                <HugeiconsIcon icon={MoonIcon} strokeWidth={2} />
                Dark
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="system">
                <HugeiconsIcon icon={ComputerIcon} strokeWidth={2} />
                System
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuItem variant="destructive" onClick={logout}>
          <HugeiconsIcon icon={LogoutIcon} strokeWidth={2} />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
