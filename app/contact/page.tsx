"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { HugeiconsIcon } from "@hugeicons/react"
import { Mail01Icon, Clock01Icon, BookOpen01Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"

const CONTACT_EMAIL = "support@novadns.io"

const DOT_GRID: React.CSSProperties = {
  backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
  backgroundSize: "24px 24px",
}

const topics = [
  { value: "general",  label: "General question" },
  { value: "bug",      label: "Bug report" },
  { value: "billing",  label: "Billing" },
  { value: "setup",    label: "Setup help" },
  { value: "other",    label: "Other" },
]

export default function ContactPage() {
  const [pending, startTransition] = useTransition()
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const email   = String(fd.get("email")   ?? "").trim()
    const message = String(fd.get("message") ?? "").trim()

    if (!email || !message) { setError("All fields are required."); return }

    startTransition(async () => {
      try {
        const { sendFeedbackEmail } = await import("@/lib/email")
        await sendFeedbackEmail(email, message)
        setDone(true)
      } catch {
        setError("Failed to send your message. Please try again or email us directly.")
      }
    })
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">

      {/* Nav */}
      <header className="sticky top-0 z-50 h-12 border-b border-border bg-background/80 backdrop-blur-md flex items-center shrink-0">
        <div className="w-full px-6 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
            <div className="size-6 bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold select-none">N</div>
            NovaDNS
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/docs" className="text-muted-foreground hover:text-foreground transition-colors">Docs</Link>
            <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/login" />}>Log in</Button>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 grid lg:grid-cols-[1fr_1fr]">

        {/* ── Left panel ───────────────────────────────────────── */}
        <div className="relative flex flex-col justify-between border-r border-border px-10 py-14 overflow-hidden bg-muted/20">
          <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]" style={DOT_GRID} />
          <div
            className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 80% 50% at 50% 120%, oklch(0.59 0.14 242 / 0.18), transparent)" }}
          />

          <div className="relative">
            <p className="text-xs font-mono uppercase tracking-widest text-primary mb-3">Support</p>
            <h1 className="text-3xl font-bold tracking-tight mb-4 leading-tight">
              We&apos;re here<br />to help.
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Whether you&apos;re stuck on a setup, found a bug, or just have a question —
              send us a message and we&apos;ll get back to you.
            </p>

            <div className="mt-10 space-y-5">
              <div className="flex items-start gap-3">
                <div className="size-7 border border-border flex items-center justify-center shrink-0 mt-0.5">
                  <HugeiconsIcon icon={Clock01Icon} strokeWidth={1.5} className="size-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">Response time</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Within one business day, usually faster.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="size-7 border border-border flex items-center justify-center shrink-0 mt-0.5">
                  <HugeiconsIcon icon={Mail01Icon} strokeWidth={1.5} className="size-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">Direct email</p>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2 mt-0.5 inline-block"
                  >
                    {CONTACT_EMAIL}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="size-7 border border-border flex items-center justify-center shrink-0 mt-0.5">
                  <HugeiconsIcon icon={BookOpen01Icon} strokeWidth={1.5} className="size-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">Documentation</p>
                  <Link
                    href="/docs"
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2 mt-0.5 inline-block"
                  >
                    novadns.io/docs
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <p className="relative text-xs text-muted-foreground mt-10">
            © {new Date().getFullYear()} NovaDNS
          </p>
        </div>

        {/* ── Right panel (form) ───────────────────────────────── */}
        <div className="flex items-start justify-center px-10 py-14">
          <div className="w-full max-w-md">

            {done ? (
              <div className="border border-border bg-muted/20">
                <div className="px-6 py-8 flex flex-col items-start gap-4">
                  <div className="size-9 border border-border flex items-center justify-center">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={1.5} className="size-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-1">Message sent</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Thanks for reaching out. We&apos;ll reply to your email within one business day.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setDone(false)}>
                    Send another message
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-6">New message</p>

                <form onSubmit={handleSubmit} className="space-y-5">

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs">Your email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="topic" className="text-xs">Topic</Label>
                    <select
                      id="topic"
                      name="topic"
                      className="w-full h-9 border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-sans"
                    >
                      {topics.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="message" className="text-xs">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Describe your question or issue…"
                      rows={7}
                      required
                    />
                  </div>

                  {error && (
                    <p className="text-xs text-destructive border border-destructive/30 bg-destructive/5 px-3 py-2">{error}</p>
                  )}

                  <Button type="submit" disabled={pending} className="w-full">
                    {pending ? "Sending…" : "Send message"}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Or email us directly at{" "}
                    <a href={`mailto:${CONTACT_EMAIL}`} className="text-foreground underline underline-offset-2 hover:text-primary transition-colors">
                      {CONTACT_EMAIL}
                    </a>
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-4 flex items-center justify-end gap-4 text-xs text-muted-foreground">
        <Link href="/terms"   className="hover:text-foreground transition-colors">Terms</Link>
        <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
        <Link href="/refunds" className="hover:text-foreground transition-colors">Refunds</Link>
      </footer>

    </div>
  )
}
