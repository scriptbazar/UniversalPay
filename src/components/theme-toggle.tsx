"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Render a placeholder or nothing on the server to avoid mismatch
    return (
        <div className="flex items-center gap-2">
            <div className="h-6 w-11 rounded-full bg-input"></div>
        </div>
    );
  }

  const isDark = theme === 'dark';

  const handleToggle = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  return (
    <div className="flex items-center gap-2">
      <Switch
        id="theme-toggle"
        checked={isDark}
        onCheckedChange={handleToggle}
        aria-label="Toggle theme"
      />
    </div>
  )
}
