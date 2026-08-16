export type LonLat = [number, number]

const EARTH_RADIUS_M = 6371000

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

export function haversineMeters(a: LonLat, b: LonLat): number {
  const dLat = toRad(b[1] - a[1])
  const dLon = toRad(b[0] - a[0])
  const lat1 = toRad(a[1])
  const lat2 = toRad(b[1])
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)))
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} м`
  return `${(meters / 1000).toFixed(1)} км`
}

export function closeRing(coords: LonLat[]): LonLat[] {
  if (coords.length === 0) return coords
  const first = coords[0]
  const last = coords[coords.length - 1]
  if (first[0] === last[0] && first[1] === last[1]) return coords
  return [...coords, first]
}

export function centroidOfRing(coords: LonLat[]): LonLat {
  const ring = coords.length > 0 ? coords : [[0, 0] as LonLat]
  let x = 0
  let y = 0
  const n = ring.length > 1 && ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1]
    ? ring.length - 1
    : ring.length
  for (let i = 0; i < n; i += 1) {
    x += ring[i][0]
    y += ring[i][1]
  }
  return [x / n, y / n]
}

export function nearestDistance(
  from: LonLat,
  points: Array<{ coordinates: LonLat }>,
): number | null {
  if (points.length === 0) return null
  let best = Infinity
  for (const point of points) {
    const d = haversineMeters(from, point.coordinates)
    if (d < best) best = d
  }
  return Number.isFinite(best) ? best : null
}

const METERS_PER_DEGREE_LAT = 110_574

/**
 * Planar approximation (equirectangular around the ring's own latitude),
 * accurate to a fraction of a percent at this district's size. Good enough
 * to show "≈3.1 га" next to a real park polygon — not good enough to be
 * presented as a cadastral measurement, so callers should keep the ≈.
 */
export function ringAreaSqm(ring: LonLat[]): number {
  if (ring.length < 3) return 0
  const meanLat = ring.reduce((sum, [, lat]) => sum + lat, 0) / ring.length
  const metersPerDegreeLon = METERS_PER_DEGREE_LAT * Math.cos(toRad(meanLat))
  const points = ring.map(([lon, lat]) => [
    lon * metersPerDegreeLon,
    lat * METERS_PER_DEGREE_LAT,
  ])
  let sum = 0
  for (let i = 0; i < points.length; i += 1) {
    const [x1, y1] = points[i]
    const [x2, y2] = points[(i + 1) % points.length]
    sum += x1 * y2 - x2 * y1
  }
  return Math.abs(sum) / 2
}

const WALK_METERS_PER_MINUTE = 80 // ≈4.8 km/h, a relaxed city walking pace

export function walkingMinutes(meters: number): number {
  return Math.max(1, Math.round(meters / WALK_METERS_PER_MINUTE))
}
