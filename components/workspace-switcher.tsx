"use client"

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
import type { WorkspaceContext } from "@/lib/workspace"

interface WorkspaceSwitcherProps {
  userName: string
  currentSlug: string
  workspaces: WorkspaceContext[]
  personalSlug: string
}

export function WorkspaceSwitcher({ userName, currentSlug, workspaces, personalSlug }: WorkspaceSwitcherProps) {
  const router = useRouter()

  const current = workspaces.find(ws => ws.slug === currentSlug)
  const isPersonal = current?.type === "personal"
  const label = isPersonal ? "Personal" : (current?.slug ?? currentSlug)

  const trigger = (
    <SidebarMenuButton
      size="lg"
      className="data-[popup-open]:bg-sidebar-accent data-[popup-open]:text-sidebar-accent-foreground"
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

        {workspaces.map(ws => (
          <DropdownMenuItem
            key={ws.slug}
            onClick={() => router.push(`/${ws.slug}`)}
            className="gap-2"
          >
            <HugeiconsIcon
              icon={ws.type === "personal" ? UserIcon : UserGroupIcon}
              strokeWidth={2}
              className="size-4 shrink-0"
            />
            <span className="flex-1 truncate">
              {ws.type === "personal" ? "Personal" : ws.slug}
            </span>
            {ws.slug === currentSlug && (
              <HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={2} className="size-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push(`/${personalSlug}/team/new`)} className="gap-2">
          <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="size-4 shrink-0" />
          <span>Create team</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
