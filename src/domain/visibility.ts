import type { AmenityKind, FilterState } from './types'
import { listingVisibleInYear } from './listings'
import type { Listing } from './types'

/**
 * Semantic zoom bands for the whole map. These are the only three
 * information densities a user should ever see — no ad-hoc per-layer
 * thresholds sprinkled elsewhere.
 *
 *  FAR    (< MEDIUM_ZOOM)   — silhouette only: massing, LRT line, park tint.
 *  MEDIUM (>= MEDIUM_ZOOM)  — ЖК price pill, LRT stations, parks/POI icons.
 *  CLOSE  (>= CLOSE_ZOOM)   — full ЖК name + price, POI names, station names.
 */
export const MEDIUM_ZOOM = 13.2
export const CLOSE_ZOOM = 15.0

export function listingOnMap(
  listing: Listing,
  year: number,
  filters: FilterState,
): boolean {
  return filters.layers.sales && listingVisibleInYear(listing, year)
}

export function priceMarkerMinZoom(selected: boolean): number {
  return selected ? MEDIUM_ZOOM - 0.6 : MEDIUM_ZOOM
}

export function priceMarkerFullLabelZoom(selected: boolean): number {
  return selected ? MEDIUM_ZOOM : CLOSE_ZOOM
}

export function constructionBadgeMinZoom(): number {
  return MEDIUM_ZOOM + 0.4
}

export function lrtStationMinZoom(): number {
  return MEDIUM_ZOOM - 1.4
}

export function lrtStationLabelMinZoom(): number {
  return MEDIUM_ZOOM
}

export function parkIconMinZoom(): number {
  return MEDIUM_ZOOM - 0.6
}

export function parkLabelMinZoom(): number {
  return MEDIUM_ZOOM + 0.6
}

export function poiIconMinZoom(): number {
  return MEDIUM_ZOOM + 0.2
}

export function poiLabelMinZoom(kind: AmenityKind): number {
  if (kind === 'mall') return MEDIUM_ZOOM + 0.6
  return CLOSE_ZOOM
}
