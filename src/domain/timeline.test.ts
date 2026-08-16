import { describe, expect, it } from 'vitest'
import {
  clampYear,
  lrtSegmentStatus,
  lrtStatusAtYear,
  lrtStatusLabel,
  nextYear,
  projectStatusFromPhase,
  yearProgress,
} from './timeline'

describe('timeline', () => {
  it('clamps years to the supported range', () => {
    expect(clampYear(1999)).toBe(2024)
    expect(clampYear(2040)).toBe(2032)
    expect(clampYear(2026)).toBe(2026)
  })

  it('advances one year and stops at the end', () => {
    expect(nextYear(2026)).toBe(2027)
    expect(nextYear(2032)).toBeNull()
  })

  it('maps LRT to planned / construction / open without inventing geometry', () => {
    expect(lrtStatusAtYear(2025)).toBe('planned')
    expect(lrtStatusAtYear(2026)).toBe('construction')
    expect(lrtStatusAtYear(2029)).toBe('construction')
    expect(lrtStatusAtYear(2030)).toBe('open')
    expect(lrtStatusLabel('construction')).toBe('Строится')
  })

  it('exposes a 0–1 progress for the slider', () => {
    expect(yearProgress(2024)).toBe(0)
    expect(yearProgress(2032)).toBe(1)
    expect(yearProgress(2028)).toBeCloseTo(0.5)
  })

  it('collapses six construction phases into the three states a user needs', () => {
    expect(projectStatusFromPhase('planned')).toBe('planned')
    expect(projectStatusFromPhase('excavation')).toBe('construction')
    expect(projectStatusFromPhase('structure')).toBe('construction')
    expect(projectStatusFromPhase('finishing')).toBe('construction')
    expect(projectStatusFromPhase('handover')).toBe('completed')
    expect(projectStatusFromPhase('sold')).toBe('completed')
    expect(projectStatusFromPhase(null)).toBeNull()
  })

  it('keeps a proposed LRT extension as a ghost outline regardless of year', () => {
    expect(lrtSegmentStatus('proposed', 2024)).toBe('proposed')
    expect(lrtSegmentStatus('proposed', 2032)).toBe('proposed')
    expect(lrtSegmentStatus('core', 2025)).toBe('planned')
    expect(lrtSegmentStatus('core', 2030)).toBe('open')
  })
})
