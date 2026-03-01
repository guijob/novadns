"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { ListViewIcon, CrownIcon, FolderLibraryIcon, WebhookIcon } from "@hugeicons/core-free-icons"
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
import { getPlanLimit, PLANS, isPaidPlan } from "@/lib/plans"

const navItems = [
  { href: "/dashboard",          label: "Hosts",    icon: ListViewIcon,      exact: true  },
  { href: "/dashboard/groups",   label: "Groups",   icon: FolderLibraryIcon, exact: false },
  { href: "/dashboard/webhooks", label: "Webhooks", icon: WebhookIcon,       exact: false },
]

interface AppSidebarProps {
  email: string
  plan: string
}

export function AppSidebar({ email, plan }: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">
                N
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold">NovaDNS</span>
                  {plan === "pro" && (
                    <span className="inline-flex items-center gap-0.5 rounded px-1 py-px text-[10px] font-semibold bg-primary/10 text-primary leading-none">
                      <HugeiconsIcon icon={CrownIcon} strokeWidth={2} className="size-2.5" />
                      Pro
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">Dashboard</span>
              </div>
            </SidebarMenuButton>
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

export function DashboardShell({ email, plan, activeCount, sidebarOpen = true, children }: { email: string; plan: string; activeCount: number; sidebarOpen?: boolean; children: React.ReactNode }) {
  const limit     = getPlanLimit(plan)
  const atLimit   = activeCount >= limit
  const nearLimit = activeCount >= limit - 1

  return (
    <SidebarProvider defaultOpen={sidebarOpen}>
      <AppSidebar email={email} plan={plan} />
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
      </div>
    </SidebarProvider>
  )
}
