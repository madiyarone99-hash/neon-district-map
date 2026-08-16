import type { DistanceItem } from '../domain/distances'
import {
  formatDelta,
  formatPrice,
  formatTotalPrice,
  formatWalkMinutes,
} from '../domain/format'
import { walkingMinutes } from '../domain/geo'
import { floorsFromHeight, heightSourceLabel } from '../domain/height'
import {
  getPhaseAtYear,
  getPriceAtYear,
  priceDelta,
} from '../domain/listings'
import { PHASE_LABEL, PROJECT_STATUS_LABEL, projectStatusFromPhase } from '../domain/timeline'
import type { HeightSource, Listing, Phase, SheetMode, Year } from '../domain/types'
import { PHASES } from '../domain/types'

interface ProjectSheetProps {
  listing: Listing
  year: Year
  height: number | null
  source: HeightSource | null
  distances: DistanceItem[]
  mode: SheetMode
  onClose: () => void
  onToggle: () => void
}

export function ProjectSheet({
  listing,
  year,
  height,
  source,
  distances,
  mode,
  onClose,
  onToggle,
}: ProjectSheetProps) {
  const phase = getPhaseAtYear(listing, year)
  const status = projectStatusFromPhase(phase)
  const price = getPriceAtYear(listing, year)
  const delta = priceDelta(listing, year)
  const floors = height != null && source ? floorsFromHeight(height, source) : null
  const expanded = mode === 'expanded'

  return (
    <article className={`project-sheet glass is-${mode}`} aria-label={listing.name}>
      <button type="button" className="sheet-handle-btn" onClick={onToggle}>
        <span className="sheet-handle" />
        <span className="sr-only">{expanded ? 'Свернуть карточку' : 'Развернуть карточку'}</span>
      </button>

      <header className="project-head">
        <div className="project-head-text">
          <p className="project-kicker">
            {status ? PROJECT_STATUS_LABEL[status] : 'Ещё не на рынке'}
            {listing.classLabel ? ` · Класс ${listing.classLabel}` : ''}
          </p>
          <h2>{listing.name}</h2>
          {listing.osmName && <p className="project-osm">{listing.osmName}</p>}
          <p className="project-tagline">{listing.tagline}</p>
        </div>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Снять выбор">
          ×
        </button>
      </header>

      <div className="stat-grid">
        <div>
          <span>Цена {year}</span>
          <strong>{price != null ? formatPrice(price) : '—'}</strong>
          {delta != null && (
            <em className={delta >= 0 ? 'up' : 'down'}>{formatDelta(delta)}</em>
          )}
        </div>
        <div>
          <span>Общая цена</span>
          <strong>{price != null ? formatTotalPrice(price, listing.areaSqm) : '—'}</strong>
        </div>
        <div>
          <span>Площадь</span>
          <strong>{listing.areaSqm} м²</strong>
        </div>
      </div>

      {expanded && (
        <div className="project-body">
          {source && <p className="height-note">{heightSourceLabel(source)}</p>}

          <PhaseTrack current={phase} />

          {distances.length > 0 && (
            <section>
              <h3>Рядом по карте</h3>
              <ul className="distance-list">
                {distances.map((item) => (
                  <li key={item.kind}>
                    <span>{item.name}</span>
                    <strong>
                      {item.label} · {formatWalkMinutes(walkingMinutes(item.meters))}
                    </strong>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h3>Условия</h3>
            <ul className="plain-list">
              {listing.conditions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3>Что дальше</h3>
            <p>{listing.futurePlan}</p>
          </section>

          {floors != null && (
            <section>
              <h3>Высотность</h3>
              <p>{floors} эт. · {height} м</p>
            </section>
          )}
        </div>
      )}
    </article>
  )
}

function PhaseTrack({ current }: { current: Phase | null }) {
  const currentIdx = current ? PHASES.indexOf(current) : -1
  return (
    <ol className="phase-track" aria-label="Фаза строительства">
      {PHASES.map((phase, index) => (
        <li
          key={phase}
          className={`${index <= currentIdx ? 'is-done' : ''} ${phase === current ? 'is-now' : ''}`}
        >
          {PHASE_LABEL[phase]}
        </li>
      ))}
    </ol>
  )
}
