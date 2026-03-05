"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { segment: "",            label: "Account",     exact: true  },
  { segment: "/security",  label: "Security",    exact: false },
  { segment: "/billing",   label: "Billing",     exact: false },
  { segment: "/connections",label: "Connections", exact: false },
]

export function SettingsNav({ slug }: { slug: string }) {
  const pathname = usePathname()
  const base = `/${slug}/settings`

  return (
    <nav className="w-44 shrink-0">
      <p className="px-3 mb-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50 select-none">
        Settings
      </p>
      <ul>
        {NAV_ITEMS.map(({ segment, label, exact }) => {
          const href = base + segment
          const active = exact ? pathname === href : pathname.startsWith(href)
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
