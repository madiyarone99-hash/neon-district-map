import type { AddLayerObject, ExpressionSpecification, Map as MapLibreMap } from 'maplibre-gl'
import { poiKindVisible } from '../domain/filters'
import {
  CLOSE_ZOOM,
  MEDIUM_ZOOM,
  constructionBadgeMinZoom,
  lrtStationLabelMinZoom,
  lrtStationMinZoom,
  parkIconMinZoom,
  parkLabelMinZoom,
  poiIconMinZoom,
  poiLabelMinZoom,
} from '../domain/visibility'
import type { FilterState, PoiKind } from '../domain/types'
import { registerPins } from './pins'

export { registerPins }

export function addSourcesAndLayers(map: MapLibreMap): void {
  map.addSource('parks', { type: 'geojson', data: empty(), promoteId: 'id' })
  map.addSource('lrt', { type: 'geojson', data: empty() })
  map.addSource('lrt-stations', { type: 'geojson', data: empty(), promoteId: 'id' })
  map.addSource('context', { type: 'geojson', data: empty() })
  map.addSource('sale', { type: 'geojson', data: empty(), promoteId: 'listingId' })
  map.addSource('sale-centers', { type: 'geojson', data: empty(), promoteId: 'listingId' })
  map.addSource('amenities', { type: 'geojson', data: empty() })

  addLayerSafe(map, {
    id: 'parks-fill',
    type: 'fill',
    source: 'parks',
    paint: { 'fill-color': '#1b3326', 'fill-opacity': 0.55 },
  })
  addLayerSafe(map, {
    id: 'parks-outline',
    type: 'line',
    source: 'parks',
    paint: { 'line-color': '#3d6a4c', 'line-width': 1.2, 'line-opacity': 0.9 },
  })
  addLayerSafe(map, {
    id: 'parks-selected-outline',
    type: 'line',
    source: 'parks',
    paint: {
      'line-color': '#3d6a4c',
      'line-width': [
        'case',
        ['boolean', ['feature-state', 'selected'], false],
        2.6,
        0,
      ],
      'line-opacity': [
        'case',
        ['boolean', ['feature-state', 'selected'], false],
        1,
        0,
      ],
    },
  })

  addLayerSafe(map, {
    id: 'context-extrusion',
    type: 'fill-extrusion',
    source: 'context',
    minzoom: 12.5,
    paint: {
      'fill-extrusion-color': [
        'case',
        ['==', ['get', 'knownHeight'], true],
        '#5a6472',
        '#454c57',
      ],
      'fill-extrusion-height': ['get', 'height'],
      'fill-extrusion-base': 0,
      'fill-extrusion-opacity': 0.92,
      'fill-extrusion-vertical-gradient': true,
    },
  })

  addLayerSafe(map, {
    id: 'sale-extrusion',
    type: 'fill-extrusion',
    source: 'sale',
    paint: {
      'fill-extrusion-color': '#4d6d82',
      'fill-extrusion-height': [
        'case',
        ['boolean', ['feature-state', 'selected'], false],
        ['+', ['get', 'height'], 4],
        ['get', 'height'],
      ],
      'fill-extrusion-base': 0,
      'fill-extrusion-opacity': 0.96,
      'fill-extrusion-vertical-gradient': true,
    },
  })

  addLayerSafe(map, {
    id: 'sale-hit',
    type: 'fill',
    source: 'sale',
    paint: { 'fill-color': '#d7b15a', 'fill-opacity': 0.08 },
  })

  addLayerSafe(map, {
    id: 'sale-outline',
    type: 'line',
    source: 'sale',
    paint: {
      'line-color': '#d7b15a',
      'line-width': [
        'case',
        ['boolean', ['feature-state', 'selected'], false],
        2.6,
        ['==', ['get', 'status'], 'planned'],
        1.2,
        1.4,
      ],
      'line-dasharray': [
        'case',
        ['==', ['get', 'status'], 'planned'],
        ['literal', [2, 1.6]],
        ['literal', [1, 0]],
      ],
      'line-opacity': ['case', ['==', ['get', 'status'], 'planned'], 0.85, 0.96],
    },
  })

  addLayerSafe(map, {
    id: 'sale-construction-badge',
    type: 'symbol',
    source: 'sale-centers',
    minzoom: constructionBadgeMinZoom(),
    filter: ['==', ['get', 'status'], 'construction'],
    layout: {
      'icon-image': 'poi-construction',
      'icon-size': 0.82,
      'icon-anchor': 'bottom',
      'icon-offset': [0, -46],
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
    },
    paint: {
      'icon-opacity': [
        'case',
        ['boolean', ['feature-state', 'selected'], false],
        0,
        1,
      ],
    },
  })

  addLayerSafe(map, {
    id: 'lrt-line',
    type: 'line',
    source: 'lrt',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': [
        'match',
        ['get', 'status'],
        'construction',
        '#c98a4b',
        'open',
        '#6f9ab0',
        'proposed',
        '#6b7480',
        '#7d8794',
      ],
      'line-width': ['match', ['get', 'status'], 'proposed', 2, 'open', 3.2, 2.6],
      'line-opacity': ['match', ['get', 'status'], 'proposed', 0.7, 0.92],
      'line-dasharray': [
        'match',
        ['get', 'status'],
        'open',
        ['literal', [1, 0]],
        'proposed',
        ['literal', [0.6, 1.6]],
        ['literal', [2, 1.2]],
      ],
    },
  })

  addLayerSafe(map, {
    id: 'park-icon',
    type: 'symbol',
    source: 'parks',
    minzoom: parkIconMinZoom(),
    layout: {
      'icon-image': 'poi-park',
      'icon-size': 0.6,
      'icon-allow-overlap': false,
      'icon-ignore-placement': false,
      'symbol-sort-key': 1,
    },
  })

  addLayerSafe(map, {
    id: 'park-label',
    type: 'symbol',
    source: 'parks',
    minzoom: parkLabelMinZoom(),
    layout: {
      'text-field': ['coalesce', ['get', 'name'], ''],
      'text-font': ['Noto Sans Regular'],
      'text-size': 11.5,
      'text-offset': [0, 1.1],
      'text-anchor': 'top',
      'text-optional': true,
      'text-max-width': 8,
      'text-allow-overlap': false,
      'symbol-sort-key': 1,
    },
    paint: {
      'text-color': '#cfe6d6',
      'text-halo-color': '#0f1410',
      'text-halo-width': 1.2,
    },
  })

  addLayerSafe(map, {
    id: 'lrt-stations',
    type: 'symbol',
    source: 'lrt-stations',
    minzoom: lrtStationMinZoom(),
    layout: {
      'icon-image': 'lrt-station',
      'icon-size': 0.8,
      'icon-allow-overlap': true,
      'icon-ignore-placement': false,
      'symbol-sort-key': 0,
    },
  })

  // Selected-state ring: painted (not layout) so feature-state is allowed.
  addLayerSafe(map, {
    id: 'lrt-stations-hit',
    type: 'circle',
    source: 'lrt-stations',
    paint: {
      'circle-radius': 22,
      'circle-color': '#000',
      'circle-opacity': 0.01,
    },
  })

  addLayerSafe(map, {
    id: 'lrt-stations-halo',
    type: 'circle',
    source: 'lrt-stations',
    minzoom: lrtStationMinZoom(),
    paint: {
      'circle-radius': [
        'case',
        ['boolean', ['feature-state', 'selected'], false],
        20,
        0,
      ],
      'circle-color': '#d8b45a',
      'circle-opacity': [
        'case',
        ['boolean', ['feature-state', 'selected'], false],
        0.25,
        0,
      ],
      'circle-stroke-width': 1.4,
      'circle-stroke-color': '#d8b45a',
      'circle-stroke-opacity': [
        'case',
        ['boolean', ['feature-state', 'selected'], false],
        0.9,
        0,
      ],
    },
  })

  addLayerSafe(map, {
    id: 'lrt-station-labels',
    type: 'symbol',
    source: 'lrt-stations',
    minzoom: lrtStationLabelMinZoom(),
    layout: {
      'text-field': ['coalesce', ['get', 'name'], ''],
      'text-font': ['Noto Sans Regular'],
      'text-size': 12,
      'text-offset': [0, 1.2],
      'text-anchor': 'top',
      'text-optional': true,
      'text-max-width': 8,
      'text-allow-overlap': false,
      'symbol-sort-key': 0,
    },
    paint: {
      'text-color': '#eef2f5',
      'text-halo-color': '#0e1216',
      'text-halo-width': 1.3,
    },
  })

  addLayerSafe(map, {
    id: 'poi-icons',
    type: 'symbol',
    source: 'amenities',
    minzoom: poiIconMinZoom(),
    layout: {
      'icon-image': ['concat', 'poi-', ['get', 'kind']],
      'icon-size': 0.6,
      'icon-allow-overlap': false,
      'icon-ignore-placement': false,
      'icon-padding': 4,
      'symbol-sort-key': ['match', ['get', 'kind'], 'mall', 2, 'school', 3, 4],
    },
  })

  addLayerSafe(map, {
    id: 'poi-labels-mall',
    type: 'symbol',
    source: 'amenities',
    minzoom: poiLabelMinZoom('mall'),
    filter: ['==', ['get', 'kind'], 'mall'],
    layout: {
      'text-field': ['coalesce', ['get', 'name'], ''],
      'text-font': ['Noto Sans Regular'],
      'text-size': 11,
      'text-offset': [0, 0.2],
      'text-anchor': 'top',
      'text-optional': true,
      'text-padding': 4,
      'text-max-width': 8,
      'text-allow-overlap': false,
    },
    paint: { 'text-color': '#e7ebf0', 'text-halo-color': '#12151a', 'text-halo-width': 1.2 },
  })

  addLayerSafe(map, {
    id: 'poi-labels',
    type: 'symbol',
    source: 'amenities',
    minzoom: poiLabelMinZoom('school'),
    filter: ['!=', ['get', 'kind'], 'mall'],
    layout: {
      'text-field': ['coalesce', ['get', 'name'], ''],
      'text-font': ['Noto Sans Regular'],
      'text-size': 11,
      'text-offset': [0, 0.2],
      'text-anchor': 'top',
      'text-optional': true,
      'text-padding': 4,
      'text-max-width': 8,
      'text-allow-overlap': false,
    },
    paint: { 'text-color': '#e7ebf0', 'text-halo-color': '#12151a', 'text-halo-width': 1.2 },
  })

  addLayerSafe(map, {
    id: 'sale-price',
    type: 'symbol',
    source: 'sale-centers',
    minzoom: MEDIUM_ZOOM - 0.6,
    layout: {
      'icon-image': 'price-pill',
      'icon-text-fit': 'both',
      'icon-text-fit-padding': [4, 10, 4, 10],
      'text-field': [
        'step',
        ['zoom'],
        ['get', 'priceLabelMedium'],
        CLOSE_ZOOM,
        ['get', 'priceLabelClose'],
      ],
      'text-font': ['Noto Sans Regular'],
      'text-size': 11.5,
      'text-line-height': 1.15,
      'text-justify': 'center',
      'icon-allow-overlap': false,
      'text-allow-overlap': false,
      'icon-ignore-placement': false,
      'symbol-sort-key': ['match', ['get', 'status'], 'construction', 1, 2],
    },
    paint: {
      'text-color': [
        'case',
        ['boolean', ['feature-state', 'selected'], false],
        '#241a08',
        '#f2f4f7',
      ],
      // Hide the pill background at far zoom so the label alone carries the price.
      'icon-opacity': [
        'step',
        ['zoom'],
        ['case', ['boolean', ['feature-state', 'selected'], false], 1, 0],
        MEDIUM_ZOOM,
        ['case', ['boolean', ['feature-state', 'selected'], false], 1, 0.92],
      ],
    },
  })

  // Selected project gets an extra halo ring so the price pill reads as chosen.
  addLayerSafe(map, {
    id: 'sale-price-halo',
    type: 'circle',
    source: 'sale-centers',
    minzoom: MEDIUM_ZOOM - 0.6,
    paint: {
      'circle-radius': [
        'case',
        ['boolean', ['feature-state', 'selected'], false],
        26,
        0,
      ],
      'circle-color': '#d8b45a',
      'circle-opacity': [
        'case',
        ['boolean', ['feature-state', 'selected'], false],
        0.22,
        0,
      ],
      'circle-stroke-width': 1.4,
      'circle-stroke-color': '#d8b45a',
      'circle-stroke-opacity': [
        'case',
        ['boolean', ['feature-state', 'selected'], false],
        0.85,
        0,
      ],
    },
  })
}

function addLayerSafe(map: MapLibreMap, layer: AddLayerObject): void {
  try {
    map.addLayer(layer)
  } catch (error) {
    console.warn('layer skipped', 'id' in layer ? layer.id : layer, error)
  }
}

function empty(): { type: 'FeatureCollection'; features: never[] } {
  return { type: 'FeatureCollection', features: [] }
}

export function setLayerVisible(map: MapLibreMap, layerId: string, visible: boolean): void {
  if (!map.getLayer(layerId)) return
  map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none')
}

export function amenityFilter(filters: FilterState): ExpressionSpecification {
  const kinds: PoiKind[] = (['school', 'kindergarten', 'mall', 'shopping'] as PoiKind[]).filter(
    (kind) => poiKindVisible(kind, filters),
  )
  if (kinds.length === 0) return ['==', ['get', 'kind'], '__none__']
  return ['in', ['get', 'kind'], ['literal', kinds]]
}

/**
 * Reads the live theme colors from tokens.css and pushes them into every
 * paint property that cannot itself reference a CSS variable. Call once
 * after the style loads and again whenever the resolved theme changes.
 */
export function applyThemeColors(map: MapLibreMap): void {
  const c = (name: string, fallback: string) => cssVar(name, fallback)

  setPaint(map, 'parks-fill', 'fill-color', c('--park-fill', 'rgba(74,110,84,0.42)'))
  setPaint(map, 'parks-outline', 'line-color', c('--park-border', 'rgba(120,168,132,0.55)'))
  setPaint(map, 'parks-selected-outline', 'line-color', c('--park-border', 'rgba(120,168,132,0.55)'))
  setPaint(map, 'park-label', 'text-color', c('--park-fg', '#a9d1b6'))
  setPaint(map, 'park-label', 'text-halo-color', c('--bg', '#0b0d10'))

  const statusColor: ExpressionSpecification = [
    'case',
    ['boolean', ['feature-state', 'selected'], false],
    c('--status-selected', '#d8b45a'),
    [
      'match',
      ['get', 'status'],
      'planned',
      c('--status-planned', '#7d8794'),
      'construction',
      c('--status-construction', '#c98a4b'),
      'completed',
      c('--status-completed', '#5f9e79'),
      c('--status-planned', '#7d8794'),
    ],
  ]
  setPaint(map, 'sale-extrusion', 'fill-extrusion-color', statusColor)
  setPaint(map, 'sale-outline', 'line-color', statusColor)

  setPaint(map, 'lrt-line', 'line-color', [
    'match',
    ['get', 'status'],
    'construction',
    c('--lrt-construction', '#c98a4b'),
    'open',
    c('--lrt-line', '#6f9ab0'),
    'proposed',
    c('--lrt-proposed', '#6b7480'),
    c('--status-planned', '#7d8794'),
  ])

  setPaint(map, 'sale-price', 'text-color', [
    'case',
    ['boolean', ['feature-state', 'selected'], false],
    c('--accent-fg', '#1c1508'),
    c('--fg', '#f3f4f6'),
  ])
  setPaint(map, 'poi-labels', 'text-color', c('--fg', '#f3f4f6'))
  setPaint(map, 'poi-labels', 'text-halo-color', c('--bg', '#0b0d10'))
  setPaint(map, 'poi-labels-mall', 'text-color', c('--fg', '#f3f4f6'))
  setPaint(map, 'poi-labels-mall', 'text-halo-color', c('--bg', '#0b0d10'))
  setPaint(map, 'lrt-station-labels', 'text-color', c('--fg', '#f3f4f6'))
  setPaint(map, 'lrt-station-labels', 'text-halo-color', c('--bg', '#0b0d10'))
}

function setPaint(
  map: MapLibreMap,
  layerId: string,
  prop: 'fill-color' | 'line-color' | 'text-color' | 'text-halo-color' | 'fill-extrusion-color',
  value: string | ExpressionSpecification,
): void {
  if (!map.getLayer(layerId)) return
  try {
    map.setPaintProperty(layerId, prop, value)
  } catch (error) {
    console.warn('paint skipped', layerId, prop, error)
  }
}

function cssVar(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}
