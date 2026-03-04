"use client"

import { useEffect } from "react"

export function ClearStaleCookie() {
  useEffect(() => {
    document.cookie = "last_workspace=; path=/; max-age=0"
  }, [])
  return null
}
