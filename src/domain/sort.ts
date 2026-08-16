import { getPhaseAtYear, getPriceAtYear } from './listings'
import { projectStatusFromPhase } from './timeline'
import type { Listing, ProjectStatus, SortKey } from './types'

export const SORT_META: Record<SortKey, string> = {
  recommended: 'Рекомендованные',
  'price-asc': 'Цена за м² ↑',
  'price-desc': 'Цена за м² ↓',
  'total-asc': 'Общая цена ↑',
  'nearest-lrt': 'Ближе к LRT',
  'nearest-park': 'Ближе к парку',
  completion: 'Срок сдачи',
}

export interface ListingContext {
  listing: Listing
  status: ProjectStatus | null
  pricePerSqm: number | null
  totalPrice: number | null
  lrtMeters: number | null
  parkMeters: number | null
  completionYear: number | null
}

export function completionYear(listing: Listing): number | null {
  const years = Object.entries(listing.phaseByYear)
    .filter(([, phase]) => phase === 'handover' || phase === 'sold')
    .map(([year]) => Number(year))
  if (years.length === 0) return null
  return Math.min(...years)
}

export function buildListingContext(
  listing: Listing,
  year: number,
  distances: { lrtMeters: number | null; parkMeters: number | null },
): ListingContext {
  const phase = getPhaseAtYear(listing, year)
  const pricePerSqm = getPriceAtYear(listing, year)
  return {
    listing,
    status: projectStatusFromPhase(phase),
    pricePerSqm,
    totalPrice: pricePerSqm != null ? pricePerSqm * listing.areaSqm : null,
    lrtMeters: distances.lrtMeters,
    parkMeters: distances.parkMeters,
    completionYear: completionYear(listing),
  }
}

function withFallback(value: number | null, fallback: number): number {
  return value ?? fallback
}

export function sortListingContexts(items: ListingContext[], sortKey: SortKey): ListingContext[] {
  const sorted = [...items]
  switch (sortKey) {
    case 'price-asc':
      sorted.sort((a, b) => withFallback(a.pricePerSqm, Infinity) - withFallback(b.pricePerSqm, Infinity))
      break
    case 'price-desc':
      sorted.sort((a, b) => withFallback(b.pricePerSqm, -Infinity) - withFallback(a.pricePerSqm, -Infinity))
      break
    case 'total-asc':
      sorted.sort((a, b) => withFallback(a.totalPrice, Infinity) - withFallback(b.totalPrice, Infinity))
      break
    case 'nearest-lrt':
      sorted.sort((a, b) => withFallback(a.lrtMeters, Infinity) - withFallback(b.lrtMeters, Infinity))
      break
    case 'nearest-park':
      sorted.sort((a, b) => withFallback(a.parkMeters, Infinity) - withFallback(b.parkMeters, Infinity))
      break
    case 'completion':
      sorted.sort((a, b) => withFallback(a.completionYear, Infinity) - withFallback(b.completionYear, Infinity))
      break
    case 'recommended':
    default:
      // Recommended keeps the catalogue's own order — no unexplained "AI score".
      break
  }
  return sorted
}

export function filterListingContextsByStatus(
  items: ListingContext[],
  statuses: ReadonlySet<ProjectStatus>,
): ListingContext[] {
  if (statuses.size === 0) return items
  return items.filter((item) => item.status != null && statuses.has(item.status))
}

export function filterListingContextsByMaxPrice(
  items: ListingContext[],
  maxPricePerSqm: number | null,
): ListingContext[] {
  if (maxPricePerSqm == null) return items
  return items.filter((item) => item.pricePerSqm == null || item.pricePerSqm <= maxPricePerSqm)
}
