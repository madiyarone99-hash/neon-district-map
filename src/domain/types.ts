export const YEARS = [2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032] as const
export type Year = (typeof YEARS)[number]

export const PHASES = [
  'planned',
  'excavation',
  'structure',
  'finishing',
  'handover',
  'sold',
] as const
export type Phase = (typeof PHASES)[number]

export const LAYER_IDS = ['sales', 'lrt', 'parks', 'poi'] as const
export type LayerId = (typeof LAYER_IDS)[number]

export const POI_KINDS = ['school', 'kindergarten', 'mall', 'shopping'] as const
export type PoiKind = (typeof POI_KINDS)[number]

export interface FilterState {
  layers: Record<LayerId, boolean>
  poi: Record<PoiKind, boolean>
}

export type HeightSource = 'osm-height' | 'osm-levels' | 'unknown-fallback'

export type AmenityKind = 'school' | 'kindergarten' | 'shopping' | 'mall' | 'transit' | 'park'
export type ListingAmenity = 'lrt' | 'park' | 'school' | 'shopping'

export type LrtStatus = 'planned' | 'construction' | 'open'
export type LrtLineStatus = LrtStatus | 'proposed'

export type ProjectStatus = 'planned' | 'construction' | 'completed'

export type SortKey =
  | 'recommended'
  | 'price-asc'
  | 'price-desc'
  | 'total-asc'
  | 'nearest-lrt'
  | 'nearest-park'
  | 'completion'

export type ViewMode = 'map' | 'list'

export type SheetMode = 'peek' | 'expanded'

export interface PricePoint {
  year: number
  pricePerSqm: number
}

export interface Listing {
  id: string
  osmId: number
  name: string
  osmName: string
  tagline: string
  classLabel: string
  areaSqm: number
  amenities: ListingAmenity[]
  conditions: string[]
  appearYear: Year
  phaseByYear: Partial<Record<Year, Phase>>
  prices: PricePoint[]
  futurePlan: string
}

export interface CityBuilding {
  id: number
  coords: [number, number][]
  height: number
  source: HeightSource
}

export interface SaleBuilding extends CityBuilding {
  osmId: number
  centroid: [number, number]
  osmName: string
}

export interface CityPayload {
  meta: { levelMeters: number; note: string }
  ctx: Array<{ id: number; c: [number, number][]; h: number; src: HeightSource }>
  sale: Array<{
    osmId: number
    c: [number, number][]
    h: number
    src: HeightSource
    cx: number
    cy: number
    osmName: string
  }>
}

export interface AmenityFeatureProps {
  id: string
  kind: AmenityKind
  name: string | null
}
