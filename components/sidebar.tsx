"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { ListViewIcon, CrownIcon, FolderLibraryIcon, WebhookIcon, UserGroupIcon, Settings01Icon } from "@hugeicons/core-free-icons"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { UserMenu } from "@/components/user-menu"
import { FeedbackButton } from "@/components/feedback-button"
import { WorkspaceSwitcher } from "@/components/workspace-switcher"
import { getPlanLimit, PLANS, isPaidPlan } from "@/lib/plans"
import type { WorkspaceContext } from "@/lib/workspace"

const SECTION_LABELS: Record<string, string> = {
  groups:   "Groups",
  webhooks: "Webhooks",
  team:     "Team",
  settings: "Settings",
}

function HeaderSection() {
  const pathname = usePathname()
  const segment = pathname.split("/").filter(Boolean).slice(1).join("/")
  const topSegment = segment.split("/")[0] ?? ""
  const label = SECTION_LABELS[topSegment]
  if (!label) return null
  return <span className="text-sm text-muted-foreground">{label}</span>
}

interface AppSidebarProps {
  slug: string
  workspace: WorkspaceContext
  workspaces: WorkspaceContext[]
  email: string
  userName: string
  personalSlug: string
  activeCount: number
  planLimit: number
}

export function AppSidebar({ slug, workspace, workspaces, email, userName, personalSlug, activeCount, planLimit }: AppSidebarProps) {
  const pathname = usePathname()

  const navItems = workspace.type === "personal"
    ? [
        { href: `/${slug}`,           label: "Hosts",    icon: ListViewIcon,      exact: true  },
        { href: `/${slug}/groups`,    label: "Groups",   icon: FolderLibraryIcon, exact: false },
        { href: `/${slug}/webhooks`,  label: "Webhooks", icon: WebhookIcon,       exact: false },
      ]
    : [
        { href: `/${slug}`,           label: "Hosts",    icon: ListViewIcon,      exact: true  },
        { href: `/${slug}/groups`,    label: "Groups",   icon: FolderLibraryIcon, exact: false },
        { href: `/${slug}/webhooks`,  label: "Webhooks", icon: WebhookIcon,       exact: false },
        { href: `/${slug}/team`,      label: "Team",     icon: UserGroupIcon,     exact: false },
      ]

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <WorkspaceSwitcher
              userName={userName}
              currentSlug={slug}
              workspaces={workspaces}
              personalSlug={personalSlug}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu className="px-2">
          {navItems.map(({ href, label, icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            const isHosts = exact && href === `/${slug}`
            return (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton render={<Link href={href} />} isActive={active} tooltip={label}>
                  <HugeiconsIcon icon={icon} strokeWidth={2} />
                  <span>{label}</span>
                  {isHosts && planLimit > 0 && (
                    <span className="ml-auto text-xs tabular-nums text-muted-foreground group-data-[collapsible=icon]:hidden">
                      {activeCount}/{planLimit}
                    </span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <SidebarMenu className="px-2 pb-2">
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href={`/${personalSlug}/settings`} />}
              isActive={pathname.includes("/settings")}
              tooltip="Settings"
            >
              <HugeiconsIcon icon={Settings01Icon} strokeWidth={2} />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

export function DashboardShell({
  slug,
  workspace,
  workspaces,
  email,
  userName,
  activeCount,
  sidebarOpen = true,
  children,
}: {
  slug: string
  workspace: WorkspaceContext
  workspaces: WorkspaceContext[]
  email: string
  userName: string
  activeCount: number
  sidebarOpen?: boolean
  children: React.ReactNode
}) {
  const plan = workspace.plan
  const limit     = (workspace.type === "team" && !isPaidPlan(plan)) ? 0 : getPlanLimit(plan)
  const atLimit   = activeCount >= limit
  const nearLimit = limit > 0 && activeCount >= limit - 1

  // The personal workspace is always the first one with type "personal"
  const personalWs = workspaces.find(ws => ws.type === "personal")
  const personalSlug = personalWs?.slug ?? slug
  const settingsHref = `/${personalSlug}/settings`

  return (
    <SidebarProvider defaultOpen={sidebarOpen}>
      <AppSidebar
        slug={slug}
        workspace={workspace}
        workspaces={workspaces}
        email={email}
        userName={userName}
        personalSlug={personalSlug}
        activeCount={activeCount}
        planLimit={limit}
      />
      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />
          <HeaderSection />
          <div className="ml-auto flex items-center gap-3">
            <FeedbackButton />
            <Link href="/docs" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Docs
            </Link>
            <UserMenu email={email} plan={plan} settingsHref={settingsHref} />
          </div>
        </header>
        {nearLimit && (
          <div className={`flex items-center gap-3 px-4 py-2.5 text-sm ${atLimit ? "bg-destructive/10 text-destructive" : "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"}`}>
            <HugeiconsIcon icon={CrownIcon} strokeWidth={2} className="size-4 shrink-0" />
            {atLimit
              ? <>{PLANS[plan as keyof typeof PLANS]?.label ?? "Your"} plan limit of {limit} hosts reached.{!isPaidPlan(plan) && <> <a href={settingsHref} className="underline underline-offset-2">Upgrade</a> to add more.</>}</>
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
