import { useCallback, useEffect, useState } from 'react'
import {
  THEME_STORAGE_KEY,
  nextThemeMode,
  readStoredThemeMode,
  resolveTheme,
  type ThemeMode,
} from './theme'

function systemPrefersLight(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-color-scheme: light)').matches
}

export function useTheme(): { mode: ThemeMode; resolved: 'light' | 'dark'; cycle: () => void } {
  const [mode, setMode] = useState<ThemeMode>(() =>
    readStoredThemeMode(typeof localStorage === 'undefined' ? null : localStorage),
  )
  const [prefersLight, setPrefersLight] = useState(systemPrefersLight)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const media = window.matchMedia('(prefers-color-scheme: light)')
    const onChange = () => setPrefersLight(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const resolved = resolveTheme(mode, prefersLight)

  useEffect(() => {
    document.documentElement.dataset.theme = resolved
  }, [resolved])

  const cycle = useCallback(() => {
    setMode((current) => {
      const next = nextThemeMode(current)
      try {
        if (next === 'system') localStorage.removeItem(THEME_STORAGE_KEY)
        else localStorage.setItem(THEME_STORAGE_KEY, next)
      } catch {
        // Storage can be unavailable (private mode); the toggle still works in-session.
      }
      return next
    })
  }, [])

  return { mode, resolved, cycle }
}
