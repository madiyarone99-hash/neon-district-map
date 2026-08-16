import { describe, expect, it } from 'vitest'
import {
  nextThemeMode,
  readStoredThemeMode,
  resolveTheme,
  themeModeLabel,
} from './theme'

describe('theme', () => {
  it('resolves system mode from the OS media query, not a guess', () => {
    expect(resolveTheme('system', true)).toBe('light')
    expect(resolveTheme('system', false)).toBe('dark')
  })

  it('lets an explicit mode win over the system preference', () => {
    expect(resolveTheme('dark', true)).toBe('dark')
    expect(resolveTheme('light', false)).toBe('light')
  })

  it('cycles system -> light -> dark -> system', () => {
    expect(nextThemeMode('system')).toBe('light')
    expect(nextThemeMode('light')).toBe('dark')
    expect(nextThemeMode('dark')).toBe('system')
  })

  it('labels each mode in Russian for the UI toggle', () => {
    expect(themeModeLabel('system')).toBe('Системная')
    expect(themeModeLabel('light')).toBe('Светлая')
    expect(themeModeLabel('dark')).toBe('Тёмная')
  })

  it('falls back to system when storage is empty or unavailable', () => {
    expect(readStoredThemeMode(null)).toBe('system')
    expect(readStoredThemeMode({ getItem: () => null })).toBe('system')
    expect(readStoredThemeMode({ getItem: () => 'light' })).toBe('light')
    expect(readStoredThemeMode({ getItem: () => 'garbage' })).toBe('system')
  })
})
