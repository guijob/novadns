// Server Component
import Link from "next/link"
import { Inter } from "next/font/google"
import { Button } from "@/components/ui/button"
import { DocsSidebarNav } from "./_components/docs-sidebar-nav"

const inter = Inter({ subsets: ["latin"] })

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${inter.className} min-h-screen bg-background text-foreground flex flex-col`}>

      {/* ── Top nav ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 h-12 border-b border-border bg-background/80 backdrop-blur-md flex items-center shrink-0">
        <div className="w-full px-6 flex items-center justify-between gap-4">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              NovaDNS
            </Link>
            <span className="text-border select-none">/</span>
            <span className="text-foreground font-medium">Docs</span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/" />}>
              Back to site
            </Button>
            <Button size="sm" nativeButton={false} render={<Link href="/dashboard" />}>
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* Sidebar */}
        <aside className="hidden md:block w-56 shrink-0 border-r border-border">
          <div className="sticky top-12 pt-6 pb-10 px-2 overflow-y-auto max-h-[calc(100vh-3rem)]">
            <DocsSidebarNav />
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0 px-8 py-10 lg:px-12">
          <div className="max-w-3xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
