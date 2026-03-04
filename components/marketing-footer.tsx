import { Logo } from "@/components/logo"
import Link from "next/link"

const columns = [
  {
    heading: "Product",
    links: [
      { href: "/#features", label: "Features" },
      { href: "/pricing",   label: "Pricing"  },
      { href: "/docs",      label: "Docs"     },
    ],
  },
  {
    heading: "Tools",
    links: [
      { href: "/tools/ip-checker",    label: "What's My IP"   },
      { href: "/tools/cgnat-checker",label: "CGNAT Checker"  },
      { href: "/tools/port-checker", label: "Port Checker"   },
      { href: "/tools/ipv6-checker", label: "IPv6 Test"      },
    ],
  },
  {
    heading: "Account",
    links: [
      { href: "/login",     label: "Log in"    },
      { href: "/register",  label: "Register"  },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
  {
    heading: "Compare",
    links: [
      { href: "/compare",         label: "Compare all" },
      { href: "/compare/noip",    label: "vs No-IP"    },
      { href: "/compare/dyndns",  label: "vs DynDNS"   },
      { href: "/compare/duckdns", label: "vs Duck DNS" },
      { href: "/compare/dynu",    label: "vs Dynu"     },
      { href: "/compare/afraid",  label: "vs FreeDNS"  },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about",   label: "About"   },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/terms",   label: "Terms of Service" },
      { href: "/privacy", label: "Privacy Policy"   },
      { href: "/cookies", label: "Cookie Policy"    },
      { href: "/refunds", label: "Refund Policy"    },
    ],
  },
]

export function MarketingFooter() {
  return (
    <footer className="border-t border-border py-12">
      <div className="max-w-6xl mx-auto px-6">

        {/* Top row: logo + columns */}
        <div className="flex flex-col md:flex-row md:items-start gap-10 md:gap-8">

          {/* Brand */}
          <div className="shrink-0 md:w-44">
            <Link href="/" className="flex items-center gap-2.5 mb-3">
              <Logo className="h-6 w-auto" />
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Dynamic DNS for the modern infrastructure.
            </p>
          </div>

          {/* Link columns — 2-col on mobile, auto on lg */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-8 text-xs text-muted-foreground">
            {columns.map(({ heading, links }) => (
              <div key={heading} className="space-y-2.5">
                <p className="font-mono uppercase tracking-wide text-foreground text-[0.65rem]">
                  {heading}
                </p>
                <div className="flex flex-col gap-2">
                  {links.map(({ href, label }) => (
                    <Link key={href} href={href} className="hover:text-foreground transition-colors">
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row: copyright */}
        <div className="mt-10 pt-6 border-t border-border flex items-center justify-between gap-4">
          <span className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} NovaDNS
          </span>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="/terms"   className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>

      </div>
    </footer>
  )
}
