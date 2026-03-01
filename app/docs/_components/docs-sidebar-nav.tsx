"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navGroups = [
  {
    label: "Getting Started",
    items: [
      { href: "/docs",                  label: "Overview"    },
      { href: "/docs/getting-started",  label: "Quick Start" },
    ],
  },
  {
    label: "Reference",
    items: [
      { href: "/docs/api",   label: "API Reference"   },
      { href: "/docs/ipv6",  label: "IPv6 & Subnets"  },
    ],
  },
  {
    label: "Guides",
    items: [
      { href: "/docs/clients", label: "Client Setup" },
    ],
  },
]

export function DocsSidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="space-y-6">
      {navGroups.map(group => (
        <div key={group.label}>
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2 px-3">
            {group.label}
          </p>
          <ul className="space-y-px">
            {group.items.map(item => {
              const active = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center h-8 px-3 text-sm transition-colors border-l-2 ${
                      active
                        ? "border-primary text-primary font-medium bg-primary/5"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
