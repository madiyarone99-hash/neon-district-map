import { describe, expect, it } from 'vitest'
import { DEFAULT_FILTERS, createFilters } from '../domain/filters'
import {
  contextCollection,
  lrtLineFeatures,
  parkFeatures,
  parseCityPayload,
  saleCollection,
  stationFeatures,
} from './geojson'
import type { CityPayload } from '../domain/types'

const payload: CityPayload = {
  meta: { levelMeters: 3.2, note: 'test' },
  ctx: [
    {
      id: 1,
      c: [
        [71.42, 51.12],
        [71.421, 51.12],
        [71.421, 51.121],
        [71.42, 51.121],
      ],
      h: 22.4,
      src: 'osm-levels',
    },
    {
      id: 486561788,
      c: [
        [71.426, 51.122],
        [71.427, 51.122],
        [71.427, 51.123],
      ],
      h: 38.4,
      src: 'osm-levels',
    },
  ],
  sale: [
    {
      osmId: 486561788,
      c: [
        [71.426, 51.122],
        [71.427, 51.122],
        [71.427, 51.123],
      ],
      h: 38.4,
      src: 'osm-levels',
      cx: 71.4265,
      cy: 51.1225,
      osmName: 'Sheraton Astana',
    },
  ],
}

describe('city geojson', () => {
  it('rejects malformed payloads', () => {
    expect(() => parseCityPayload(null)).toThrow(/пустой/)
    expect(() => parseCityPayload({ ctx: [] })).toThrow(/sale/)
  })

  it('does not duplicate sale footprints in the context layer', () => {
    const ctx = contextCollection(payload)
    expect(ctx.features).toHaveLength(1)
    expect(ctx.features[0].properties.id).toBe('1')
    expect(ctx.features[0].geometry.coordinates[0][0]).toEqual(
      ctx.features[0].geometry.coordinates[0].at(-1),
    )
  })

  it('emits sale features only when the year and sales filter allow it', () => {
    const visible = saleCollection(payload, 2026, DEFAULT_FILTERS)
    expect(visible.features).toHaveLength(1)
    expect(visible.features[0].properties.listingId).toBe('prism')
    expect(visible.features[0].properties.phase).toBe('structure')
    expect(visible.features[0].properties.floors).toBe(12)
    expect(visible.features[0].properties.status).toBe('construction')
    expect(visible.features[0].properties.priceCompact).toBe('610K')

    const hidden = saleCollection(
      payload,
      2026,
      createFilters({ layers: { ...DEFAULT_FILTERS.layers, sales: false } }),
    )
    expect(hidden.features).toHaveLength(0)
  })
})

describe('infra feature enrichment', () => {
  const park = {
    type: 'FeatureCollection' as const,
    features: [
      {
        type: 'Feature' as const,
        properties: { id: 'way/1', kind: 'park', name: 'Test Park' },
        geometry: {
          type: 'Polygon' as const,
          coordinates: [
            [
              [71.42, 51.12],
              [71.421, 51.12],
              [71.421, 51.121],
              [71.42, 51.121],
              [71.42, 51.12],
            ] as [number, number][],
          ],
        },
      },
    ],
  }

  it('adds a real, geometry-derived area to every park', () => {
    const enriched = parkFeatures(park)
    expect(enriched.features[0].properties.areaSqm).toBeGreaterThan(0)
  })

  it('marks the proposed LRT extension as a ghost regardless of year', () => {
    const lrt = {
      type: 'FeatureCollection' as const,
      features: [
        {
          type: 'Feature' as const,
          properties: { id: 'way/1', kind: 'lrt', segment: 'proposed' },
          geometry: {
            type: 'LineString' as const,
            coordinates: [[71.42, 51.12], [71.421, 51.121]] as [number, number][],
          },
        },
        {
          type: 'Feature' as const,
          properties: { id: 'way/2', kind: 'lrt', segment: 'core' },
          geometry: {
            type: 'LineString' as const,
            coordinates: [[71.42, 51.12], [71.421, 51.121]] as [number, number][],
          },
        },
      ],
    }
    const enriched = lrtLineFeatures(lrt, 2030)
    expect(enriched.features[0].properties.status).toBe('proposed')
    expect(enriched.features[1].properties.status).toBe('open')
  })

  it('gives stations the shared line status for the given year', () => {
    const stations = {
      type: 'FeatureCollection' as const,
      features: [
        {
          type: 'Feature' as const,
          properties: { id: 'node/1', kind: 'lrt_station', name: 'Test', ref: '1' },
          geometry: { type: 'Point' as const, coordinates: [71.42, 51.12] as [number, number] },
        },
      ],
    }
    expect(stationFeatures(stations, 2025).features[0].properties.status).toBe('planned')
    expect(stationFeatures(stations, 2030).features[0].properties.status).toBe('open')
  })
})
