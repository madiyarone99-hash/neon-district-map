export type ThemeMode = 'system' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'nexus7-theme'

export function systemTheme(matches: boolean): ResolvedTheme {
  return matches ? 'light' : 'dark'
}

export function resolveTheme(mode: ThemeMode, systemPrefersLight: boolean): ResolvedTheme {
  if (mode === 'system') return systemTheme(systemPrefersLight)
  return mode
}

export function nextThemeMode(mode: ThemeMode): ThemeMode {
  if (mode === 'system') return 'light'
  if (mode === 'light') return 'dark'
  return 'system'
}

export function themeModeLabel(mode: ThemeMode): string {
  if (mode === 'system') return 'Системная'
  if (mode === 'light') return 'Светлая'
  return 'Тёмная'
}

export function readStoredThemeMode(storage: Pick<Storage, 'getItem'> | null): ThemeMode {
  const stored = storage?.getItem(THEME_STORAGE_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  return 'system'
}
