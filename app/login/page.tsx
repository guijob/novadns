"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { HugeiconsIcon } from "@hugeicons/react"
import { RouterIcon, GlobeIcon, Key01Icon, Audit01Icon } from "@hugeicons/core-free-icons"

const DOT_GRID: React.CSSProperties = {
  backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
  backgroundSize: "24px 24px",
}

const GLOW: React.CSSProperties = {
  background: "radial-gradient(ellipse 100% 60% at 50% 100%, oklch(0.59 0.14 242 / 0.28), transparent)",
}

const perks = [
  { icon: RouterIcon,  text: "DynDNS & NoIP compatible out of the box" },
  { icon: GlobeIcon,   text: "Native IPv4 + IPv6 dual-stack on every host" },
  { icon: Key01Icon,   text: "Per-host token auth — no shared credentials" },
  { icon: Audit01Icon, text: "Full update log with timestamps & caller IPs" },
]

function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const wasReset     = searchParams.get("reset") === "1"
  const [error,   setError]   = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const fd = new FormData(e.currentTarget)
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: fd.get("email"), password: fd.get("password") }),
    })

    if (res.ok) {
      router.push("/dashboard")
    } else {
      const { error } = await res.json()
      setError(error ?? "Login failed")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" name="email" type="email" placeholder="you@example.com" required autoFocus />
        </Field>
        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Forgot password?
            </Link>
          </div>
          <Input id="password" name="password" type="password" placeholder="••••••••" required />
        </Field>
        {wasReset && (
          <p className="text-sm text-green-600 dark:text-green-400">Password updated — sign in with your new password.</p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
        <p className="text-center text-xs text-muted-foreground sm:hidden">
          No account?{" "}
          <Link href="/register" className="text-foreground underline underline-offset-4 hover:text-primary transition-colors">
            Sign up free
          </Link>
        </p>
      </FieldGroup>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">

      {/* ── LEFT PANEL ───────────────────────────────────────────── */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 border-r border-border overflow-hidden bg-muted/20">
        {/* dot grid */}
        <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.065]" style={DOT_GRID} />
        {/* bottom glow */}
        <div className="absolute inset-0 pointer-events-none" style={GLOW} />

        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-2.5 w-fit">
          <div className="size-8 bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold select-none">
            N
          </div>
          <span className="font-semibold text-sm tracking-tight">NovaDNS</span>
        </Link>

        {/* Middle content */}
        <div className="relative">
          <p className="text-xs text-primary font-mono uppercase tracking-widest mb-4">Dynamic DNS</p>
          <h2 className="text-3xl font-bold tracking-tight leading-snug mb-8">
            Your IPs,<br />always reachable.
          </h2>
          <ul className="space-y-4">
            {perks.map(({ icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <div className="mt-0.5 size-8 shrink-0 flex items-center justify-center border border-border bg-background">
                  <HugeiconsIcon icon={icon} strokeWidth={1.5} className="size-4 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground leading-snug pt-1.5">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom note */}
        <p className="relative text-xs text-muted-foreground">
          New here?{" "}
          <Link href="/register" className="text-foreground underline underline-offset-4 hover:text-primary transition-colors">
            Create a free account
          </Link>{" "}
          — no credit card required.
        </p>
      </div>

      {/* ── RIGHT PANEL ──────────────────────────────────────────── */}
      <div className="flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="flex items-center justify-between p-4 border-b border-border lg:border-b-0">
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <div className="size-7 bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold select-none">
              N
            </div>
            <span className="font-semibold text-sm tracking-tight">NovaDNS</span>
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:block">
              No account?{" "}
              <Link href="/register" className="text-foreground underline underline-offset-4 hover:text-primary transition-colors">
                Sign up free
              </Link>
            </span>
            <ThemeToggle />
          </div>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight mb-1">Welcome back</h1>
              <p className="text-sm text-muted-foreground">
                Sign in to manage your dynamic DNS hosts.
              </p>
            </div>
            <Suspense>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
