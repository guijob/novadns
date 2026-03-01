"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { requestPasswordReset } from "@/lib/actions"
import { HugeiconsIcon } from "@hugeicons/react"
import { SentIcon } from "@hugeicons/core-free-icons"

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(""); setLoading(true)
    const result = await requestPasswordReset(new FormData(e.currentTarget))
    if (result?.error) { setError(result.error); setLoading(false); return }
    setSubmitted(true)
  }

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
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="size-12 flex items-center justify-center border border-border">
                  <HugeiconsIcon icon={SentIcon} strokeWidth={1.5} className="size-5 text-primary" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight mb-1">Check your inbox</h1>
                <p className="text-sm text-muted-foreground">
                  If that email is registered, you'll receive a reset link shortly. It expires in 1 hour.
                </p>
              </div>
              <Link href="/login" className="text-sm text-primary underline underline-offset-4">
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight mb-1">Forgot your password?</h1>
                <p className="text-sm text-muted-foreground">
                  Enter your email and we'll send you a reset link.
                </p>
              </div>
              <form onSubmit={handleSubmit}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input id="email" name="email" type="email" placeholder="you@example.com" required autoFocus />
                  </Field>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Sending…" : "Send reset link"}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    Remembered it?{" "}
                    <Link href="/login" className="text-foreground underline underline-offset-4 hover:text-primary transition-colors">
                      Sign in
                    </Link>
                  </p>
                </FieldGroup>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
