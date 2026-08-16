import { formatHectares, formatWalkMinutes } from '../domain/format'
import { centroidOfRing, haversineMeters, ringAreaSqm, walkingMinutes } from '../domain/geo'
import type { InfraPayload } from '../map/loadData'
import type { SheetMode } from '../domain/types'

interface ParkSheetProps {
  parkId: string
  infra: InfraPayload | null
  mode: SheetMode
  selectedProjectCenter: [number, number] | null
  onClose: () => void
  onToggle: () => void
}

export function ParkSheet({
  parkId,
  infra,
  mode,
  selectedProjectCenter,
  onClose,
  onToggle,
}: ParkSheetProps) {
  if (!infra) return null
  const feature = infra.parks.features.find((item) => item.properties.id === parkId)
  if (!feature || feature.geometry.type !== 'Polygon') return null

  const name = (feature.properties.name as string | null) ?? 'Парк'
  const areaSqm = ringAreaSqm(feature.geometry.coordinates[0])

  let distanceLine: string | null = null
  if (selectedProjectCenter) {
    const meters = haversineMeters(centroidOfRing(feature.geometry.coordinates[0]), selectedProjectCenter)
    distanceLine = `${Math.round(meters)} м · ${formatWalkMinutes(walkingMinutes(meters))}`
  }

  const expanded = mode === 'expanded'

  return (
    <article className={`project-sheet glass is-${mode}`} aria-label={`Парк ${name}`}>
      <button type="button" className="sheet-handle-btn" onClick={onToggle}>
        <span className="sheet-handle" />
        <span className="sr-only">{expanded ? 'Свернуть карточку парка' : 'Развернуть карточку парка'}</span>
      </button>

      <header className="project-head">
        <div>
          <p className="project-kicker">Парк</p>
          <h2>{name}</h2>
          <p className="project-tagline">
            {formatHectares(areaSqm)}
            {distanceLine ? ` · ${distanceLine}` : ''}
          </p>
        </div>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Снять выбор">
          ×
        </button>
      </header>

      {expanded && (
        <div className="project-body">
          <p className="height-note">
            Площадь вычислена по реальному полигону из OSM (≈ означает планарную оценку, не
            кадастровое измерение).
          </p>
        </div>
      )}
    </article>
  )
}
