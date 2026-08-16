import type { HeightSource } from './types'

export const LEVEL_METERS = 3.2
export const FALLBACK_HEIGHT_M = 10
export const MIN_OSM_HEIGHT_M = 2
export const MAX_OSM_HEIGHT_M = 220
export const MIN_LEVELS = 1
export const MAX_LEVELS = 70

export function parseOsmHeight(raw: string | number | null | undefined): number | null {
  if (raw == null || raw === '') return null
  const text = String(raw).trim().replace(',', '.')
  const match = text.match(/-?\d+(?:\.\d+)?/)
  if (!match) return null
  const value = Number(match[0])
  if (!Number.isFinite(value)) return null
  if (value < MIN_OSM_HEIGHT_M || value > MAX_OSM_HEIGHT_M) return null
  return value
}

export function parseOsmLevels(raw: string | number | null | undefined): number | null {
  if (raw == null || raw === '') return null
  const value = Number(String(raw).trim().replace(',', '.'))
  if (!Number.isFinite(value)) return null
  if (value < MIN_LEVELS || value > MAX_LEVELS) return null
  return value
}

export function deriveBuildingHeight(tags: {
  height?: string | number | null
  'building:levels'?: string | number | null
}): { height: number; source: HeightSource; levels: number | null } {
  const measured = parseOsmHeight(tags.height)
  if (measured != null) {
    return {
      height: measured,
      source: 'osm-height',
      levels: Math.max(1, Math.round(measured / LEVEL_METERS)),
    }
  }

  const levels = parseOsmLevels(tags['building:levels'])
  if (levels != null) {
    return {
      height: Number((levels * LEVEL_METERS).toFixed(1)),
      source: 'osm-levels',
      levels,
    }
  }

  return { height: FALLBACK_HEIGHT_M, source: 'unknown-fallback', levels: null }
}

export function floorsFromHeight(height: number, source: HeightSource): number | null {
  if (source === 'unknown-fallback') return null
  return Math.max(1, Math.round(height / LEVEL_METERS))
}

export function heightSourceLabel(source: HeightSource): string {
  if (source === 'osm-height') return 'высота из OSM'
  if (source === 'osm-levels') return `этажи OSM × ${LEVEL_METERS} м`
  return `нет данных · условные ${FALLBACK_HEIGHT_M} м`
}
