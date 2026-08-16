import type { CSSProperties } from 'react'
import { YEAR_EVENTS, yearProgress } from '../domain/timeline'
import { YEARS, type Year } from '../domain/types'

interface TimelineDockProps {
  year: Year
  playing: boolean
  expanded: boolean
  onChange: (year: Year) => void
  onTogglePlay: () => void
  onToggleExpanded: () => void
}

export function TimelineDock({
  year,
  playing,
  expanded,
  onChange,
  onTogglePlay,
  onToggleExpanded,
}: TimelineDockProps) {
  return (
    <section
      className={`timeline-dock glass ${expanded ? 'is-expanded' : 'is-collapsed'}`}
      aria-label="Хронология района"
    >
      <button
        type="button"
        className="timeline-summary"
        onClick={onToggleExpanded}
        aria-expanded={expanded}
        aria-controls="timeline-detail"
      >
        <span className="year-num">{year}</span>
        <span className="year-event">{YEAR_EVENTS[year]}</span>
        <span className="timeline-caret" aria-hidden>
          <svg
            viewBox="0 0 10 6"
            width="10"
            height="6"
            focusable="false"
            className={`caret-icon ${expanded ? 'is-down' : 'is-up'}`}
          >
            <path d="M1 1.5l4 3 4-3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </span>
      </button>

      {expanded && (
        <div id="timeline-detail" className="timeline-detail">
          <button
            type="button"
            className={`play-btn ${playing ? 'is-on' : ''}`}
            onClick={onTogglePlay}
            aria-label={playing ? 'Пауза воспроизведения лет' : 'Показать развитие по годам'}
          >
            {playing ? 'Пауза' : 'Пуск'}
          </button>

          <input
            className="year-slider"
            type="range"
            min={YEARS[0]}
            max={YEARS[YEARS.length - 1]}
            step={1}
            value={year}
            aria-valuemin={YEARS[0]}
            aria-valuemax={YEARS[YEARS.length - 1]}
            aria-valuenow={year}
            aria-valuetext={`${year}. ${YEAR_EVENTS[year]}`}
            aria-label="Год на карте"
            onChange={(event) => onChange(Number(event.target.value) as Year)}
            style={{ '--progress': `${yearProgress(year) * 100}%` } as CSSProperties}
          />

          <div className="year-ticks">
            {YEARS.map((tick) => (
              <button
                key={tick}
                type="button"
                className={`tick ${tick === year ? 'is-on' : ''}`}
                onClick={() => onChange(tick)}
                aria-current={tick === year}
              >
                {String(tick).slice(2)}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
