import type { StyleSpecification } from 'maplibre-gl'

export type BasemapTheme = 'light' | 'dark'

/**
 * Self-hosted style: raster streets + our own GeoJSON layers on top. No
 * third-party vector building layer to fight for z-order or color control.
 * Dark and light use different CARTO raster sets (not a filter/invert),
 * matching the two first-class themes in tokens.css.
 */
export function districtStyle(theme: BasemapTheme): StyleSpecification {
  const isDark = theme === 'dark'
  const set = isDark ? 'dark_all' : 'light_all'
  return {
    version: 8,
    // Glyphs come from the WebGL worker's own fetches; a raster-only style
    // still needs a glyphs URL so symbol layers can shape text.
    glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
    sources: {
      carto: {
        type: 'raster',
        tiles: [
          `https://a.basemaps.cartocdn.com/${set}/{z}/{x}/{y}@2x.png`,
          `https://b.basemaps.cartocdn.com/${set}/{z}/{x}/{y}@2x.png`,
          `https://c.basemaps.cartocdn.com/${set}/{z}/{x}/{y}@2x.png`,
        ],
        tileSize: 256,
        attribution: '© CARTO © OpenStreetMap',
      },
    },
    layers: [
      {
        id: 'background',
        type: 'background',
        paint: { 'background-color': isDark ? '#0b0d10' : '#f4f1e8' },
      },
      {
        id: 'carto',
        type: 'raster',
        source: 'carto',
        paint: isDark
          ? { 'raster-opacity': 1, 'raster-saturation': -0.08, 'raster-contrast': 0.08 }
          : { 'raster-opacity': 1, 'raster-saturation': -0.15, 'raster-contrast': 0.02 },
      },
    ],
  }
}

/** Loose district frame — generous enough to see every listing, station and park. */
export const DISTRICT_BOUNDS: [[number, number], [number, number]] = [
  [71.408, 51.113],
  [71.446, 51.143],
]
