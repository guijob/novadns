import Link from "next/link"
import { Button } from "@/components/ui/button"
import { competitors, type FeatureValue } from "./[slug]/data"

// Deduplicate feature labels preserving order
const allFeatures = Array.from(
  new Map(competitors.flatMap(c => c.features).map(f => [f.label, f.label])).keys()
)

function Cell({ value }: { value: FeatureValue }) {
  if (value === true)
    return <span className="text-green-600 dark:text-green-400 text-xs font-medium">Yes</span>
  if (value === false)
    return <span className="text-muted-foreground/50 text-xs">No</span>
  if (value === "partial")
    return <span className="text-yellow-600 dark:text-yellow-400 text-xs">Partial</span>
  return <span className="text-xs text-foreground">{value}</span>
}

export const metadata = {
  title: "NovaDNS vs All Competitors | Compare DDNS Services",
  description: "Side-by-side comparison of NovaDNS against No-IP, DynDNS, Duck DNS, Dynu, and FreeDNS.",
}

export default function CompareAllPage() {
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
      <section className="border-b border-border py-16">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-xs font-mono uppercase tracking-widest text-primary mb-4">Compare</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            NovaDNS vs every major DDNS provider
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
            A full side-by-side breakdown of features across the most popular dynamic DNS services.
          </p>
        </div>
      </section>

      {/* ── Big table ───────────────────────────────────────────────── */}
      <section className="py-16 border-b border-border overflow-x-auto">
        <div className="max-w-6xl mx-auto px-6">
          <div className="border border-border min-w-[700px]">

            {/* Header */}
            <div
              className="grid border-b border-border bg-muted/30"
              style={{ gridTemplateColumns: `1fr repeat(${competitors.length + 1}, minmax(90px, 1fr))` }}
            >
              <div className="px-4 py-3 text-xs font-mono uppercase tracking-widest text-muted-foreground">
                Feature
              </div>
              <div className="px-4 py-3 text-xs font-mono uppercase tracking-widest text-primary border-l border-border">
                NovaDNS
              </div>
              {competitors.map(c => (
                <div key={c.slug} className="px-4 py-3 border-l border-border">
                  <Link
                    href={`/compare/${c.slug}`}
                    className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {c.name}
                  </Link>
                </div>
              ))}
            </div>

            {/* Rows */}
            {allFeatures.map((label, i) => (
              <div
                key={i}
                className="grid border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                style={{ gridTemplateColumns: `1fr repeat(${competitors.length + 1}, minmax(90px, 1fr))` }}
              >
                <div className="px-4 py-3 text-sm text-foreground">{label}</div>

                {/* NovaDNS — take value from first competitor's feature set (nova value is the same everywhere) */}
                <div className="px-4 py-3 border-l border-border bg-primary/[0.02]">
                  <Cell value={competitors[0].features.find(f => f.label === label)?.nova ?? false} />
                </div>

                {/* Each competitor */}
                {competitors.map(c => {
                  const f = c.features.find(feat => feat.label === label)
                  return (
                    <div key={c.slug} className="px-4 py-3 border-l border-border">
                      <Cell value={f?.them ?? false} />
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            Information based on publicly available documentation. Click a provider name for a detailed comparison.
          </p>
        </div>
      </section>

      {/* ── Individual links ────────────────────────────────────────── */}
      <section className="py-16 border-b border-border">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-base font-semibold mb-6">Detailed comparisons</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {competitors.map(c => (
              <Link
                key={c.slug}
                href={`/compare/${c.slug}`}
                className="border border-border p-5 hover:border-primary/40 hover:bg-muted/20 transition-colors group"
              >
                <p className="text-sm font-semibold mb-2 group-hover:text-primary transition-colors">
                  NovaDNS vs {c.name}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{c.summary}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
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
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
            {competitors.map(c => (
              <Link key={c.slug} href={`/compare/${c.slug}`} className="hover:text-foreground transition-colors">
                vs {c.name}
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
