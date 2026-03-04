"use client"

import { useState, useRef, useEffect } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"

export function DocsFeedbackButton() {
  const [open,    setOpen]    = useState(false)
  const [message, setMessage] = useState("")
  const [email,   setEmail]   = useState("")
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)
  const [error,   setError]   = useState("")
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const res = await fetch("/api/docs/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, email }),
    })
    setLoading(false)
    if (!res.ok) { setError("Something went wrong. Please try again."); return }
    setDone(true)
    setTimeout(() => { setOpen(false); setDone(false); setMessage(""); setEmail("") }, 1800)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-sm hover:bg-muted hover:text-foreground transition-colors"
      >
        Feedback
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 border border-border bg-background shadow-lg p-4 flex flex-col gap-3 z-50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Send feedback</span>
            <button
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-4" />
            </button>
          </div>

          {done ? (
            <p className="text-sm text-green-600 dark:text-green-400 py-2 text-center">
              Thanks for your feedback!
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Your email"
                required
                autoFocus
                className="w-full border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="What's on your mind?"
                required
                rows={4}
                maxLength={2000}
                className="w-full resize-none border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
              <Button type="submit" size="sm" className="w-full" disabled={loading || !message.trim()}>
                {loading ? "Sending…" : "Send"}
              </Button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
