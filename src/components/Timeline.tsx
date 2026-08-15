import type { CSSProperties } from 'react'
import { YEARS, YEAR_EVENTS, type Year } from '../data/district'

interface TimelineProps {
  year: Year
  onChange: (year: Year) => void
  playing: boolean
  onTogglePlay: () => void
}

export function Timeline({ year, onChange, playing, onTogglePlay }: TimelineProps) {
  const min = YEARS[0]
  const max = YEARS[YEARS.length - 1]
  const idx = YEARS.indexOf(year)
  const progress = idx / (YEARS.length - 1)

  return (
    <div className="timeline">
      <div className="timeline-top">
        <button
          type="button"
          className={`play-btn ${playing ? 'is-playing' : ''}`}
          onClick={onTogglePlay}
          aria-label={playing ? 'Пауза' : 'Воспроизвести'}
        >
          {playing ? '❚❚' : '▶'}
        </button>
        <div className="timeline-year">
          <span className="year-num">{year}</span>
          <span className="year-event">{YEAR_EVENTS[year]}</span>
        </div>
      </div>

      <div className="timeline-track-wrap">
        <input
          className="timeline-range"
          type="range"
          min={min}
          max={max}
          step={1}
          value={year}
          onChange={(e) => onChange(Number(e.target.value) as Year)}
          aria-label="Год развития района"
          style={{ '--progress': `${progress * 100}%` } as CSSProperties}
        />
        <div className="timeline-ticks">
          {YEARS.map((y) => (
            <button
              key={y}
              type="button"
              className={`tick ${y === year ? 'is-active' : ''}`}
              onClick={() => onChange(y)}
            >
              {y}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
