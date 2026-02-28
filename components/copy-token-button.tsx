"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function CopyTokenButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant="outline" size="sm" onClick={copy} className="shrink-0">
      {copied ? "Copied!" : label}
    </Button>
  )
}
