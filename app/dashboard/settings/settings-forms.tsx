"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { HugeiconsIcon } from "@hugeicons/react"
import { CrownIcon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"

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

const FREE_PERKS = ["3 active hosts", "IPv4 + IPv6", "Token auth", "Update logs", "DynDNS / NoIP compatible"]
const PRO_PERKS  = ["Unlimited hosts", "IPv4 + IPv6", "Token auth", "Update logs", "DynDNS / NoIP compatible", "IPv6 subnet support", "Custom TTL", "Priority support"]

export function PlanSection({ plan, email }: { plan: string; email: string }) {
  const isPro   = plan === "pro"
  const perks   = isPro ? PRO_PERKS : FREE_PERKS

  return (
    <Section label="Plan">
      {/* Current plan header */}
      <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          {isPro && <HugeiconsIcon icon={CrownIcon} strokeWidth={1.5} className="size-4 text-primary" />}
          <span className="font-medium text-sm">{isPro ? "Pro" : "Free"} plan</span>
        </div>
        <span className="text-xs font-mono text-muted-foreground">{isPro ? "$4.99 / month" : "$0 / month"}</span>
      </div>

      {/* Included features */}
      <div className="px-4 py-3 border-b border-border">
        <p className="text-xs text-muted-foreground mb-2.5">Included</p>
        <ul className="space-y-1.5">
          {perks.map(p => (
            <li key={p} className="flex items-center gap-2 text-xs">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={1.5} className="size-3.5 text-primary shrink-0" />
              {p}
            </li>
          ))}
        </ul>
      </div>

      {/* Action */}
      <div className="px-4 py-3">
        {isPro ? (
          <p className="text-xs text-muted-foreground">
            You&apos;re on Pro. Thank you for your support.
          </p>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">Upgrade for unlimited hosts and IPv6 subnet support.</p>
            <Button size="sm" disabled>
              <HugeiconsIcon icon={CrownIcon} strokeWidth={2} />
              Upgrade — soon
            </Button>
          </div>
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
