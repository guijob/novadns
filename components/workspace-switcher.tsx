"use client"

import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon, ArrowDown01Icon } from "@hugeicons/core-free-icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { PLANS, isPaidPlan } from "@/lib/plans"
import type { PlanKey } from "@/lib/plans"
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
  const label = current?.name ?? currentSlug

  const currentAvatar = current?.avatarUrl

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        <button className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent transition-colors">
          <div className="flex size-6 items-center justify-center rounded bg-primary text-primary-foreground text-xs font-bold shrink-0 overflow-hidden">
            {currentAvatar
              ? <img src={currentAvatar} alt={label} className="size-full object-cover" />
              : label[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="flex flex-col items-start min-w-0">
            <span className="text-sm font-medium truncate max-w-28 leading-tight">{label}</span>
            <span className="text-[10px] text-muted-foreground leading-tight">
              {isPersonal ? "Personal" : "Team"} · {PLANS[current?.plan as PlanKey]?.label ?? "Free"}
            </span>
          </div>
          <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} className="size-3.5 shrink-0 opacity-40" />
        </button>
      } />

      <DropdownMenuContent className="w-64 p-1.5" align="start" side="bottom" sideOffset={6}>
        <p className="px-2 pt-1 pb-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50">
          Workspaces
        </p>

        {workspaces.map(ws => {
          const wsIsPersonal = ws.type === "personal"
          const wsLabel = ws.name
          const isActive = ws.slug === currentSlug
          return (
            <DropdownMenuItem
              key={ws.slug}
              onClick={() => router.push(`/${ws.slug}`)}
              className={cn("gap-3 px-2 py-2 rounded-sm", isActive && "bg-primary/5")}
            >
              <div className={cn(
                "flex size-8 items-center justify-center rounded text-xs font-bold shrink-0 overflow-hidden",
                isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                {ws.avatarUrl
                  ? <img src={ws.avatarUrl} alt={wsLabel} className="size-full object-cover" />
                  : wsLabel[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-medium truncate">{wsLabel}</span>
                <span className="text-xs text-muted-foreground">{wsIsPersonal ? "Personal" : "Team"}</span>
              </div>
              <span className={cn(
                "text-[10px] font-mono px-1.5 py-0.5 shrink-0",
                isPaidPlan(ws.plan)
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              )}>
                {PLANS[ws.plan as PlanKey]?.label ?? "Free"}
              </span>
            </DropdownMenuItem>
          )
        })}

        <DropdownMenuSeparator className="my-1.5" />

        <DropdownMenuItem
          onClick={() => router.push(`/${personalSlug}/team/new`)}
          className="gap-3 px-2 py-2 rounded-sm"
        >
          <div className="flex size-8 items-center justify-center rounded border border-dashed border-border shrink-0">
            <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="size-3.5 text-muted-foreground" />
          </div>
          <span className="text-sm text-muted-foreground">Create team</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
