"use client"

import { useState, useEffect, useRef, useTransition, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { initializePaddle, type Paddle } from "@paddle/paddle-js"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { HugeiconsIcon } from "@hugeicons/react"
import { CrownIcon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"
import { PLANS, PAID_PLANS, isPaidPlan, type PlanKey } from "@/lib/plans"
import { cn } from "@/lib/utils"
import { unlinkGoogle, unlinkMicrosoft, updateClientSlug } from "@/lib/actions"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// ─── Avatar ──────────────────────────────────────────────────────────────────

export function AvatarForm({ initialUrl, name }: { initialUrl: string | null; name: string }) {
  const [preview, setPreview] = useState<string | null>(initialUrl)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")
  const [success, setSuccess] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  function resizeToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        const SIZE = 256
        const canvas = document.createElement("canvas")
        canvas.width = SIZE; canvas.height = SIZE
        const ctx = canvas.getContext("2d")!
        const scale = Math.max(SIZE / img.width, SIZE / img.height)
        const w = img.width * scale, h = img.height * scale
        ctx.drawImage(img, (SIZE - w) / 2, (SIZE - h) / 2, w, h)
        URL.revokeObjectURL(url)
        resolve(canvas.toDataURL("image/jpeg", 0.85))
      }
      img.onerror = reject
      img.src = url
    })
  }

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) { setError("Please select an image file"); return }
    setError(""); setSuccess(""); setLoading(true)
    try {
      const dataUrl = await resizeToDataUrl(file)
      setPreview(dataUrl)
      const res  = await fetch("/api/settings/avatar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: dataUrl }),
      })
      const data = await res.json()
      if (res.ok) setSuccess("Avatar updated")
      else setError(data.error ?? "Something went wrong")
    } catch {
      setError("Failed to process image")
    }
    setLoading(false)
  }

  async function handleRemove() {
    setError(""); setSuccess(""); setLoading(true)
    const res  = await fetch("/api/settings/avatar", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarUrl: null }),
    })
    const data = await res.json()
    if (res.ok) { setPreview(null); setSuccess("Avatar removed") }
    else setError(data.error ?? "Something went wrong")
    setLoading(false)
  }

  const initials = name.split(" ").map(p => p[0]).join("").toUpperCase().slice(0, 2)

  return (
    <Section label="Avatar">
      <div className="flex items-center gap-5 px-4 py-4">
        {/* Avatar display */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="relative shrink-0 group cursor-pointer"
          title="Click to change avatar"
        >
          <div className="size-16 rounded-full overflow-hidden border-2 border-border bg-muted flex items-center justify-center text-xl font-semibold text-muted-foreground select-none">
            {preview
              ? <img src={preview} alt="Avatar" className="size-full object-cover" />
              : initials}
          </div>
          <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-[10px] font-medium">Change</span>
          </div>
        </button>

        {/* Actions */}
        <div className="space-y-1.5 min-w-0">
          <p className="text-xs text-muted-foreground">JPG, PNG or GIF · max 5 MB · resized to 256×256</p>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()} disabled={loading} className="h-7 text-xs">
              {loading ? "Saving…" : "Upload image"}
            </Button>
            {preview && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={loading}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                Remove
              </button>
            )}
          </div>
          <Feedback error={error} success={success} />
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = "" }}
        />
      </div>
    </Section>
  )
}

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

export function PlanSection({ plan, email, clientId, priceIds, teamId, teamName, canManage = true, redirectBase }: {
  plan: string
  email: string
  clientId: number
  priceIds: Partial<Record<PlanKey, string>>
  teamId?: number
  teamName?: string
  canManage?: boolean
  redirectBase: string
}) {
  const [loading,     setLoading]     = useState<string | null>(null)
  const [paddle,      setPaddle]      = useState<Paddle | undefined>()
  const [pendingPlan, setPendingPlan] = useState<PlanKey | null>(null)
  const [planSuccess, setPlanSuccess] = useState(false)
  const [planError,   setPlanError]   = useState("")
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const router  = useRouter()
  const searchParams = useSearchParams()
  const upgraded = searchParams.get("upgraded") === "1"

  // Initial checkout: webhook updates the DB async — refresh after 1.5s to pick it up
  useEffect(() => {
    if (!upgraded) return
    const t = setTimeout(() => window.location.replace(redirectBase), 1500)
    return () => clearTimeout(t)
  }, [upgraded, redirectBase])

  function stopPolling() {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
  }

  function pollForPlanChange(expectedPlan: PlanKey) {
    let attempts = 0
    const url = teamId ? `/api/billing/plan?teamId=${teamId}` : "/api/billing/plan"
    pollRef.current = setInterval(async () => {
      attempts++
      try {
        const res  = await fetch(url)
        const data = await res.json()
        if (data.plan === expectedPlan) {
          stopPolling()
          setLoading(null)
          setPlanSuccess(true)
          router.refresh()
        } else if (attempts >= 10) {
          stopPolling()
          setLoading(null)
          setPlanError("Plan update is taking longer than expected. Please refresh the page.")
        }
      } catch {
        stopPolling()
        setLoading(null)
        setPlanError("Could not verify plan update. Please refresh the page.")
      }
    }, 500)
  }

  useEffect(() => { return () => stopPolling() }, [])

  useEffect(() => {
    initializePaddle({
      environment: (process.env.NEXT_PUBLIC_PADDLE_ENV ?? "sandbox") as "sandbox" | "production",
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
      eventCallback(event) {
        if (event.name === "checkout.completed") {
          window.location.href = `${redirectBase}?upgraded=1`
        }
      },
    }).then(setPaddle)
  }, [redirectBase])

  function handleSubscribe(targetPlan: PlanKey) {
    const priceId = priceIds[targetPlan]
    if (!priceId || !paddle) return
    setLoading(targetPlan)
    try {
      paddle.Checkout.open({
        items:      [{ priceId, quantity: 1 }],
        customer:   { email },
        customData: teamId ? { teamId: String(teamId) } : { clientId: String(clientId) },
      })
    } catch (err) {
      console.error("Paddle checkout error:", err)
    } finally {
      setLoading(null)
    }
  }

  async function handlePortal() {
    setLoading("portal")
    try {
      const res  = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else setLoading(null)
    } catch (err) {
      console.error("Paddle portal error:", err)
      setLoading(null)
    }
  }

  async function handleChangePlan(targetPlan: PlanKey) {
    setPlanSuccess(false)
    setPlanError("")
    setLoading(targetPlan)
    try {
      const res  = await fetch("/api/billing/change-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: targetPlan, teamId }),
      })
      const data = await res.json()
      if (data.ok) {
        pollForPlanChange(targetPlan)
      } else {
        setPlanError(data.error ?? "Failed to update plan. Please try again.")
        setLoading(null)
      }
    } catch {
      setPlanError("Failed to update plan. Please try again.")
      setLoading(null)
    }
  }

  const currentPlan  = PLANS[plan as keyof typeof PLANS] ?? PLANS.free
  const ALL_PLANS    = (["free", ...PAID_PLANS] as PlanKey[])
  const MAX_HOSTS    = 500

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50 select-none">
        {teamName ? `${teamName} — Plan` : "Plan"}
      </p>

      <div className="border border-border">
        {/* Current plan header */}
        <div className="flex items-center justify-between gap-4 px-4 py-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            {isPaidPlan(plan)
              ? <HugeiconsIcon icon={CrownIcon} strokeWidth={1.5} className="size-5 text-primary shrink-0" />
              : <div className="size-5 rounded-full border-2 border-border shrink-0" />
            }
            <div>
              <p className="text-sm font-semibold leading-none">{currentPlan.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{currentPlan.limit} hosts included</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-mono font-bold tabular-nums leading-none">
              {currentPlan.monthlyPrice === 0 ? "Free" : `$${currentPlan.monthlyPrice}`}
            </p>
            {currentPlan.monthlyPrice > 0 && (
              <p className="text-[10px] text-muted-foreground mt-0.5">/month</p>
            )}
          </div>
        </div>

        {/* Status banners */}
        {(upgraded || planSuccess) && (
          <div className="px-4 py-2.5 bg-green-50 dark:bg-green-950/50 border-b border-green-200 dark:border-green-800">
            <p className="text-xs text-green-700 dark:text-green-400 font-medium">
              {planSuccess ? "Plan updated successfully." : "Plan upgraded successfully. Welcome!"}
            </p>
          </div>
        )}
        {planError && (
          <div className="px-4 py-2.5 border-b border-destructive/30 bg-destructive/5">
            <p className="text-xs text-destructive">{planError}</p>
          </div>
        )}

        {/* Plan rows */}
        <div className="divide-y divide-border">
          {ALL_PLANS.map((key, index) => {
            const tier      = PLANS[key]
            const isCurrent = plan === key
            const isUpgrade = tier.limit > currentPlan.limit
            const fillPct   = Math.round((tier.limit / MAX_HOSTS) * 100)

            return (
              <div
                key={key}
                className={cn(
                  "group flex items-center gap-4 px-4 py-3 border-l-2 transition-colors duration-150",
                  "animate-in fade-in slide-in-from-left-1 fill-mode-both duration-300",
                  isCurrent
                    ? "border-l-primary bg-primary/5"
                    : "border-l-transparent hover:bg-muted/30"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Name + capacity bar */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-sm font-medium", isCurrent ? "text-primary" : "")}>
                      {tier.label}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
                      {tier.limit} hosts
                    </span>
                    {isCurrent && (
                      <span className="text-[9px] font-mono uppercase tracking-wide bg-primary/15 text-primary px-1.5 py-px">
                        active
                      </span>
                    )}
                  </div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden w-full max-w-40">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700 ease-out",
                        isCurrent ? "bg-primary" : "bg-muted-foreground/20 group-hover:bg-muted-foreground/35"
                      )}
                      style={{ width: `${fillPct}%`, transitionDelay: `${index * 60 + 150}ms` }}
                    />
                  </div>
                </div>

                {/* Price */}
                <div className="shrink-0 w-14 text-right">
                  <span className={cn("text-sm font-mono font-semibold tabular-nums", isCurrent ? "text-foreground" : "text-muted-foreground")}>
                    {tier.monthlyPrice === 0 ? "Free" : `$${tier.monthlyPrice}`}
                  </span>
                  {tier.monthlyPrice > 0 && (
                    <span className="block text-[10px] text-muted-foreground/60">/mo</span>
                  )}
                </div>

                {/* Action */}
                <div className="shrink-0 w-[90px] flex justify-end">
                  {isCurrent ? (
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-4 text-primary" />
                  ) : !canManage ? null : isPaidPlan(plan) ? (
                    <Button size="sm" variant="outline" className="h-7 text-xs" disabled={loading !== null} onClick={() => setPendingPlan(key)}>
                      {loading === key ? "Updating…" : isUpgrade ? "Upgrade" : "Downgrade"}
                    </Button>
                  ) : key !== "free" ? (
                    <Button size="sm" variant="outline" className="h-7 text-xs" disabled={loading !== null || !paddle} onClick={() => handleSubscribe(key)}>
                      {loading === key ? "Redirecting…" : "Subscribe"}
                    </Button>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border bg-muted/10">
          {!canManage ? (
            <p className="text-xs text-muted-foreground">Only the team owner can manage billing.</p>
          ) : isPaidPlan(plan) ? (
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground">Cancel or update payment method via the billing portal.</p>
              <Button size="sm" variant="outline" onClick={handlePortal} disabled={loading !== null}>
                {loading === "portal" ? "Redirecting…" : "Manage subscription"}
              </Button>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Subscribe to a paid plan to increase your host limit.</p>
          )}
        </div>
      </div>

      {/* Plan change confirmation dialog */}
      <AlertDialog open={pendingPlan !== null} onOpenChange={open => { if (!open) setPendingPlan(null) }}>
        {pendingPlan && (() => {
          const target    = PLANS[pendingPlan]
          const current   = PLANS[plan as PlanKey] ?? PLANS.free
          const isUpgrade = target.limit > current.limit
          return (
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {isUpgrade ? "Upgrade" : "Downgrade"} to {target.label}?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  You&apos;ll be switched from <strong>{current.label}</strong> (${current.monthlyPrice}/mo)
                  to <strong>{target.label}</strong> (${target.monthlyPrice}/mo).
                  The difference will be prorated and charged or credited to your payment method immediately.
                  {!isUpgrade && target.limit < current.limit && (
                    <> Hosts beyond the {target.limit}-host limit will be disabled.</>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={loading !== null}
                  onClick={() => { handleChangePlan(pendingPlan); setPendingPlan(null) }}
                >
                  {isUpgrade ? "Upgrade" : "Downgrade"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          )
        })()}
      </AlertDialog>
    </div>
  )
}

// ─── Username / Slug ──────────────────────────────────────────────────────────

export function UsernameForm({ currentSlug }: { currentSlug: string }) {
  const [slug,    setSlug]    = useState(currentSlug)
  const [error,   setError]   = useState("")
  const [success, setSuccess] = useState("")
  const [pending, startTransition] = useTransition()

  const dirty = slug !== currentSlug

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(""); setSuccess("")
    startTransition(async () => {
      const res = await updateClientSlug(slug)
      if ("error" in res) setError(res.error ?? "Something went wrong")
      // On success, the server action redirects to /${newSlug}/settings
    })
  }

  return (
    <Section label="Username">
      <form onSubmit={handleSubmit}>
        <div className="divide-y divide-border">
          <div className="grid grid-cols-[140px_1fr] items-center gap-4 px-4 py-3">
            <label htmlFor="slug" className="text-xs text-muted-foreground">Username</label>
            <Input
              id="slug"
              name="slug"
              value={slug}
              onChange={e => setSlug(e.target.value.toLowerCase())}
              placeholder="your-username"
              pattern="[a-z0-9][a-z0-9-]{1,37}[a-z0-9]"
              minLength={3}
              maxLength={39}
              required
              className="h-7 text-sm font-mono"
              disabled={pending}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-border bg-muted/20">
          <div className="flex-1">
            {error   && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-green-600 dark:text-green-400">{success}</p>}
            {dirty && !error && !success && (
              <p className="text-xs text-muted-foreground">Changing your username will break existing links.</p>
            )}
          </div>
          <Button type="submit" size="sm" disabled={pending || !dirty} className="ml-auto">
            {pending ? "Saving…" : "Save username"}
          </Button>
        </div>
      </form>
    </Section>
  )
}

// ─── Display name ────────────────────────────────────────────────────────────

export function DisplayNameForm({ initialName }: { initialName: string }) {
  const [name,    setName]    = useState(initialName)
  const [error,   setError]   = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const dirty = name !== initialName

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(""); setSuccess(""); setLoading(true)
    const res = await fetch("/api/settings/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email: undefined }),
    })
    const data = await res.json()
    if (res.ok) setSuccess("Name updated")
    else setError(data.error ?? "Something went wrong")
    setLoading(false)
  }

  return (
    <Section label="Display name">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-[140px_1fr] items-center gap-4 px-4 py-3">
          <label htmlFor="name" className="text-xs text-muted-foreground">Name</label>
          <Input id="name" name="name" value={name} onChange={e => setName(e.target.value)} required className="h-7 text-sm" disabled={loading} />
        </div>
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-border bg-muted/20">
          <Feedback error={error} success={success} />
          <Button type="submit" size="sm" disabled={loading || !dirty} className="ml-auto">
            {loading ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </Section>
  )
}

// ─── Email ────────────────────────────────────────────────────────────────────

export function EmailForm({ initialEmail, initialName }: { initialEmail: string; initialName: string }) {
  const [email,   setEmail]   = useState(initialEmail)
  const [error,   setError]   = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const dirty = email !== initialEmail

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(""); setSuccess(""); setLoading(true)
    const res = await fetch("/api/settings/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: initialName, email }),
    })
    const data = await res.json()
    if (res.ok) setSuccess("Email updated")
    else setError(data.error ?? "Something went wrong")
    setLoading(false)
  }

  return (
    <Section label="Email address">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-[140px_1fr] items-center gap-4 px-4 py-3">
          <label htmlFor="email" className="text-xs text-muted-foreground">Email</label>
          <Input id="email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="h-7 text-sm" disabled={loading} />
        </div>
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-border bg-muted/20">
          <Feedback error={error} success={success} />
          <Button type="submit" size="sm" disabled={loading || !dirty} className="ml-auto">
            {loading ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </Section>
  )
}

// ─── Password ────────────────────────────────────────────────────────────────

export function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
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
        currentPassword: fd.get("currentPassword") || undefined,
        newPassword:     fd.get("newPassword"),
      }),
    })
    const data = await res.json()
    if (res.ok) {
      setSuccess(hasPassword ? "Password updated" : "Password set");
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
          {hasPassword && (
            <div className="grid grid-cols-[140px_1fr] items-center gap-4 px-4 py-3">
              <label htmlFor="currentPassword" className="text-xs text-muted-foreground">Current password</label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                placeholder="••••••••"
                required
                className="h-7 text-sm"
                disabled={loading}
              />
            </div>
          )}
          <div className="grid grid-cols-[140px_1fr] items-center gap-4 px-4 py-3">
            <label htmlFor="newPassword" className="text-xs text-muted-foreground">
              {hasPassword ? "New password" : "Set password"}
            </label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              placeholder="Min. 8 characters"
              required
              minLength={8}
              className="h-7 text-sm"
              disabled={loading}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-border bg-muted/20">
          <Feedback error={error} success={success} />
          <Button type="submit" size="sm" disabled={loading} className="ml-auto">
            {loading ? "Saving…" : hasPassword ? "Update password" : "Set password"}
          </Button>
        </div>
      </form>
    </Section>
  )
}

// ─── Connected accounts ───────────────────────────────────────────────────────

function OAuthRow({
  provider,
  connected,
  hasPassword,
  loading,
  onUnlink,
  linkHref,
  logo,
}: {
  provider: string
  connected: boolean
  hasPassword: boolean
  loading: boolean
  onUnlink: () => void
  linkHref: string
  logo: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="flex items-center gap-3">
        {logo}
        <div>
          <p className="text-sm font-medium">{provider}</p>
          <p className="text-xs text-muted-foreground">
            {connected ? `Connected — sign in with ${provider}` : "Not connected"}
          </p>
        </div>
      </div>

      {connected ? (
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs"
          disabled={loading || !hasPassword}
          onClick={onUnlink}
          title={!hasPassword ? `Set a password first to be able to unlink ${provider}` : undefined}
        >
          {loading ? "Unlinking…" : "Unlink"}
        </Button>
      ) : (
        <a
          href={linkHref}
          className="inline-flex items-center justify-center h-7 px-3 text-xs font-medium border border-border hover:bg-muted/50 transition-colors"
        >
          Connect
        </a>
      )}
    </div>
  )
}

const GoogleLogo = () => (
  <svg className="size-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

const MicrosoftLogo = () => (
  <svg className="size-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M11.4 2H2v9.4h9.4V2z" fill="#F25022"/>
    <path d="M22 2h-9.4v9.4H22V2z" fill="#7FBA00"/>
    <path d="M11.4 12.6H2V22h9.4v-9.4z" fill="#00A4EF"/>
    <path d="M22 12.6h-9.4V22H22v-9.4z" fill="#FFB900"/>
  </svg>
)

// ─── Two-Factor Authentication ────────────────────────────────────────────────

type MfaStep = "idle" | "setup" | "enabled" | "regen" | "disable"

export function MfaSection({ mfaEnabled: initialEnabled }: { mfaEnabled: boolean }) {
  const [enabled,     setEnabled]     = useState(initialEnabled)
  const [step,        setStep]        = useState<MfaStep>(initialEnabled ? "enabled" : "idle")
  const [qrDataUrl,   setQrDataUrl]   = useState("")
  const [secret,      setSecret]      = useState("")
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [code,        setCode]        = useState("")
  const [error,       setError]       = useState("")
  const [success,     setSuccess]     = useState("")
  const [loading,     setLoading]     = useState(false)
  const [copied,      setCopied]      = useState(false)

  const reset = useCallback(() => {
    setCode(""); setError(""); setSuccess(""); setLoading(false)
  }, [])

  async function handleSetup() {
    reset()
    setLoading(true)
    const res  = await fetch("/api/auth/mfa/setup", { method: "POST" })
    const data = await res.json()
    if (res.ok) {
      setQrDataUrl(data.qrDataUrl)
      setSecret(data.secret)
      setBackupCodes([])
      setStep("setup")
    } else {
      setError(data.error ?? "Failed to start setup")
    }
    setLoading(false)
  }

  async function handleEnable(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    reset()
    setLoading(true)
    const res  = await fetch("/api/auth/mfa/enable", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ code: code.trim() }),
    })
    const data = await res.json()
    if (res.ok) {
      setEnabled(true)
      setStep("enabled")
      setBackupCodes(data.backupCodes ?? [])
      setSuccess("Two-factor authentication enabled.")
    } else {
      setError(data.error ?? "Invalid code")
    }
    setLoading(false)
    setCode("")
  }

  async function handleDisable(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    reset()
    setLoading(true)
    const res  = await fetch("/api/auth/mfa/disable", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ code: code.trim() }),
    })
    const data = await res.json()
    if (res.ok) {
      setEnabled(false)
      setStep("idle")
      setQrDataUrl(""); setSecret(""); setBackupCodes([])
      setSuccess("Two-factor authentication disabled.")
    } else {
      setError(data.error ?? "Invalid code")
    }
    setLoading(false)
    setCode("")
  }

  async function handleRegen(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    reset()
    setLoading(true)
    const res  = await fetch("/api/auth/mfa/backup-codes", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ code: code.trim() }),
    })
    const data = await res.json()
    if (res.ok) {
      setBackupCodes(data.backupCodes)
      setStep("regen")
      setSuccess("Backup codes regenerated.")
    } else {
      setError(data.error ?? "Invalid code")
    }
    setLoading(false)
    setCode("")
  }

  function copySecret() {
    navigator.clipboard.writeText(secret).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <Section label="Two-factor authentication">
      {/* Status row */}
      <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border">
        <div>
          <p className="text-sm font-medium">Authenticator app</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {enabled
              ? "TOTP two-factor authentication is active."
              : "Add an extra layer of security to your account."}
          </p>
        </div>
        {enabled && (
          <span className="text-xs font-medium text-green-600 dark:text-green-400 border border-green-300 dark:border-green-700 px-2 py-0.5 shrink-0">
            Active
          </span>
        )}
      </div>

      {/* Feedback */}
      {(error || success) && (
        <div className="px-4 py-2.5 border-b border-border">
          <Feedback error={error} success={success} />
        </div>
      )}

      {/* ── idle: not set up ── */}
      {step === "idle" && (
        <div className="px-4 py-3">
          <Button size="sm" variant="outline" onClick={handleSetup} disabled={loading}>
            {loading ? "Setting up…" : "Set up authenticator"}
          </Button>
        </div>
      )}

      {/* ── setup: scan QR ── */}
      {step === "setup" && (
        <div className="divide-y divide-border">
          <div className="px-4 py-3 space-y-3">
            <p className="text-xs text-muted-foreground">
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.), then enter the 6-digit code to confirm.
            </p>
            {qrDataUrl && (
              <img src={qrDataUrl} alt="TOTP QR code" className="size-40 border border-border" />
            )}
            {secret && (
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono bg-muted px-2 py-1 select-all">{secret}</code>
                <button
                  type="button"
                  onClick={copySecret}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            )}
          </div>
          <form onSubmit={handleEnable} className="px-4 py-3 space-y-3">
            <div className="grid grid-cols-[140px_1fr] items-center gap-4">
              <label htmlFor="mfa-code" className="text-xs text-muted-foreground">Code from app</label>
              <Input
                id="mfa-code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                autoComplete="one-time-code"
                value={code}
                onChange={e => setCode(e.target.value)}
                required
                className="h-7 text-sm font-mono"
                disabled={loading}
              />
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" size="sm" disabled={loading}>
                {loading ? "Verifying…" : "Verify & enable"}
              </Button>
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => { setStep("idle"); reset() }}
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Show backup codes before enabling so user can save them */}
          {backupCodes.length > 0 && (
            <div className="px-4 py-3 space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Save your backup codes</p>
              <p className="text-xs text-muted-foreground">
                Store these somewhere safe. Each code can only be used once.
              </p>
              <div className="grid grid-cols-2 gap-1">
                {backupCodes.map(c => (
                  <code key={c} className="text-xs font-mono bg-muted px-2 py-1">{c}</code>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── enabled: show actions ── */}
      {(step === "enabled" || step === "regen" || step === "disable") && (
        <div className="divide-y divide-border">
          {/* Show backup codes after just enabling or regenerating */}
          {(step === "enabled" || step === "regen") && backupCodes.length > 0 && (
            <div className="px-4 py-3 space-y-2">
              <p className="text-xs text-muted-foreground font-medium">
                {step === "regen" ? "New backup codes" : "Your backup codes"}
              </p>
              <p className="text-xs text-muted-foreground">
                Store these somewhere safe. Each code can only be used once.
              </p>
              <div className="grid grid-cols-2 gap-1">
                {backupCodes.map(c => (
                  <code key={c} className="text-xs font-mono bg-muted px-2 py-1">{c}</code>
                ))}
              </div>
            </div>
          )}

          {/* Regen backup codes */}
          <div className="px-4 py-3 space-y-2">
            <p className="text-xs text-muted-foreground">Regenerate backup codes (invalidates existing ones).</p>
            {step === "regen" ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-green-600 dark:text-green-400">Done</span>
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => { setStep("enabled"); setBackupCodes([]); reset() }}
                >
                  Hide
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegen} className="flex items-center gap-3">
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  autoComplete="one-time-code"
                  value={step === "disable" ? "" : code}
                  onChange={e => { setStep("regen" as MfaStep); setCode(e.target.value) }}
                  onFocus={() => setStep("regen" as MfaStep)}
                  required
                  className="h-7 w-32 text-sm font-mono"
                  disabled={loading}
                />
                <Button type="submit" size="sm" variant="outline" disabled={loading || step === "disable"}>
                  {loading && step !== "disable" ? "Working…" : "Regenerate codes"}
                </Button>
              </form>
            )}
          </div>

          {/* Disable MFA */}
          <div className="px-4 py-3 space-y-2">
            <p className="text-xs text-muted-foreground">Disable two-factor authentication.</p>
            <form onSubmit={handleDisable} className="flex items-center gap-3">
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                autoComplete="one-time-code"
                value={step === "disable" ? code : ""}
                onChange={e => { setStep("disable" as MfaStep); setCode(e.target.value) }}
                onFocus={() => setStep("disable" as MfaStep)}
                required
                className="h-7 w-32 text-sm font-mono"
                disabled={loading}
              />
              <Button type="submit" size="sm" variant="outline" disabled={loading || step === "regen"}>
                {loading && step === "disable" ? "Disabling…" : "Disable 2FA"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </Section>
  )
}

export function ConnectedAccountsSection({
  googleId,
  microsoftId,
  hasPassword,
}: {
  googleId: string | null
  microsoftId: string | null
  hasPassword: boolean
}) {
  const searchParams     = useSearchParams()
  const googleLinked     = searchParams.get("google_linked")    === "1"
  const microsoftLinked  = searchParams.get("microsoft_linked") === "1"
  const googleError      = searchParams.get("google_error")
  const microsoftError   = searchParams.get("microsoft_error")

  const [loadingGoogle,    setLoadingGoogle]    = useState(false)
  const [loadingMicrosoft, setLoadingMicrosoft] = useState(false)
  const [error,   setError]   = useState("")
  const [success, setSuccess] = useState(
    googleLinked ? "Google account connected successfully"
    : microsoftLinked ? "Microsoft account connected successfully"
    : ""
  )

  async function handleUnlinkGoogle() {
    setError(""); setLoadingGoogle(true)
    const res = await unlinkGoogle()
    if ("ok" in res) setSuccess("Google account disconnected")
    else setError(res.error ?? "Something went wrong")
    setLoadingGoogle(false)
  }

  async function handleUnlinkMicrosoft() {
    setError(""); setLoadingMicrosoft(true)
    const res = await unlinkMicrosoft()
    if ("ok" in res) setSuccess("Microsoft account disconnected")
    else setError(res.error ?? "Something went wrong")
    setLoadingMicrosoft(false)
  }

  return (
    <Section label="Connected accounts">
      {(googleError === "taken" || microsoftError === "taken") && (
        <div className="px-4 py-2.5 border-b border-destructive/30 bg-destructive/5">
          <p className="text-xs text-destructive">
            That {googleError === "taken" ? "Google" : "Microsoft"} account is already linked to another NovaDNS account.
          </p>
        </div>
      )}

      <div className="divide-y divide-border">
        <OAuthRow
          provider="Google"
          connected={!!googleId}
          hasPassword={hasPassword}
          loading={loadingGoogle}
          onUnlink={handleUnlinkGoogle}
          linkHref="/api/auth/google?action=link"
          logo={<GoogleLogo />}
        />
        <OAuthRow
          provider="Microsoft"
          connected={!!microsoftId}
          hasPassword={hasPassword}
          loading={loadingMicrosoft}
          onUnlink={handleUnlinkMicrosoft}
          linkHref="/api/auth/microsoft?action=link"
          logo={<MicrosoftLogo />}
        />
      </div>

      {(error || success) && (
        <div className="px-4 pb-3 border-t border-border pt-2.5">
          <Feedback error={error} success={success} />
        </div>
      )}

      {(googleId || microsoftId) && !hasPassword && (
        <div className="px-4 pb-3 border-t border-border pt-2.5">
          <p className="text-xs text-muted-foreground">Set a password above before unlinking a social account.</p>
        </div>
      )}
    </Section>
  )
}
