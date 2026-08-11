"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"
import { Sun, Moon } from "lucide-react"

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-6 w-11 rounded-full bg-muted dark:bg-slate-800 animate-pulse"></div>
      </div>
    );
  }

  // Use resolvedTheme so system dark mode correctly highlights the dark switch position
  const isDark = (resolvedTheme || theme) === 'dark';

  const handleToggle = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  return (
    <div className="flex items-center gap-2 bg-muted/80 dark:bg-slate-900/80 px-2.5 py-1.5 rounded-full border border-border dark:border-slate-800 transition-colors">
      <Sun className={`h-4 w-4 transition-colors ${!isDark ? 'text-amber-500 font-bold' : 'text-muted-foreground'}`} />
      <Switch
        id="theme-toggle"
        checked={isDark}
        onCheckedChange={handleToggle}
        aria-label="Toggle dark mode"
      />
      <Moon className={`h-4 w-4 transition-colors ${isDark ? 'text-cyan-400 font-bold' : 'text-muted-foreground'}`} />
    </div>
  )
}
