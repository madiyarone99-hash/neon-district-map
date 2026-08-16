import { amenityKindVisible } from '../domain/filters'
import { closeRing, ringAreaSqm } from '../domain/geo'
import { floorsFromHeight } from '../domain/height'
import { LISTINGS, getPriceAtYear, getPhaseAtYear, listingVisibleInYear } from '../domain/listings'
import { formatPriceCompact } from '../domain/format'
import { lrtSegmentStatus, projectStatusFromPhase } from '../domain/timeline'
import type { CityPayload, FilterState, HeightSource } from '../domain/types'

export interface ContextProps {
  id: string
  height: number
  source: HeightSource
  kind: 'context'
  knownHeight: boolean
}

export interface SaleProps {
  id: string
  listingId: string
  osmId: number
  name: string
  osmName: string
  height: number
  source: HeightSource
  floors: number | null
  phase: string
  status: 'planned' | 'construction' | 'completed'
  appearYear: number
  pricePerSqm: number | null
  priceCompact: string
  priceLabelMedium: string
  priceLabelClose: string
  classLabel: string
  kind: 'sale'
}

const NO_PRICE_LABEL = 'Скоро в продаже'

type PolygonFeature<P> = {
  type: 'Feature'
  id: string | number
  properties: P
  geometry: { type: 'Polygon'; coordinates: [number, number][][] }
}

type PointFeature<P> = {
  type: 'Feature'
  id: string
  properties: P
  geometry: { type: 'Point'; coordinates: [number, number] }
}

export function contextCollection(payload: CityPayload): {
  type: 'FeatureCollection'
  features: PolygonFeature<ContextProps>[]
} {
  const saleIds = new Set(payload.sale.map((item) => item.osmId))
  return {
    type: 'FeatureCollection',
    features: payload.ctx
      .filter((building) => !saleIds.has(building.id))
      .map((building) => ({
        type: 'Feature' as const,
        id: building.id,
        properties: {
          id: String(building.id),
          height: building.h,
          source: building.src,
          kind: 'context' as const,
          knownHeight: building.src !== 'unknown-fallback',
        },
        geometry: {
          type: 'Polygon' as const,
          coordinates: [closeRing(building.c)],
        },
      })),
  }
}

export function saleCollection(
  payload: CityPayload,
  year: number,
  filters: FilterState,
): {
  type: 'FeatureCollection'
  features: PolygonFeature<SaleProps>[]
} {
  const byOsm = new Map(payload.sale.map((item) => [item.osmId, item]))
  const features: PolygonFeature<SaleProps>[] = []

  for (const listing of LISTINGS) {
    const footprint = byOsm.get(listing.osmId)
    if (!footprint) continue
    if (!filters.layers.sales || !listingVisibleInYear(listing, year)) continue
    const phase = getPhaseAtYear(listing, year)
    if (!phase) continue
    const status = projectStatusFromPhase(phase) ?? 'planned'
    const pricePerSqm = getPriceAtYear(listing, year)
    const priceCompact = pricePerSqm != null ? formatPriceCompact(pricePerSqm) : ''
    const priceLabelMedium = pricePerSqm != null ? `${priceCompact} ₸/м²` : NO_PRICE_LABEL
    features.push({
      type: 'Feature',
      id: listing.id,
      properties: {
        id: listing.id,
        listingId: listing.id,
        osmId: listing.osmId,
        name: listing.name,
        osmName: footprint.osmName || listing.osmName,
        height: footprint.h,
        source: footprint.src,
        floors: floorsFromHeight(footprint.h, footprint.src),
        phase,
        status,
        appearYear: listing.appearYear,
        pricePerSqm,
        priceCompact,
        priceLabelMedium,
        priceLabelClose: `${listing.name}\n${priceLabelMedium}`,
        classLabel: listing.classLabel,
        kind: 'sale',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [closeRing(footprint.c)],
      },
    })
  }

  return { type: 'FeatureCollection', features }
}

export function saleCenters(
  payload: CityPayload,
  year: number,
  filters: FilterState,
): {
  type: 'FeatureCollection'
  features: PointFeature<SaleProps>[]
} {
  const polygons = saleCollection(payload, year, filters)
  const byOsm = new Map(payload.sale.map((item) => [item.osmId, item]))
  return {
    type: 'FeatureCollection',
    features: polygons.features.map((feature) => {
      const sale = byOsm.get(feature.properties.osmId)!
      return {
        type: 'Feature' as const,
        id: feature.properties.listingId,
        properties: feature.properties,
        geometry: {
          type: 'Point' as const,
          coordinates: [sale.cx, sale.cy],
        },
      }
    }),
  }
}

export interface AmenityPoint {
  type: 'Feature'
  properties: { id: string; kind: string; name: string | null }
  geometry: { type: 'Point'; coordinates: [number, number] }
}

interface RawFeatureCollection {
  type: 'FeatureCollection'
  features: Array<{
    type: 'Feature'
    properties: Record<string, string | number | null | undefined>
    geometry:
      | { type: 'Point'; coordinates: [number, number] }
      | { type: 'LineString'; coordinates: [number, number][] }
      | { type: 'Polygon'; coordinates: [number, number][][] }
  }>
}

/** Adds a real, geometry-derived area (never invented) to each park polygon. */
export function parkFeatures(parks: RawFeatureCollection): RawFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: parks.features.map((feature) => {
      const areaSqm =
        feature.geometry.type === 'Polygon' ? ringAreaSqm(feature.geometry.coordinates[0]) : 0
      return {
        ...feature,
        properties: { ...feature.properties, areaSqm },
      }
    }),
  }
}

/** Every station shares the main line's rollout status — no per-station data exists. */
export function stationFeatures(stations: RawFeatureCollection, year: number): RawFeatureCollection {
  const status = lrtSegmentStatus('core', year)
  return {
    type: 'FeatureCollection',
    features: stations.features.map((feature) => ({
      ...feature,
      properties: { ...feature.properties, status },
    })),
  }
}

/** The `proposed` extension is always a ghost outline; the rest follows the year. */
export function lrtLineFeatures(lrt: RawFeatureCollection, year: number): RawFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: lrt.features.map((feature) => {
      const segment = feature.properties.segment === 'proposed' ? 'proposed' : 'core'
      return {
        ...feature,
        properties: { ...feature.properties, status: lrtSegmentStatus(segment, year) },
      }
    }),
  }
}

export function filterAmenityCollection(
  collection: { type: 'FeatureCollection'; features: AmenityPoint[] },
  filters: FilterState,
): { type: 'FeatureCollection'; features: AmenityPoint[] } {
  return {
    type: 'FeatureCollection',
    features: collection.features.filter((feature) => {
      const kind = feature.properties.kind
      if (
        kind !== 'school' &&
        kind !== 'kindergarten' &&
        kind !== 'shopping' &&
        kind !== 'mall'
      ) {
        return false
      }
      return amenityKindVisible(kind, filters)
    }),
  }
}

export function parseCityPayload(raw: unknown): CityPayload {
  if (!raw || typeof raw !== 'object') {
    throw new Error('city.json: пустой ответ')
  }
  const data = raw as Partial<CityPayload>
  if (!Array.isArray(data.ctx) || !Array.isArray(data.sale)) {
    throw new Error('city.json: нет массивов ctx/sale')
  }
  return data as CityPayload
}
