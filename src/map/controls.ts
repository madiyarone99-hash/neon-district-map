import type { Map as MapLibreMap } from 'maplibre-gl'
import { INITIAL_PITCH, flyDurationMs } from '../domain/camera'

export function zoomBy(map: MapLibreMap, delta: number): void {
  map.easeTo({ zoom: map.getZoom() + delta, duration: flyDurationMs() === 0 ? 0 : 220 })
}

export function resetNorth(map: MapLibreMap): void {
  map.easeTo({
    bearing: 0,
    pitch: INITIAL_PITCH,
    duration: flyDurationMs() === 0 ? 0 : 400,
  })
}
