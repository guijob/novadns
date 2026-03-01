// Server Component
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"

interface PageNavProps {
  prev?: { href: string; label: string }
  next?: { href: string; label: string }
}

export function PageNav({ prev, next }: PageNavProps) {
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
