"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"

const pages = [
  { href: "/docs",                  label: "Overview"              },
  { href: "/docs/getting-started",  label: "Quick Start"           },
  { href: "/docs/what-is-ddns",     label: "What is DDNS?"         },
  { href: "/docs/api",              label: "API Reference"         },
  { href: "/docs/dyndns",           label: "DynDNS Compatibility"  },
  { href: "/docs/ipv6",             label: "IPv6 & Subnets"        },
  { href: "/docs/plans",            label: "Plans & Limits"        },
  { href: "/docs/clients",          label: "Client Setup"          },
  { href: "/docs/routers",          label: "Router Setup"          },
  { href: "/docs/groups",           label: "Groups"                },
  { href: "/docs/webhooks",         label: "Webhooks"              },
  { href: "/docs/teams",            label: "Teams"                 },
  { href: "/docs/security",         label: "Security"              },
  { href: "/docs/troubleshooting",  label: "Troubleshooting"       },
  { href: "/docs/home-server",      label: "Home Server Guide"     },
  { href: "/docs/cameras",          label: "IP Cameras Guide"      },
  { href: "/docs/iot",              label: "IoT Devices Guide"     },
  { href: "/docs/static-vs-dynamic",label: "Static vs Dynamic IP"  },
  { href: "/docs/why-ipv6",         label: "Why IPv6?"             },
]

export function PageNav() {
  const pathname = usePathname()
  const idx  = pages.findIndex(p => p.href === pathname)
  const prev = idx > 0           ? pages[idx - 1] : undefined
  const next = idx < pages.length - 1 ? pages[idx + 1] : undefined

  return (
    <div className="border-t border-border mt-12 pt-6 flex items-center justify-between gap-4">
      {prev ? (
        <Link
          href={prev.href}
          className="group flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="size-8 border border-border flex items-center justify-center group-hover:border-primary/40 transition-colors shrink-0">
            <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} className="size-4" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground/60 mb-0.5">Previous</div>
            <div className="font-medium group-hover:text-primary transition-colors">{prev.label}</div>
          </div>
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          href={next.href}
          className="group flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors text-right"
        >
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground/60 mb-0.5">Next</div>
            <div className="font-medium group-hover:text-primary transition-colors">{next.label}</div>
          </div>
          <div className="size-8 border border-border flex items-center justify-center group-hover:border-primary/40 transition-colors shrink-0">
            <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={1.5} className="size-4" />
          </div>
        </Link>
      ) : (
        <div />
      )}
    </div>
  )
}
