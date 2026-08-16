import { describe, expect, it } from 'vitest'
import { findListing } from './listings'
import {
  buildListingContext,
  completionYear,
  filterListingContextsByMaxPrice,
  filterListingContextsByStatus,
  sortListingContexts,
} from './sort'

const prism = findListing('prism')!
const canal = findListing('canal')!
const lrtHub = findListing('lrt-hub')!

describe('completionYear', () => {
  it('reads the first handover/sold year straight from the model, no guessing', () => {
    expect(completionYear(prism)).toBe(2028)
  })
})

describe('sortListingContexts', () => {
  const year = 2027
  const items = [prism, canal, lrtHub].map((listing) =>
    buildListingContext(listing, year, { lrtMeters: null, parkMeters: null }),
  )

  it('sorts by price per sqm ascending', () => {
    const sorted = sortListingContexts(items, 'price-asc')
    const prices = sorted.map((item) => item.pricePerSqm)
    expect(prices).toEqual([...prices].sort((a, b) => (a ?? Infinity) - (b ?? Infinity)))
  })

  it('sorts by completion year', () => {
    const sorted = sortListingContexts(items, 'completion')
    for (let i = 1; i < sorted.length; i += 1) {
      const prev = sorted[i - 1].completionYear ?? Infinity
      const cur = sorted[i].completionYear ?? Infinity
      expect(prev).toBeLessThanOrEqual(cur)
    }
  })

  it('keeps catalogue order for "recommended" instead of inventing a score', () => {
    const sorted = sortListingContexts(items, 'recommended')
    expect(sorted.map((item) => item.listing.id)).toEqual(items.map((item) => item.listing.id))
  })
})

describe('status + price filters', () => {
  const year = 2026
  const items = [prism, canal, lrtHub].map((listing) =>
    buildListingContext(listing, year, { lrtMeters: null, parkMeters: null }),
  )

  it('filters by construction status', () => {
    const onlyPlanned = filterListingContextsByStatus(items, new Set(['planned']))
    expect(onlyPlanned.every((item) => item.status === 'planned')).toBe(true)
  })

  it('an empty status set means "no filter applied"', () => {
    expect(filterListingContextsByStatus(items, new Set())).toHaveLength(items.length)
  })

  it('filters by a price ceiling', () => {
    const capped = filterListingContextsByMaxPrice(items, 400000)
    expect(capped.every((item) => item.pricePerSqm == null || item.pricePerSqm <= 400000)).toBe(true)
  })
})
