"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { resetPassword } from "@/lib/actions"

function ResetPasswordForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const token        = searchParams.get("token") ?? ""

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    if (fd.get("password") !== fd.get("confirm")) {
      setError("Passwords do not match"); return
    }
    setError(""); setLoading(true)
    fd.set("token", token)
    const result = await resetPassword(fd)
    if (result?.error) { setError(result.error); setLoading(false); return }
    router.push("/login?reset=1")
  }

  if (!token) {
    return (
      <div className="text-center space-y-3">
        <p className="text-sm text-destructive">Invalid reset link.</p>
        <Link href="/forgot-password" className="text-sm text-primary underline underline-offset-4">
          Request a new one
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Set a new password</h1>
        <p className="text-sm text-muted-foreground">Must be at least 8 characters.</p>
      </div>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="password">New password</FieldLabel>
            <Input id="password" name="password" type="password" placeholder="Min. 8 characters" required minLength={8} autoFocus />
          </Field>
          <Field>
            <FieldLabel htmlFor="confirm">Confirm password</FieldLabel>
            <Input id="confirm" name="confirm" type="password" placeholder="••••••••" required />
          </Field>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving…" : "Set new password"}
          </Button>
        </FieldGroup>
      </form>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="size-7 bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold select-none">N</div>
          <span className="font-semibold text-sm tracking-tight">NovaDNS</span>
        </Link>
        <ThemeToggle />
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Suspense>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
