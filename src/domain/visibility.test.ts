import { describe, expect, it } from 'vitest'
import { DEFAULT_FILTERS, createFilters, toggleFilter } from './filters'
import { LISTINGS } from './listings'
import {
  CLOSE_ZOOM,
  MEDIUM_ZOOM,
  listingOnMap,
  parkLabelMinZoom,
  poiLabelMinZoom,
  priceMarkerFullLabelZoom,
  priceMarkerMinZoom,
} from './visibility'

const canal = LISTINGS.find((item) => item.id === 'canal')!

describe('listingOnMap', () => {
  it('hides future listings until their appear year', () => {
    expect(listingOnMap(canal, 2024, DEFAULT_FILTERS)).toBe(false)
    expect(listingOnMap(canal, 2025, DEFAULT_FILTERS)).toBe(true)
  })

  it('respects the sales layer switch', () => {
    const filters = createFilters({ layers: { ...DEFAULT_FILTERS.layers, sales: false } })
    expect(listingOnMap(canal, 2026, filters)).toBe(false)
  })
})

describe('semantic zoom bands', () => {
  it('reveals price markers earlier for the selected project than the crowd', () => {
    expect(priceMarkerMinZoom(true)).toBeLessThan(priceMarkerMinZoom(false))
    expect(priceMarkerMinZoom(false)).toBe(MEDIUM_ZOOM)
  })

  it('only shows the full name + price label once close, unless selected', () => {
    expect(priceMarkerFullLabelZoom(false)).toBe(CLOSE_ZOOM)
    expect(priceMarkerFullLabelZoom(true)).toBeLessThan(CLOSE_ZOOM)
  })

  it('gives malls a lower label threshold than schools/shops (bigger, rarer objects)', () => {
    expect(poiLabelMinZoom('mall')).toBeLessThan(poiLabelMinZoom('school'))
  })

  it('labels parks only once the territory itself is already legible', () => {
    expect(parkLabelMinZoom()).toBeGreaterThan(MEDIUM_ZOOM)
  })
})

describe('toggleFilter regression', () => {
  it('still flips exactly the requested layer', () => {
    const next = toggleFilter(DEFAULT_FILTERS, 'parks')
    expect(next.layers.parks).toBe(false)
    expect(next.layers.sales).toBe(true)
  })
})
