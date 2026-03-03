"use client"

import { useState, useEffect, useTransition } from "react"
import { usePathname } from "next/navigation"

export function PageFeedback() {
  const pathname = usePathname()
  const [phase, setPhase] = useState<"idle" | "yes" | "no" | "sent">("idle")
  const [comment, setComment] = useState("")
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setPhase("idle")
    setComment("")
  }, [pathname])

  async function send(helpful: boolean) {
    startTransition(async () => {
      await fetch("/api/docs/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: pathname, helpful, comment }),
      })
      setPhase("sent")
    })
  }

  if (phase === "sent") {
    return (
      <div className="border-t border-border mt-12 pt-8">
        <p className="text-sm text-muted-foreground">Thanks for the feedback!</p>
      </div>
    )
  }

  return (
    <div className="border-t border-border mt-12 pt-8">
      <div className="flex items-center justify-center gap-4">
        <p className="text-sm text-muted-foreground">Was this page helpful?</p>
        <div className="flex items-center gap-2">
          {(["yes", "no"] as const).map(v => (
            <button
              key={v}
              onClick={() => { setPhase(v); setComment("") }}
              className={`text-xs font-mono border px-3 py-1.5 transition-colors capitalize ${
                phase === v
                  ? "border-primary text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
              }`}
            >
              {v === "yes" ? "Yes" : "No"}
            </button>
          ))}
        </div>
      </div>

      {(phase === "yes" || phase === "no") && (
        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-2">
            {phase === "yes" ? "Glad it helped! Anything else to add?" : "Sorry to hear that. What could be better?"}
          </p>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Optional — leave a comment…"
            rows={3}
            className="w-full text-sm bg-muted/30 border border-border px-3 py-2 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary/50 transition-colors"
          />
          <div className="flex items-center justify-between mt-2">
            <button
              onClick={() => { setPhase("idle"); setComment("") }}
              className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => send(phase === "yes")}
              disabled={isPending}
              className="text-xs font-mono border border-border px-3 py-1.5 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors disabled:opacity-50"
            >
              {isPending ? "Sending…" : "Send"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
