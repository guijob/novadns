"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { ListViewIcon, CrownIcon, FolderLibraryIcon, WebhookIcon, UserGroupIcon } from "@hugeicons/core-free-icons"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { UserMenu } from "@/components/user-menu"
import { FeedbackButton } from "@/components/feedback-button"
import { WorkspaceSwitcher } from "@/components/workspace-switcher"
import { getPlanLimit, PLANS, isPaidPlan } from "@/lib/plans"

const personalNavItems = [
  { href: "/dashboard",          label: "Hosts",    icon: ListViewIcon,      exact: true  },
  { href: "/dashboard/groups",   label: "Groups",   icon: FolderLibraryIcon, exact: false },
  { href: "/dashboard/webhooks", label: "Webhooks", icon: WebhookIcon,       exact: false },
]

const teamNavItems = [
  { href: "/dashboard",        label: "Hosts",    icon: ListViewIcon,    exact: true  },
  { href: "/dashboard/groups", label: "Groups",   icon: FolderLibraryIcon, exact: false },
  { href: "/dashboard/team",   label: "Team",     icon: UserGroupIcon,   exact: false },
]

interface Workspace {
  id: number
  name: string
  role: string
}

interface AppSidebarProps {
  email: string
  plan: string
  userName: string
  currentTeamId: number | null
  teams: Workspace[]
}

export function AppSidebar({ email, plan, userName, currentTeamId, teams }: AppSidebarProps) {
  const pathname = usePathname()
  const navItems = currentTeamId !== null ? teamNavItems : personalNavItems

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <WorkspaceSwitcher
              userName={userName}
              currentTeamId={currentTeamId}
              teams={teams}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu className="px-2">
          {navItems.map(({ href, label, icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            return (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton render={<Link href={href} />} isActive={active} tooltip={label}>
                  <HugeiconsIcon icon={icon} strokeWidth={2} />
                  <span>{label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}

export function DashboardShell({
  email, plan, userName, activeCount, currentTeamId, teams, sidebarOpen = true, children,
}: {
  email: string
  plan: string
  userName: string
  activeCount: number
  currentTeamId: number | null
  teams: Workspace[]
  sidebarOpen?: boolean
  children: React.ReactNode
}) {
  const limit     = getPlanLimit(plan)
  const atLimit   = activeCount >= limit
  const nearLimit = activeCount >= limit - 1

  return (
    <SidebarProvider defaultOpen={sidebarOpen}>
      <AppSidebar email={email} plan={plan} userName={userName} currentTeamId={currentTeamId} teams={teams} />
      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />
          <div className="ml-auto flex items-center gap-3">
            <FeedbackButton />
            <Link href="/docs" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Docs
            </Link>
            <UserMenu email={email} plan={plan} />
          </div>
        </header>
        {nearLimit && (
          <div className={`flex items-center gap-3 px-4 py-2.5 text-sm ${atLimit ? "bg-destructive/10 text-destructive" : "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"}`}>
            <HugeiconsIcon icon={CrownIcon} strokeWidth={2} className="size-4 shrink-0" />
            {atLimit
              ? <>{PLANS[plan as keyof typeof PLANS]?.label ?? "Your"} plan limit of {limit} hosts reached.{!isPaidPlan(plan) && <> <a href="/dashboard/settings" className="underline underline-offset-2">Upgrade</a> to add more.</>}</>
              : <>You&apos;re using {activeCount} of {limit} hosts on the {PLANS[plan as keyof typeof PLANS]?.label ?? plan} plan.</>
            }
          </div>
        )}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
        <footer className="shrink-0 px-6 py-3 border-t border-border flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {[
            { href: "/terms",    label: "Terms" },
            { href: "/privacy",  label: "Privacy" },
            { href: "/cookies",  label: "Cookies" },
            { href: "/refunds",  label: "Refunds" },
          ].map(({ href, label }) => (
            <Link key={href} href={href} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              {label}
            </Link>
          ))}
          <span className="text-xs text-muted-foreground ml-auto">© {new Date().getFullYear()} NovaDNS</span>
        </footer>
      </div>
    </SidebarProvider>
  )
}
