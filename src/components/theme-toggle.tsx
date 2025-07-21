"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import { Switch } from "./ui/switch"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="theme-switch"
        checked={theme === 'dark'}
        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
        aria-label="Toggle theme"
      />
    </div>
  )
}
