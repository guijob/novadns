"use client"

import { useEffect, useState } from "react"

const TARGETS = [
  "cameras.",
  "IoT devices.",
  "routers.",
  "gateways.",
  "remote sites.",
  "connected devices.",
]

const TYPE_SPEED = 80
const DELETE_SPEED = 50
const PAUSE_AFTER_TYPE = 2000
const PAUSE_AFTER_DELETE = 400

export function Typewriter() {
  const [index, setIndex] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [deleting, setDeleting] = useState(false)

  const word = TARGETS[index]

  useEffect(() => {
    if (!deleting && charCount === word.length) {
      const t = setTimeout(() => setDeleting(true), PAUSE_AFTER_TYPE)
      return () => clearTimeout(t)
    }

    if (deleting && charCount === 0) {
      const t = setTimeout(() => {
        setDeleting(false)
        setIndex((i) => (i + 1) % TARGETS.length)
      }, PAUSE_AFTER_DELETE)
      return () => clearTimeout(t)
    }

    const speed = deleting ? DELETE_SPEED : TYPE_SPEED
    const t = setTimeout(
      () => setCharCount((c) => c + (deleting ? -1 : 1)),
      speed,
    )
    return () => clearTimeout(t)
  }, [charCount, deleting, word.length])

  return (
    <>
      {word.slice(0, charCount)}
      <span className="inline-block w-[2px] h-[1em] bg-primary align-baseline ml-0.5 animate-blink" />
    </>
  )
}
