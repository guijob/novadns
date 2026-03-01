"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { HugeiconsIcon } from "@hugeicons/react"
import { CrownIcon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"
import { PLANS, PAID_PLANS, isPaidPlan } from "@/lib/plans"

// ─── shared primitives ───────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{label}</p>
      <div className="border border-border">
        {children}
      </div>
    </div>
  )
}

function Feedback({ error, success }: { error: string; success: string }) {
  if (error)   return <p className="text-sm text-destructive">{error}</p>
  if (success) return <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
  return null
}

// ─── Plan ────────────────────────────────────────────────────────────────────

export function PlanSection({ plan }: { plan: string; email: string }) {
  const [loading, setLoading] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const upgraded = searchParams.get("upgraded") === "1"

  async function handleSubscribe(targetPlan: string) {
    setLoading(targetPlan)
    const res  = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: targetPlan }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setLoading(null)
  }

  async function handlePortal() {
    setLoading("portal")
    const res  = await fetch("/api/billing/portal", { method: "POST" })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setLoading(null)
  }

  const currentPlan = PLANS[plan as keyof typeof PLANS] ?? PLANS.free

  return (
    <Section label="Plan">
      {upgraded && (
        <div className="px-4 py-2.5 bg-green-50 dark:bg-green-950 border-b border-green-200 dark:border-green-800">
          <p className="text-xs text-green-700 dark:text-green-300 font-medium">Plan upgraded successfully. Welcome!</p>
        </div>
      )}

      {/* Current plan */}
      <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          {isPaidPlan(plan) && <HugeiconsIcon icon={CrownIcon} strokeWidth={1.5} className="size-4 text-primary" />}
          <span className="font-medium text-sm">{currentPlan.label} plan</span>
          <span className="text-xs font-mono text-muted-foreground">— {currentPlan.limit} hosts</span>
        </div>
        <span className="text-xs font-mono text-muted-foreground">
          {currentPlan.monthlyPrice === 0 ? "$0 / month" : `$${currentPlan.monthlyPrice} / month`}
        </span>
      </div>

      {/* Tier table */}
      <div className="divide-y divide-border">
        {PAID_PLANS.map(key => {
          const tier       = PLANS[key]
          const isCurrent  = plan === key
          const anyLoading = loading !== null

          return (
            <div
              key={key}
              className={`flex items-center justify-between gap-4 px-4 py-3 ${isCurrent ? "bg-primary/5" : ""}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-20 shrink-0">
                  <span className={`text-sm font-medium ${isCurrent ? "text-primary" : ""}`}>{tier.label}</span>
                </div>
                <span className="text-xs text-muted-foreground font-mono">{tier.limit} hosts</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-mono text-muted-foreground">${tier.monthlyPrice}/mo</span>
                {isCurrent ? (
                  <span className="text-xs font-medium text-primary flex items-center gap-1">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-3.5" />
                    Current
                  </span>
                ) : isPaidPlan(plan) ? (
                  <span className="text-xs text-muted-foreground">via portal</span>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    disabled={anyLoading}
                    onClick={() => handleSubscribe(key)}
                  >
                    {loading === key ? "Redirecting…" : "Subscribe"}
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer action */}
      <div className="px-4 py-3 border-t border-border bg-muted/20">
        {isPaidPlan(plan) ? (
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">Upgrade, downgrade, or cancel via the billing portal.</p>
            <Button size="sm" variant="outline" onClick={handlePortal} disabled={loading !== null}>
              {loading === "portal" ? "Redirecting…" : "Manage subscription"}
            </Button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Subscribe to a paid plan to increase your host limit.</p>
        )}
      </div>
    </Section>
  )
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export function ProfileForm({ initialName, initialEmail }: { initialName: string; initialEmail: string }) {
  const [name,    setName]    = useState(initialName)
  const [email,   setEmail]   = useState(initialEmail)
  const [error,   setError]   = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const dirty = name !== initialName || email !== initialEmail

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(""); setSuccess(""); setLoading(true)
    const res = await fetch("/api/settings/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    })
    const data = await res.json()
    if (res.ok) setSuccess("Profile updated")
    else setError(data.error ?? "Something went wrong")
    setLoading(false)
  }

  return (
    <Section label="Profile">
      <form onSubmit={handleSubmit}>
        <div className="divide-y divide-border">
          {/* Name row */}
          <div className="grid grid-cols-[140px_1fr] items-center gap-4 px-4 py-3">
            <label htmlFor="name" className="text-xs text-muted-foreground">Name</label>
            <Input
              id="name"
              name="name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="h-7 text-sm"
            />
          </div>
          {/* Email row */}
          <div className="grid grid-cols-[140px_1fr] items-center gap-4 px-4 py-3">
            <label htmlFor="email" className="text-xs text-muted-foreground">Email</label>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="h-7 text-sm"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-border bg-muted/20">
          <Feedback error={error} success={success} />
          <Button type="submit" size="sm" disabled={loading || !dirty} className="ml-auto">
            {loading ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </Section>
  )
}

// ─── Password ────────────────────────────────────────────────────────────────

export function PasswordForm() {
  const [error,   setError]   = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(""); setSuccess(""); setLoading(true)
    const fd = new FormData(e.currentTarget)
    const res = await fetch("/api/settings/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: fd.get("currentPassword"),
        newPassword:     fd.get("newPassword"),
      }),
    })
    const data = await res.json()
    if (res.ok) {
      setSuccess("Password updated");
      (e.target as HTMLFormElement).reset()
    } else {
      setError(data.error ?? "Something went wrong")
    }
    setLoading(false)
  }

  return (
    <Section label="Password">
      <form onSubmit={handleSubmit}>
        <div className="divide-y divide-border">
          <div className="grid grid-cols-[140px_1fr] items-center gap-4 px-4 py-3">
            <label htmlFor="currentPassword" className="text-xs text-muted-foreground">Current password</label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              placeholder="••••••••"
              required
              className="h-7 text-sm"
            />
          </div>
          <div className="grid grid-cols-[140px_1fr] items-center gap-4 px-4 py-3">
            <label htmlFor="newPassword" className="text-xs text-muted-foreground">New password</label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              placeholder="Min. 8 characters"
              required
              minLength={8}
              className="h-7 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-border bg-muted/20">
          <Feedback error={error} success={success} />
          <Button type="submit" size="sm" disabled={loading} className="ml-auto">
            {loading ? "Updating…" : "Update password"}
          </Button>
        </div>
      </form>
    </Section>
  )
}
