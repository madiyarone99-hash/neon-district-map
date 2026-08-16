import { centroidOfRing } from '../domain/geo'
import type { AmenityKind, CityPayload } from '../domain/types'
import {
  assembleVerifiedFile,
  bytesToUtf8,
  type PagesManifest,
} from './assembleParts'
import { parseCityPayload } from './geojson'

export interface InfraPayload {
  lrt: { type: 'FeatureCollection'; features: GeoJSONLike[] }
  parks: { type: 'FeatureCollection'; features: GeoJSONLike[] }
  stations: { type: 'FeatureCollection'; features: GeoJSONLike[] }
}

export interface GeoJSONLike {
  type: 'Feature'
  properties: Record<string, string | number | null | undefined>
  geometry:
    | { type: 'Point'; coordinates: [number, number] }
    | { type: 'LineString'; coordinates: [number, number][] }
    | { type: 'Polygon'; coordinates: [number, number][][] }
}

export interface AmenityPoint {
  kind: AmenityKind
  name: string | null
  coordinates: [number, number]
}

export interface MapData {
  city: CityPayload
  amenities: { type: 'FeatureCollection'; features: GeoJSONLike[] }
  infra: InfraPayload
  amenityPoints: AmenityPoint[]
}

async function fetchText(path: string): Promise<string> {
  const response = await fetch(path)
  if (!response.ok) {
    throw new Error(`${path} недоступен (${response.status})`)
  }
  return response.text()
}

async function fetchJson(path: string): Promise<unknown> {
  return JSON.parse(await fetchText(path))
}

async function loadCityPayload(): Promise<unknown> {
  try {
    const manifest = (await fetchJson('./parts/manifest.json')) as PagesManifest
    const parts = await Promise.all(
      manifest.city.parts.map((name) => fetchText(`./parts/${name}`)),
    )
    const bytes = await assembleVerifiedFile(parts, manifest.city, 'city.json')
    return JSON.parse(bytesToUtf8(bytes))
  } catch {
    return fetchJson('./city.json')
  }
}

export async function loadMapData(): Promise<MapData> {
  const [cityRaw, amenitiesRaw, infraRaw] = await Promise.all([
    loadCityPayload(),
    fetchJson('./amenities.json'),
    fetchJson('./infra.json'),
  ])

  const city = parseCityPayload(cityRaw)
  const amenities = amenitiesRaw as MapData['amenities']
  const infra = infraRaw as InfraPayload

  const amenityPoints: AmenityPoint[] = []
  for (const feature of amenities.features) {
    if (feature.geometry.type !== 'Point') continue
    const kind = feature.properties.kind
    if (
      kind !== 'school' &&
      kind !== 'kindergarten' &&
      kind !== 'shopping' &&
      kind !== 'mall' &&
      kind !== 'transit' &&
      kind !== 'park'
    ) {
      continue
    }
    amenityPoints.push({
      kind,
      name: (feature.properties.name as string | null) ?? null,
      coordinates: feature.geometry.coordinates,
    })
  }
  for (const feature of infra.stations.features) {
    if (feature.geometry.type !== 'Point') continue
    amenityPoints.push({
      kind: 'transit',
      name: (feature.properties.name as string | null) ?? null,
      coordinates: feature.geometry.coordinates,
    })
  }
  for (const feature of infra.parks.features) {
    if (feature.geometry.type !== 'Polygon') continue
    amenityPoints.push({
      kind: 'park',
      name: (feature.properties.name as string | null) ?? null,
      coordinates: centroidOfRing(feature.geometry.coordinates[0]),
    })
  }

  return { city, amenities, infra, amenityPoints }
}
