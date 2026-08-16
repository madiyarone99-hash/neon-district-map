import { describe, expect, it } from 'vitest'
import {
  formatDelta,
  formatHectares,
  formatPrice,
  formatPriceCompact,
  formatTotalPrice,
  formatWalkMinutes,
} from './format'

describe('format', () => {
  it('formats a full price-per-sqm label', () => {
    expect(formatPrice(690000)).toMatch(/^690\s?000 ₸\/м²$/)
  })

  it('compacts large map labels to K/M without losing the digit the user needs', () => {
    expect(formatPriceCompact(690000)).toBe('690K')
    expect(formatPriceCompact(1050000)).toBe('1.1M')
    expect(formatPriceCompact(2000000)).toBe('2M')
  })

  it('multiplies price-per-sqm by real area, not a guessed one', () => {
    expect(formatTotalPrice(690000, 78)).toBe('53.8 млн ₸')
  })

  it('formats delta with an explicit sign', () => {
    expect(formatDelta(4.2)).toBe('+4.2% за год')
    expect(formatDelta(-1.5)).toBe('-1.5% за год')
  })

  it('marks area and walking time as approximations, never false precision', () => {
    expect(formatHectares(34000)).toBe('≈3.4 га')
    expect(formatHectares(400)).toBe('≈400 м²')
    expect(formatWalkMinutes(8)).toBe('≈8 мин пешком')
  })
})
