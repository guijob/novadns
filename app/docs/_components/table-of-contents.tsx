"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

interface Heading {
  id: string
  text: string
  level: number
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [active, setActive]     = useState<string>("")
  const pathname = usePathname()

  useEffect(() => {
    const main = document.querySelector("main")
    if (!main) return

    const els = Array.from(main.querySelectorAll("h2, h3"))
    const items: Heading[] = els.map(el => {
      if (!el.id) {
        el.id = (el.textContent ?? "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      }
      return { id: el.id, text: el.textContent ?? "", level: parseInt(el.tagName[1]) }
    })
    setHeadings(items)
    setActive(items[0]?.id ?? "")

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
            break
          }
        }
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0 },
    )
    els.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [pathname])

  if (headings.length === 0) return null

  return (
    <nav className="space-y-1">
      <p className="text-xs font-semibold mb-3">On this page</p>
      {headings.map(h => (
        <a
          key={h.id}
          href={`#${h.id}`}
          className={`block text-xs py-0.5 leading-snug transition-colors ${h.level === 3 ? "pl-3" : ""} ${
            active === h.id
              ? "text-foreground font-medium"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {h.text}
        </a>
      ))}
    </nav>
  )
}
