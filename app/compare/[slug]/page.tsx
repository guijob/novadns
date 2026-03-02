import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { competitors, getCompetitor, type FeatureValue } from "./data"

export async function generateStaticParams() {
  return competitors.map(c => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const c = getCompetitor(slug)
  if (!c) return {}
  return {
    title: `${c.tagline} | NovaDNS`,
    description: c.summary,
  }
}

function FeatureCell({ value }: { value: FeatureValue }) {
  if (value === true)
    return <span className="text-green-600 dark:text-green-400 font-medium text-sm">Yes</span>
  if (value === false)
    return <span className="text-muted-foreground/60 text-sm">No</span>
  if (value === "partial")
    return <span className="text-yellow-600 dark:text-yellow-400 text-sm">Partial</span>
  return <span className="text-sm text-foreground">{value}</span>
}

export default async function ComparePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const c = getCompetitor(slug)
  if (!c) notFound()

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">

      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 h-12 border-b border-border bg-background/80 backdrop-blur-md flex items-center shrink-0">
        <div className="w-full px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              NovaDNS
            </Link>
            <span className="text-border select-none">/</span>
            <span className="text-foreground font-medium">Compare</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/login" />}>
              Log in
            </Button>
            <Button size="sm" nativeButton={false} render={<Link href="/register" />}>
              Get started
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="border-b border-border py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-xs font-mono uppercase tracking-widest text-primary mb-4">Compare</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{c.tagline}</h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">{c.summary}</p>
        </div>
      </section>

      {/* ── Feature table ───────────────────────────────────────────── */}
      <section className="border-b border-border py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-base font-semibold mb-6">Feature comparison</h2>

          <div className="border border-border">
            {/* Header */}
            <div className="grid grid-cols-[1fr_120px_120px] border-b border-border bg-muted/30">
              <div className="px-4 py-2.5 text-xs font-mono uppercase tracking-widest text-muted-foreground">Feature</div>
              <div className="px-4 py-2.5 text-xs font-mono uppercase tracking-widest text-primary border-l border-border">NovaDNS</div>
              <div className="px-4 py-2.5 text-xs font-mono uppercase tracking-widest text-muted-foreground border-l border-border">{c.name}</div>
            </div>

            {/* Rows */}
            {c.features.map((f, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_120px_120px] border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
              >
                <div className="px-4 py-3">
                  <span className="text-sm text-foreground">{f.label}</span>
                  {f.note && (
                    <span className="block text-xs text-muted-foreground mt-0.5">{f.note}</span>
                  )}
                </div>
                <div className="px-4 py-3 border-l border-border bg-primary/[0.02]">
                  <FeatureCell value={f.nova} />
                </div>
                <div className="px-4 py-3 border-l border-border">
                  <FeatureCell value={f.them} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section breakdowns ──────────────────────────────────────── */}
      <section className="border-b border-border py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8">
            {c.sections.map((s, i) => (
              <div key={i} className="border border-border p-6">
                <h3 className="text-sm font-semibold mb-3">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Verdict ─────────────────────────────────────────────────── */}
      <section className="border-b border-border py-16 bg-muted/20">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-xs font-mono uppercase tracking-widest text-primary mb-3">Verdict</p>
          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">{c.verdict}</p>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight mb-1">Try NovaDNS free</h2>
            <p className="text-sm text-muted-foreground">3 hosts, no credit card, no expiry.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Button nativeButton={false} render={<Link href="/register" />}>
              Get started free
            </Button>
            <Button variant="outline" nativeButton={false} render={<Link href="/pricing" />}>
              View pricing
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t border-border py-8">
        <div className="max-w-4xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
            {competitors.map(comp => (
              <Link
                key={comp.slug}
                href={`/compare/${comp.slug}`}
                className={`hover:text-foreground transition-colors ${comp.slug === slug ? "text-foreground font-medium" : ""}`}
              >
                vs {comp.name}
              </Link>
            ))}
          </div>
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            ← Back to NovaDNS
          </Link>
        </div>
      </footer>

    </div>
  )
}
