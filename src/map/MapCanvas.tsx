import { useEffect, useRef, useState } from 'react'
import { Map as MapLibreMap, type GeoJSONSource, type MapMouseEvent, type Point } from 'maplibre-gl'
import {
  DISTRICT_CENTER,
  FLY_PITCH,
  FLY_ZOOM,
  INITIAL_BEARING,
  INITIAL_PITCH,
  INITIAL_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
  cameraPadding,
  flyDurationMs,
  type CameraPadding,
} from '../domain/camera'
import { DISTRICT_BOUNDS } from './basemap'
import { centroidOfRing } from '../domain/geo'
import { findListing } from '../domain/listings'
import type { CityPayload, FilterState } from '../domain/types'
import type { Selection } from '../state/appState'
import type { ResolvedTheme } from '../state/theme'
import { districtStyle } from './basemap'
import {
  contextCollection,
  lrtLineFeatures,
  parkFeatures,
  saleCenters,
  saleCollection,
  stationFeatures,
} from './geojson'
import {
  addSourcesAndLayers,
  amenityFilter,
  applyThemeColors,
  registerPins,
  setLayerVisible,
} from './installLayers'
import type { InfraPayload } from './loadData'

interface MapCanvasProps {
  city: CityPayload | null
  infra: InfraPayload | null
  amenities: { type: 'FeatureCollection'; features: unknown[] } | null
  year: number
  filters: FilterState
  selection: Selection
  sheetExpanded: boolean
  theme: ResolvedTheme
  onSelectProject: (id: string | null) => void
  onSelectStation: (id: string | null) => void
  onSelectPark: (id: string | null) => void
  onClearSelection: () => void
  onReady: (map: MapLibreMap) => void
}

const PROJECT_LAYERS = ['sale-hit', 'sale-extrusion', 'sale-price', 'sale-price-halo', 'sale-construction-badge']
const STATION_LAYERS = ['lrt-stations-hit', 'lrt-stations', 'lrt-stations-halo', 'lrt-station-labels']
const PARK_LAYERS = ['parks-fill', 'parks-outline', 'park-icon', 'park-label']

export function MapCanvas({
  city,
  infra,
  amenities,
  year,
  filters,
  selection,
  sheetExpanded,
  theme,
  onSelectProject,
  onSelectStation,
  onSelectPark,
  onClearSelection,
  onReady,
}: MapCanvasProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const selectionRef = useRef<Selection>(null)
  const initializedThemeRef = useRef(false)
  const callbacksRef = useRef({
    onSelectProject,
    onSelectStation,
    onSelectPark,
    onClearSelection,
    onReady,
  })
  const [styleReady, setStyleReady] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  callbacksRef.current = { onSelectProject, onSelectStation, onSelectPark, onClearSelection, onReady }

  useEffect(() => {
    if (!rootRef.current || mapRef.current) return

    let map: MapLibreMap
    try {
      map = new MapLibreMap({
        container: rootRef.current,
        style: districtStyle(theme),
        center: DISTRICT_CENTER,
        zoom: INITIAL_ZOOM,
        pitch: INITIAL_PITCH,
        bearing: INITIAL_BEARING,
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM,
        maxBounds: DISTRICT_BOUNDS,
        attributionControl: { compact: true },
        fadeDuration: flyDurationMs() === 0 ? 0 : 300,
        cooperativeGestures: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Карта не запустилась'
      setMapError(message)
      return
    }
    mapRef.current = map
    // Exposed for the local visual QA harness only; harmless in production.
    ;(window as unknown as { __nexusMap?: MapLibreMap }).__nexusMap = map

    const pickFeatureId = (point: Point, layers: string[], key: string): string | null => {
      const available = layers.filter((id) => map.getLayer(id))
      if (available.length === 0) return null
      const hits = map.queryRenderedFeatures(point, { layers: available })
      const value = hits[0]?.properties?.[key]
      return typeof value === 'string' ? value : null
    }

    const setupStyleLayer = () => {
      try {
        map.setLight({
          anchor: 'viewport',
          color: '#f2efe6',
          intensity: 0.42,
          position: [1.2, 210, 28],
        })
      } catch {
        // Lighting is optional.
      }
      try {
        registerPins(map)
      } catch {
        // Pins are optional; extrusion still communicates listings.
      }
      try {
        addSourcesAndLayers(map)
        applyThemeColors(map)
      } catch (error) {
        setMapError(error instanceof Error ? error.message : 'Слои карты не собрались')
      }
    }

    map.on('load', () => {
      setupStyleLayer()
      map.resize()
      // The very first paint keeps the authored center; the data-aware
      // home camera runs in an effect as soon as city.json lands.
      map.easeTo({
        center: DISTRICT_CENTER,
        zoom: INITIAL_ZOOM,
        pitch: INITIAL_PITCH,
        bearing: INITIAL_BEARING,
        padding: currentPadding(false, false),
        duration: 0,
      })
      setStyleReady(true)
      callbacksRef.current.onReady(map)
    })

    map.on('click', (event: MapMouseEvent) => {
      const projectId = pickFeatureId(event.point, PROJECT_LAYERS, 'listingId')
      if (projectId) {
        callbacksRef.current.onSelectProject(projectId)
        return
      }
      const stationId = pickFeatureId(event.point, STATION_LAYERS, 'id')
      if (stationId) {
        callbacksRef.current.onSelectStation(stationId)
        return
      }
      const parkId = pickFeatureId(event.point, PARK_LAYERS, 'id')
      if (parkId) {
        callbacksRef.current.onSelectPark(parkId)
        return
      }
      callbacksRef.current.onClearSelection()
    })

    const setPointer = (layer: string) => {
      map.on('mouseenter', layer, () => {
        map.getCanvas().style.cursor = 'pointer'
      })
      map.on('mouseleave', layer, () => {
        map.getCanvas().style.cursor = ''
      })
    }
    map.on('load', () => {
      for (const layer of [...PROJECT_LAYERS, ...STATION_LAYERS, ...PARK_LAYERS]) {
        setPointer(layer)
      }
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Swap the raster basemap + rebuild our runtime layers when the theme flips.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (!initializedThemeRef.current) {
      initializedThemeRef.current = true
      return
    }
    setStyleReady(false)
    map.setStyle(districtStyle(theme))
    map.once('style.load', () => {
      try {
        registerPins(map)
        addSourcesAndLayers(map)
        applyThemeColors(map)
      } catch (error) {
        setMapError(error instanceof Error ? error.message : 'Слои карты не собрались')
      }
      setStyleReady(true)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !styleReady) return
    applyThemeColors(map)
  }, [theme, styleReady])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !styleReady || !city) return
    const context = map.getSource('context') as GeoJSONSource | undefined
    if (!context) return
    context.setData(contextCollection(city))
  }, [city, styleReady])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !styleReady || !city || !map.getSource('sale')) return
    ;(map.getSource('sale') as GeoJSONSource).setData(saleCollection(city, year, filters))
    ;(map.getSource('sale-centers') as GeoJSONSource).setData(saleCenters(city, year, filters))
  }, [city, year, filters, selection, styleReady])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !styleReady || !infra || !map.getSource('parks')) return
    ;(map.getSource('parks') as GeoJSONSource).setData(parkFeatures(infra.parks))
    ;(map.getSource('lrt') as GeoJSONSource).setData(lrtLineFeatures(infra.lrt, year))
    ;(map.getSource('lrt-stations') as GeoJSONSource).setData(stationFeatures(infra.stations, year))
  }, [infra, year, styleReady])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !styleReady || !amenities || !map.getSource('amenities')) return
    ;(map.getSource('amenities') as GeoJSONSource).setData(
      amenities as { type: 'FeatureCollection'; features: never[] },
    )
  }, [amenities, styleReady])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !styleReady || !map.getLayer('parks-fill')) return
    setLayerVisible(map, 'parks-fill', filters.layers.parks)
    setLayerVisible(map, 'parks-outline', filters.layers.parks)
    setLayerVisible(map, 'parks-selected-outline', filters.layers.parks)
    setLayerVisible(map, 'park-icon', filters.layers.parks)
    setLayerVisible(map, 'park-label', filters.layers.parks)
    setLayerVisible(map, 'lrt-line', filters.layers.lrt)
    setLayerVisible(map, 'lrt-stations', filters.layers.lrt)
    setLayerVisible(map, 'lrt-station-labels', filters.layers.lrt)
    setLayerVisible(map, 'sale-hit', filters.layers.sales)
    setLayerVisible(map, 'sale-extrusion', filters.layers.sales)
    setLayerVisible(map, 'sale-outline', filters.layers.sales)
    setLayerVisible(map, 'sale-price', filters.layers.sales)
    setLayerVisible(map, 'sale-price-halo', filters.layers.sales)
    setLayerVisible(map, 'sale-construction-badge', filters.layers.sales)
    setLayerVisible(map, 'lrt-stations-halo', filters.layers.lrt)
    setLayerVisible(map, 'lrt-stations-hit', filters.layers.lrt)
    map.setFilter('poi-icons', amenityFilter(filters))
    map.setFilter('poi-labels', amenityFilter(filters))
    map.setFilter(
      'poi-labels-mall',
      ['all', ['==', ['get', 'kind'], 'mall'], amenityFilter(filters)],
    )
  }, [filters, styleReady])

  // Feature-state selection: project, station, park each own a slot.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !styleReady) return
    const prev = selectionRef.current
    if (prev && map.getSource(sourceForSelection(prev.type))) {
      map.setFeatureState({ source: sourceForSelection(prev.type), id: prev.id }, { selected: false })
    }
    if (selection && map.getSource(sourceForSelection(selection.type))) {
      map.setFeatureState({ source: sourceForSelection(selection.type), id: selection.id }, { selected: true })
    }
    selectionRef.current = selection
  }, [selection, styleReady])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !styleReady || !city || !selection) return
    const target = resolveFlyTarget(selection, city, infra)
    if (!target) return
    const pad = currentPadding(sheetExpanded, true)
    map.easeTo({
      center: target.center,
      zoom: Math.max(map.getZoom(), target.zoom),
      pitch: target.pitch != null ? Math.max(map.getPitch(), target.pitch) : map.getPitch(),
      padding: pad,
      duration: flyDurationMs(),
    })
  }, [selection, city, infra, sheetExpanded, styleReady])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !styleReady || !city) return
    if (selection != null) return // a manual fly-to above already owns the camera
    const target = listingHomeCamera(city)
    map.easeTo({
      center: target.center,
      zoom: target.zoom,
      pitch: INITIAL_PITCH,
      bearing: INITIAL_BEARING,
      padding: currentPadding(false, false),
      duration: flyDurationMs(),
    })
  }, [selection, city, styleReady])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !styleReady) return
    const pad = currentPadding(sheetExpanded, Boolean(selection))
    map.easeTo({ padding: pad, duration: flyDurationMs() === 0 ? 0 : 280 })
    map.resize()
  }, [sheetExpanded, selection, styleReady])

  return (
    <>
      <div ref={rootRef} className="map-canvas" role="application" aria-label="Карта района" />
      {!styleReady && !mapError && (
        <div className="status-banner" role="status">
          Собираем квартал…
        </div>
      )}
      {mapError && (
        <div className="status-banner is-error" role="alert">
          {mapError}
        </div>
      )}
    </>
  )
}

function sourceForSelection(type: 'project' | 'station' | 'park'): string {
  if (type === 'project') return 'sale'
  if (type === 'station') return 'lrt-stations'
  return 'parks'
}

function resolveFlyTarget(
  selection: NonNullable<Selection>,
  city: CityPayload,
  infra: InfraPayload | null,
): { center: [number, number]; zoom: number; pitch: number | null } | null {
  if (selection.type === 'project') {
    const listing = findListing(selection.id)
    const target = listing ? city.sale.find((item) => item.osmId === listing.osmId) : undefined
    if (!target) return null
    return { center: [target.cx, target.cy], zoom: FLY_ZOOM, pitch: FLY_PITCH }
  }
  if (selection.type === 'station') {
    const feature = infra?.stations.features.find((item) => item.properties.id === selection.id)
    if (!feature || feature.geometry.type !== 'Point') return null
    return { center: feature.geometry.coordinates, zoom: 15.6, pitch: null }
  }
  const feature = infra?.parks.features.find((item) => item.properties.id === selection.id)
  if (!feature || feature.geometry.type !== 'Polygon') return null
  return { center: centroidOfRing(feature.geometry.coordinates[0]), zoom: 15.0, pitch: null }
}

/** Fit the camera so all sale listings (and both stations) sit in view on first paint. */
function listingHomeCamera(city: CityPayload): { center: [number, number]; zoom: number } {
  if (city.sale.length === 0) return { center: DISTRICT_CENTER, zoom: INITIAL_ZOOM }
  let minLon = Infinity
  let maxLon = -Infinity
  let minLat = Infinity
  let maxLat = -Infinity
  for (const sale of city.sale) {
    minLon = Math.min(minLon, sale.cx)
    maxLon = Math.max(maxLon, sale.cx)
    minLat = Math.min(minLat, sale.cy)
    maxLat = Math.max(maxLat, sale.cy)
  }
  // Pad the bbox so the outermost listings aren't jammed against the viewport edge.
  const lonPad = (maxLon - minLon) * 0.22 + 0.001
  const latPad = (maxLat - minLat) * 0.22 + 0.001
  const center: [number, number] = [(minLon + maxLon) / 2, (minLat + maxLat) / 2]
  // Convert padded bbox to a zoom that fits inside the actual viewport.
  const viewportW = typeof window === 'undefined' ? 390 : window.innerWidth
  const viewportH = typeof window === 'undefined' ? 844 : window.innerHeight
  const widthMeters = (maxLon - minLon + lonPad * 2) * 111_320 * Math.cos((center[1] * Math.PI) / 180)
  const heightMeters = (maxLat - minLat + latPad * 2) * 110_574
  const zoomForWidth = Math.log2((viewportW * 156_543.03392 * Math.cos((center[1] * Math.PI) / 180)) / widthMeters)
  const zoomForHeight = Math.log2((viewportH * 156_543.03392 * Math.cos((center[1] * Math.PI) / 180)) / heightMeters)
  const zoom = Math.min(INITIAL_ZOOM, zoomForWidth, zoomForHeight)
  return { center, zoom: Math.max(12.8, zoom) }
}

function currentPadding(sheetExpanded: boolean, selected: boolean): CameraPadding {
  const width = typeof window === 'undefined' ? 390 : window.innerWidth
  const height = typeof window === 'undefined' ? 844 : window.innerHeight
  return cameraPadding({
    viewportWidth: width,
    viewportHeight: height,
    selected,
    sheetExpanded,
  })
}
