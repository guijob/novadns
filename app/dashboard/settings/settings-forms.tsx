"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { initializePaddle, type Paddle } from "@paddle/paddle-js"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { HugeiconsIcon } from "@hugeicons/react"
import { CrownIcon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"
import { PLANS, PAID_PLANS, isPaidPlan, type PlanKey } from "@/lib/plans"
import { unlinkGoogle, unlinkMicrosoft } from "@/lib/actions"

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

export function PlanSection({ plan, email, clientId, priceIds }: {
  plan: string
  email: string
  clientId: number
  priceIds: Partial<Record<PlanKey, string>>
}) {
  const [loading, setLoading] = useState<string | null>(null)
  const [paddle,  setPaddle]  = useState<Paddle | undefined>()
  const searchParams = useSearchParams()
  const upgraded = searchParams.get("upgraded") === "1"

  useEffect(() => {
    initializePaddle({
      environment: (process.env.NEXT_PUBLIC_PADDLE_ENV ?? "sandbox") as "sandbox" | "production",
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
      eventCallback(event) {
        if (event.name === "checkout.completed") {
          window.location.href = "/dashboard/settings?upgraded=1"
        }
      },
    }).then(setPaddle)
  }, [])

  function handleSubscribe(targetPlan: PlanKey) {
    const priceId = priceIds[targetPlan]
    if (!priceId || !paddle) return
    setLoading(targetPlan)
    paddle.Checkout.open({
      items:      [{ priceId, quantity: 1 }],
      customer:   { email },
      customData: { clientId: String(clientId) },
    })
    setLoading(null)
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
                    disabled={anyLoading || !paddle}
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
