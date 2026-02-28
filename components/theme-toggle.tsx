"use client"

import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Sun01Icon, MoonIcon, ComputerIcon } from "@hugeicons/core-free-icons"

const icons = {
  light:  Sun01Icon,
  dark:   MoonIcon,
  system: ComputerIcon,
}

const next = { light: "dark", dark: "system", system: "light" } as const

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={() => setTheme(next[theme])}
      title={`Theme: ${theme}`}
    >
      <HugeiconsIcon icon={icons[theme]} strokeWidth={2} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
