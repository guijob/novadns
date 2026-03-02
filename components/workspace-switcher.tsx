"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserIcon, UserGroupIcon, PlusSignIcon, CheckmarkCircle01Icon, ArrowDown01Icon } from "@hugeicons/core-free-icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenuButton } from "@/components/ui/sidebar"
import { switchWorkspace } from "@/lib/team-actions"

interface Workspace {
  id: number
  name: string
  role: string
}

interface WorkspaceSwitcherProps {
  userName: string
  currentTeamId: number | null
  teams: Workspace[]
}

export function WorkspaceSwitcher({ userName, currentTeamId, teams }: WorkspaceSwitcherProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const currentTeam = teams.find(t => t.id === currentTeamId)
  const label = currentTeam ? currentTeam.name : "Personal"
  const isPersonal = currentTeamId === null

  function handleSwitch(teamId: number | null) {
    startTransition(async () => {
      await switchWorkspace(teamId)
      router.refresh()
    })
  }

  const trigger = (
    <SidebarMenuButton
      size="lg"
      className="data-[popup-open]:bg-sidebar-accent data-[popup-open]:text-sidebar-accent-foreground"
      disabled={pending}
    >
      <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold shrink-0">
        {isPersonal ? (userName[0]?.toUpperCase() ?? "U") : (label[0]?.toUpperCase() ?? "T")}
      </div>
      <div className="flex flex-col gap-0.5 leading-none min-w-0">
        <span className="font-semibold truncate">{label}</span>
        <span className="text-xs text-muted-foreground">{isPersonal ? "Personal" : "Team"}</span>
      </div>
      <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} className="ml-auto size-4 shrink-0 opacity-50" />
    </SidebarMenuButton>
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={trigger} />
      <DropdownMenuContent className="w-56" align="start" side="bottom" sideOffset={4}>
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Workspaces</DropdownMenuLabel>

        {/* Personal */}
        <DropdownMenuItem onClick={() => handleSwitch(null)} className="gap-2">
          <HugeiconsIcon icon={UserIcon} strokeWidth={2} className="size-4 shrink-0" />
          <span className="flex-1 truncate">Personal</span>
          {isPersonal && <HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={2} className="size-4 text-primary" />}
        </DropdownMenuItem>

        {/* Teams */}
        {teams.length > 0 && (
          <>
            <DropdownMenuSeparator />
            {teams.map(t => (
              <DropdownMenuItem key={t.id} onClick={() => handleSwitch(t.id)} className="gap-2">
                <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} className="size-4 shrink-0" />
                <span className="flex-1 truncate">{t.name}</span>
                {currentTeamId === t.id && <HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={2} className="size-4 text-primary" />}
              </DropdownMenuItem>
            ))}
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/dashboard/team/new")} className="gap-2">
          <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="size-4 shrink-0" />
          <span>Create team</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
