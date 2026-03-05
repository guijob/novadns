"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { ListViewIcon, CrownIcon, FolderLibraryIcon, WebhookIcon, Activity03Icon, Settings01Icon } from "@hugeicons/core-free-icons"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

import { cn } from "@/lib/utils"
import { UserMenu } from "@/components/user-menu"
import { FeedbackButton } from "@/components/feedback-button"
import { WorkspaceSwitcher } from "@/components/workspace-switcher"
import { getPlanLimit, PLANS, isPaidPlan } from "@/lib/plans"
import type { WorkspaceContext } from "@/lib/workspace"

const SECTION_LABELS: Record<string, string> = {
  groups:     "Groups",
  webhooks:   "Webhooks",
  monitoring: "Monitoring",
  workspace:  "Settings",
  settings:   "Settings",
}

function HeaderSection() {
  const pathname = usePathname()
  const segment = pathname.split("/").filter(Boolean).slice(1).join("/")
  const topSegment = segment.split("/")[0] ?? ""
  const label = SECTION_LABELS[topSegment]
  if (!label) return null
  return (
    <div className="flex items-center gap-1.5 ml-1">
      <span className="text-muted-foreground/30">/</span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  )
}

interface AppSidebarProps {
  slug: string
  workspace: WorkspaceContext
  activeCount: number
  planLimit: number
}

export function AppSidebar({ slug, workspace, activeCount, planLimit }: AppSidebarProps) {
  const pathname = usePathname()

  const navItems = [
    { href: `/${slug}`,             label: "Hosts",      icon: ListViewIcon,      exact: true  },
    { href: `/${slug}/groups`,      label: "Groups",     icon: FolderLibraryIcon, exact: false },
    { href: `/${slug}/webhooks`,    label: "Webhooks",   icon: WebhookIcon,       exact: false },
    { href: `/${slug}/monitoring`,  label: "Monitoring", icon: Activity03Icon,    exact: false },
    { href: `/${slug}/workspace`,   label: "Settings",   icon: Settings01Icon,    exact: false },
  ]

  const isTeam = workspace.type === "team"
  const workspaceSubItems = [
    { href: `/${slug}/workspace`,          label: "General",  exact: true  },
    ...(isTeam ? [{ href: `/${slug}/workspace/members`, label: "Members", exact: false }] : []),
    { href: `/${slug}/workspace/billing`,  label: "Billing",  exact: false },
    ...(isTeam ? [{ href: `/${slug}/workspace/danger`,  label: "Danger",   exact: false }] : []),
  ]

  const inWorkspace = pathname.startsWith(`/${slug}/workspace`)

  return (
    <Sidebar collapsible="offcanvas" className="!top-12 !h-[calc(100svh-3rem)]">
      <SidebarContent className="pt-4">
        <p className="px-4 mb-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50 select-none">
          Navigation
        </p>
        <SidebarMenu>
          {navItems.map(({ href, label, icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            const isHosts = exact && href === `/${slug}`
            const isWorkspaceSettings = href === `/${slug}/workspace`
            return (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton
                  render={<Link href={href} />}
                  isActive={active}
                  tooltip={label}
                  className={cn(
                    "!rounded-none h-9 gap-3 px-4 border-l-2 transition-colors",
                    active
                      ? "border-primary bg-primary/5 text-primary !font-medium"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <HugeiconsIcon
                    icon={icon}
                    strokeWidth={active ? 2 : 1.5}
                    className={active ? "text-primary" : "text-muted-foreground"}
                  />
                  <span>{label}</span>
                  {isHosts && planLimit > 0 && (
                    <span className={cn(
                      "ml-auto text-[10px] font-mono tabular-nums px-1.5 py-0.5",
                      active
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}>
                      {activeCount}/{planLimit}
                    </span>
                  )}
                </SidebarMenuButton>
                {isWorkspaceSettings && inWorkspace && (
                  <SidebarMenuSub className="mx-0 mt-0 mb-0 border-0 px-0 py-0.5 gap-0 translate-x-0 bg-muted/10 group-data-[collapsible=icon]:hidden">
                    {workspaceSubItems.map((sub, index) => {
                      const subActive = sub.exact ? pathname === sub.href : pathname.startsWith(sub.href)
                      const isDanger = sub.label === "Danger"
                      const num = String(index + 1).padStart(2, "0")
                      return (
                        <SidebarMenuSubItem
                          key={sub.href}
                          className="animate-in fade-in slide-in-from-left-2 duration-150 fill-mode-both"
                          style={{ animationDelay: `${index * 45}ms` }}
                        >
                          <SidebarMenuSubButton
                            render={<Link href={sub.href} />}
                            isActive={subActive}
                            className={cn(
                              "h-8 pl-10 pr-4 rounded-none w-full transition-colors duration-150",
                              subActive
                                ? isDanger
                                  ? "!bg-destructive/10 !text-destructive !font-medium"
                                  : "!bg-primary/10 !text-primary !font-medium"
                                : isDanger
                                  ? "!text-destructive/50 hover:!bg-destructive/5 hover:!text-destructive/80"
                                  : "!text-muted-foreground hover:!bg-muted/50 hover:!text-foreground"
                            )}
                          >
                            <span className={cn(
                              "text-[10px] font-mono tabular-nums mr-2.5 shrink-0 transition-colors duration-150 w-4",
                              subActive
                                ? isDanger ? "!text-destructive/50" : "!text-primary/50"
                                : "text-muted-foreground/25"
                            )}>
                              {num}
                            </span>
                            <span className="text-xs">{sub.label}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-0 border-t border-border">
        <div className="px-4 py-2 flex items-center gap-3 group-data-[collapsible=icon]:hidden">
          {[
            { href: "/terms",   label: "Terms" },
            { href: "/privacy", label: "Privacy" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              {label}
            </Link>
          ))}
          <span className="text-[11px] font-mono text-muted-foreground/35 ml-auto">© {new Date().getFullYear()}</span>
        </div>
      </SidebarFooter>

    </Sidebar>
  )
}

export function DashboardShell({
  slug,
  workspace,
  workspaces,
  email,
  userName,
  avatarUrl = null,
  activeCount,
  sidebarOpen = true,
  children,
}: {
  slug: string
  workspace: WorkspaceContext
  workspaces: WorkspaceContext[]
  email: string
  userName: string
  avatarUrl?: string | null
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

  const pathname = usePathname()
  const isSettings = pathname.includes("/settings")

  return (
    <SidebarProvider defaultOpen={sidebarOpen}>
      <div className="flex flex-col min-h-svh w-full">

        {/* ── Top header — full width ─────────────────────────────── */}
        <header className="sticky top-0 z-20 flex h-12 shrink-0 items-center border-b bg-background/95 backdrop-blur-sm px-3">
          {/* Left — breadcrumb */}
          {!isSettings && <SidebarTrigger className="md:hidden mr-1" />}
          <WorkspaceSwitcher
            userName={userName}
            currentSlug={slug}
            workspaces={workspaces}
            personalSlug={personalSlug}
          />
          <HeaderSection />

          {/* Right — segmented strip */}
          <div className="ml-auto flex items-stretch h-full">
            <div className="flex items-center px-3">
              <FeedbackButton />
            </div>
            <Link
              href="/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center px-3 border-l border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            >
              Docs
            </Link>
            <div className="flex items-center px-3 border-l border-border">
              <UserMenu email={email} plan={plan} avatarUrl={avatarUrl} settingsHref={settingsHref} />
            </div>
          </div>
        </header>

        {/* ── Sidebar + content row ───────────────────────────────── */}
        <div className="flex flex-1 min-h-0">
          {!isSettings && <AppSidebar
            slug={slug}
            workspace={workspace}
            activeCount={activeCount}
            planLimit={limit}
          />}
          <div className="flex flex-col flex-1 min-w-0">
            {nearLimit && (
              <div className={`flex items-center gap-3 px-4 py-2.5 text-sm ${atLimit ? "bg-destructive/10 text-destructive" : "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"}`}>
                <HugeiconsIcon icon={CrownIcon} strokeWidth={2} className="size-4 shrink-0" />
                {atLimit
                  ? <>{PLANS[plan as keyof typeof PLANS]?.label ?? "Your"} plan limit of {limit} hosts reached.{!isPaidPlan(plan) && <> <a href={settingsHref} className="underline underline-offset-2">Upgrade</a> to add more.</>}</>
                  : <>You&apos;re using {activeCount} of {limit} hosts on the {PLANS[plan as keyof typeof PLANS]?.label ?? plan} plan.</>
                }
              </div>
            )}
            <main className="flex-1 p-6">
              {children}
            </main>
          </div>
        </div>

      </div>
    </SidebarProvider>
  )
}
