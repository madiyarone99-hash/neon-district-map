import type { AmenityKind, FilterState, LayerId, PoiKind } from './types'
import { LAYER_IDS, POI_KINDS } from './types'

export const LAYER_META: Record<LayerId, { label: string; hint: string }> = {
  sales: { label: 'Продажа', hint: 'Жилые объекты с условиями покупки' },
  lrt: { label: 'LRT', hint: 'Линия Tarlan Astana и станции' },
  parks: { label: 'Парки', hint: 'Парки и скверы по данным OSM' },
  poi: { label: 'Инфраструктура', hint: 'Школы, сады, ТРЦ и магазины рядом' },
}

export const POI_META: Record<PoiKind, { label: string; hint: string }> = {
  school: { label: 'Школы', hint: 'Школы по данным OSM' },
  kindergarten: { label: 'Детские сады', hint: 'Детские сады и ясли по данным OSM' },
  mall: { label: 'ТРЦ', hint: 'Крупные торговые центры' },
  shopping: { label: 'Магазины', hint: 'Супермаркеты и небольшие магазины' },
}

export const DEFAULT_FILTERS: FilterState = {
  layers: { sales: true, lrt: true, parks: true, poi: false },
  poi: { school: true, kindergarten: true, mall: true, shopping: true },
}

export function createFilters(overrides: Partial<FilterState> = {}): FilterState {
  return {
    layers: { ...DEFAULT_FILTERS.layers, ...overrides.layers },
    poi: { ...DEFAULT_FILTERS.poi, ...overrides.poi },
  }
}

export function toggleFilter(filters: FilterState, id: LayerId): FilterState {
  return { ...filters, layers: { ...filters.layers, [id]: !filters.layers[id] } }
}

export function setFilter(filters: FilterState, id: LayerId, on: boolean): FilterState {
  return { ...filters, layers: { ...filters.layers, [id]: on } }
}

export function togglePoiFilter(filters: FilterState, kind: PoiKind): FilterState {
  return { ...filters, poi: { ...filters.poi, [kind]: !filters.poi[kind] } }
}

export function activeFilterIds(filters: FilterState): LayerId[] {
  return LAYER_IDS.filter((id) => filters.layers[id])
}

export function activeFilterCount(filters: FilterState): number {
  return activeFilterIds(filters).length
}

export function activePoiCount(filters: FilterState): number {
  return POI_KINDS.filter((kind) => filters.poi[kind]).length
}

export function isLayerId(value: string): value is LayerId {
  return (LAYER_IDS as readonly string[]).includes(value)
}

export function isPoiKind(value: string): value is PoiKind {
  return (POI_KINDS as readonly string[]).includes(value)
}

export function poiKindVisible(kind: PoiKind, filters: FilterState): boolean {
  return filters.layers.poi && filters.poi[kind]
}

/** Used by the map's generic POI symbol layer, which only ever renders POI_KINDS. */
export function amenityKindVisible(kind: AmenityKind, filters: FilterState): boolean {
  if (kind === 'transit' || kind === 'park') return false
  return poiKindVisible(kind, filters)
}
