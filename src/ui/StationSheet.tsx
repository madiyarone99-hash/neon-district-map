import { formatWalkMinutes } from '../domain/format'
import { lrtStatusAtYear, lrtStatusLabel } from '../domain/timeline'
import { haversineMeters, walkingMinutes } from '../domain/geo'
import { LRT_CONSTRUCTION_YEAR, LRT_OPEN_YEAR } from '../domain/timeline'
import type { InfraPayload } from '../map/loadData'
import type { SheetMode, Year } from '../domain/types'

interface StationSheetProps {
  stationId: string
  infra: InfraPayload | null
  year: Year
  mode: SheetMode
  selectedProjectCenter: [number, number] | null
  onClose: () => void
  onToggle: () => void
}

export function StationSheet({
  stationId,
  infra,
  year,
  mode,
  selectedProjectCenter,
  onClose,
  onToggle,
}: StationSheetProps) {
  if (!infra) return null
  const feature = infra.stations.features.find((item) => item.properties.id === stationId)
  if (!feature || feature.geometry.type !== 'Point') return null

  const name = (feature.properties.name as string | null) ?? 'Станция LRT'
  const ref = feature.properties.ref as string | undefined
  const status = lrtStatusAtYear(year)

  let distanceLine: string | null = null
  if (selectedProjectCenter) {
    const meters = haversineMeters(feature.geometry.coordinates, selectedProjectCenter)
    distanceLine = `${Math.round(meters)} м · ${formatWalkMinutes(walkingMinutes(meters))}`
  }

  const expanded = mode === 'expanded'

  return (
    <article className={`project-sheet glass is-${mode}`} aria-label={`Станция ${name}`}>
      <button type="button" className="sheet-handle-btn" onClick={onToggle}>
        <span className="sheet-handle" />
        <span className="sr-only">{expanded ? 'Свернуть карточку станции' : 'Развернуть карточку станции'}</span>
      </button>

      <header className="project-head">
        <div>
          <p className="project-kicker">LRT Tarlan Astana</p>
          <h2>{name}</h2>
          <p className="project-tagline">
            {lrtStatusLabel(status)}
            {status === 'construction' ? ` · запуск ${LRT_OPEN_YEAR}` : ''}
            {status === 'planned' ? ` · стройка с ${LRT_CONSTRUCTION_YEAR}` : ''}
            {distanceLine ? ` · ${distanceLine}` : ''}
          </p>
        </div>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Снять выбор">
          ×
        </button>
      </header>

      <div className="stat-grid">
        <div>
          <span>Код станции</span>
          <strong>{ref ?? '—'}</strong>
        </div>
        <div>
          <span>Статус</span>
          <strong>{lrtStatusLabel(status)}</strong>
        </div>
        <div>
          <span>Линия</span>
          <strong>Tarlan Astana</strong>
        </div>
      </div>

      {expanded && (
        <div className="project-body">
          <p className="height-note">
            Статус — это модель всей линии по нашему расписанию (стройка {LRT_CONSTRUCTION_YEAR}–
            {LRT_OPEN_YEAR - 1}), а не отдельный тег станции из OSM. По этой станции OSM фиксирует
            код {ref ?? '—'} и оператора City Transportation Systems.
          </p>
          {distanceLine && (
            <section>
              <h3>От выбранного объекта</h3>
              <ul className="distance-list">
                <li>
                  <span>Пешком</span>
                  <strong>{distanceLine}</strong>
                </li>
              </ul>
            </section>
          )}
        </div>
      )}
    </article>
  )
}
