"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { HugeiconsIcon } from "@hugeicons/react"
import { SearchIcon } from "@hugeicons/core-free-icons"

const navGroups = [
  {
    label: "Getting Started",
    items: [
      { href: "/docs",                  label: "Overview"              },
      { href: "/docs/getting-started",  label: "Quick Start"           },
      { href: "/docs/what-is-ddns",     label: "What is DDNS?"         },
    ],
  },
  {
    label: "Reference",
    items: [
      { href: "/docs/api",    label: "API Reference"          },
      { href: "/docs/dyndns", label: "DynDNS Compatibility"   },
      { href: "/docs/ipv6",   label: "IPv6 & Subnets"         },
      { href: "/docs/plans",  label: "Plans & Limits"         },
    ],
  },
  {
    label: "Guides",
    items: [
      { href: "/docs/clients",         label: "Client Setup"    },
      { href: "/docs/routers",         label: "Router Setup"    },
      { href: "/docs/groups",          label: "Groups"          },
      { href: "/docs/webhooks",        label: "Webhooks"        },
      { href: "/docs/teams",           label: "Teams"           },
      { href: "/docs/security",        label: "Security"        },
      { href: "/docs/troubleshooting", label: "Troubleshooting" },
    ],
  },
  {
    label: "Learn",
    items: [
      { href: "/docs/home-server",       label: "Home Server Guide"    },
      { href: "/docs/static-vs-dynamic", label: "Static vs Dynamic IP" },
      { href: "/docs/why-ipv6",          label: "Why IPv6?"            },
    ],
  },
]

export function DocsSearch() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen(o => !o)
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  const navigate = useCallback((href: string) => {
    setOpen(false)
    router.push(href)
  }, [router])

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="hidden sm:flex items-center gap-2 text-muted-foreground text-xs w-60 justify-between"
        onClick={() => setOpen(true)}
      >
        <span className="flex items-center gap-1.5">
          <HugeiconsIcon icon={SearchIcon} strokeWidth={2} className="size-3.5" />
          Search docs…
        </span>
        <kbd className="font-mono text-[10px] text-muted-foreground">⌘K</kbd>
      </Button>

      <Button
        variant="ghost"
        size="icon-sm"
        className="sm:hidden"
        onClick={() => setOpen(true)}
      >
        <HugeiconsIcon icon={SearchIcon} strokeWidth={2} className="size-4" />
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search documentation"
        description="Search for a page in the NovaDNS docs"
      >
        <Command>
          <CommandInput placeholder="Search documentation…" autoFocus />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {navGroups.map(group => (
              <CommandGroup key={group.label} heading={group.label}>
                {group.items.map(item => (
                  <CommandItem
                    key={item.href}
                    value={item.label}
                    onSelect={() => navigate(item.href)}
                  >
                    {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
