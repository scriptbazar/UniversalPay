"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"
import { Sun, Moon } from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const isDark = theme === 'dark';

  const handleToggle = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  return (
    <div className="flex items-center gap-2">
      <Sun className={`h-5 w-5 transition-colors ${isDark ? 'text-muted-foreground' : 'text-primary'}`} />
      <Switch
        id="theme-toggle"
        checked={isDark}
        onCheckedChange={handleToggle}
        aria-label="Toggle theme"
      />
      <Moon className={`h-5 w-5 transition-colors ${isDark ? 'text-primary' : 'text-muted-foreground'}`} />
    </div>
  )
}