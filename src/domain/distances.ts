import { formatDistance, haversineMeters, type LonLat } from './geo'
import type { AmenityKind } from './types'

export interface DistanceItem {
  kind: AmenityKind
  name: string
  meters: number
  label: string
}

export function nearestOfKind(
  from: LonLat,
  points: Array<{ kind: AmenityKind; name: string | null; coordinates: LonLat }>,
  kind: AmenityKind,
): DistanceItem | null {
  const matches = points.filter((point) => point.kind === kind)
  if (matches.length === 0) return null
  let best = matches[0]
  let bestMeters = haversineMeters(from, best.coordinates)
  for (const point of matches.slice(1)) {
    const meters = haversineMeters(from, point.coordinates)
    if (meters < bestMeters) {
      best = point
      bestMeters = meters
    }
  }
  return {
    kind,
    name: best.name || fallbackName(kind),
    meters: bestMeters,
    label: formatDistance(bestMeters),
  }
}

function fallbackName(kind: AmenityKind): string {
  if (kind === 'transit') return 'Станция LRT'
  if (kind === 'park') return 'Парк'
  if (kind === 'school') return 'Школа'
  return 'Магазин'
}

export function listingDistances(
  from: LonLat,
  points: Array<{ kind: AmenityKind; name: string | null; coordinates: LonLat }>,
): DistanceItem[] {
  const kinds: AmenityKind[] = ['transit', 'park', 'school', 'shopping']
  return kinds
    .map((kind) => nearestOfKind(from, points, kind))
    .filter((item): item is DistanceItem => item != null)
}
