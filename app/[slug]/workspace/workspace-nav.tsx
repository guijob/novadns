"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface WorkspaceNavProps {
  slug: string
  isTeam: boolean
}

export function WorkspaceNav({ slug, isTeam }: WorkspaceNavProps) {
  const pathname = usePathname()
  const base = `/${slug}/workspace`

  const items = [
    { segment: "",          label: "General",  show: true      },
    { segment: "/members",  label: "Members",  show: isTeam    },
    { segment: "/billing",  label: "Billing",  show: true      },
    { segment: "/danger",   label: "Danger",   show: isTeam    },
  ].filter(i => i.show)

  return (
    <nav className="w-44 shrink-0">
      <p className="px-3 mb-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50 select-none">
        Workspace
      </p>
      <ul>
        {items.map(({ segment, label }) => {
          const href = base + segment
          const active = segment === "" ? pathname === href : pathname.startsWith(href)
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex items-center h-8 px-3 text-sm border-l-2 transition-colors",
                  active
                    ? "border-primary text-primary bg-primary/5 font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
