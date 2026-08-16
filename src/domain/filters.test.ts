import { describe, expect, it } from 'vitest'
import {
  DEFAULT_FILTERS,
  activeFilterCount,
  activePoiCount,
  amenityKindVisible,
  createFilters,
  isLayerId,
  isPoiKind,
  poiKindVisible,
  toggleFilter,
  togglePoiFilter,
} from './filters'

describe('filters', () => {
  it('starts with sales, LRT and parks on; POI master switch off', () => {
    expect(DEFAULT_FILTERS.layers).toEqual({
      sales: true,
      lrt: true,
      parks: true,
      poi: false,
    })
    expect(activeFilterCount(DEFAULT_FILTERS)).toBe(3)
  })

  it('defaults every POI sub-kind to visible once the master switch is on', () => {
    expect(activePoiCount(DEFAULT_FILTERS)).toBe(4)
  })

  it('toggles a single layer without mutating the original', () => {
    const next = toggleFilter(DEFAULT_FILTERS, 'poi')
    expect(next.layers.poi).toBe(true)
    expect(DEFAULT_FILTERS.layers.poi).toBe(false)
  })

  it('toggles a single POI sub-kind independently of the others', () => {
    const next = togglePoiFilter(DEFAULT_FILTERS, 'mall')
    expect(next.poi.mall).toBe(false)
    expect(next.poi.school).toBe(true)
  })

  it('accepts partial overrides', () => {
    expect(createFilters({ layers: { ...DEFAULT_FILTERS.layers, lrt: false } }).layers.lrt).toBe(false)
    expect(createFilters({ layers: { ...DEFAULT_FILTERS.layers, lrt: false } }).layers.sales).toBe(true)
  })

  it('guards unknown layer and POI ids', () => {
    expect(isLayerId('lrt')).toBe(true)
    expect(isLayerId('ufo')).toBe(false)
    expect(isPoiKind('mall')).toBe(true)
    expect(isPoiKind('ufo')).toBe(false)
  })

  it('gates POI kinds behind the master switch', () => {
    expect(poiKindVisible('school', DEFAULT_FILTERS)).toBe(false)
    const withPoi = toggleFilter(DEFAULT_FILTERS, 'poi')
    expect(poiKindVisible('school', withPoi)).toBe(true)
  })

  it('routes transit and park through their own dedicated map layers, not generic POI', () => {
    const withPoi = toggleFilter(DEFAULT_FILTERS, 'poi')
    expect(amenityKindVisible('transit', withPoi)).toBe(false)
    expect(amenityKindVisible('park', withPoi)).toBe(false)
    expect(amenityKindVisible('school', withPoi)).toBe(true)
  })
})
