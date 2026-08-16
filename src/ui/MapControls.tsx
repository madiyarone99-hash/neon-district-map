import type { Map as MapLibreMap } from 'maplibre-gl'
import { resetNorth, zoomBy } from '../map/controls'

interface MapControlsProps {
  map: MapLibreMap | null
}

export function MapControls({ map }: MapControlsProps) {
  return (
    <div className="map-tools glass" role="group" aria-label="Управление картой">
      <button
        type="button"
        className="icon-btn"
        aria-label="Приблизить"
        disabled={!map}
        onClick={() => map && zoomBy(map, 0.7)}
      >
        +
      </button>
      <button
        type="button"
        className="icon-btn"
        aria-label="Отдалить"
        disabled={!map}
        onClick={() => map && zoomBy(map, -0.7)}
      >
        −
      </button>
      <button
        type="button"
        className="icon-btn"
        aria-label="Север вверх"
        disabled={!map}
        onClick={() => map && resetNorth(map)}
      >
        N
      </button>
    </div>
  )
}
