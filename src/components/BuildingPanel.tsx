import { motion, AnimatePresence } from 'framer-motion'
import {
  type Building,
  type Year,
  AMENITY_LABEL,
  PHASE_LABEL,
  getPhaseAtYear,
  getPriceAtYear,
  formatPrice,
  priceDelta,
} from '../data/district'

interface BuildingPanelProps {
  building: Building | null
  year: Year
  onClose: () => void
}

function PriceChart({ building, year }: { building: Building; year: Year }) {
  const points = building.prices.filter((p) => p.year <= year + 2)
  if (points.length < 2) {
    return <p className="muted">Цена появится после старта продаж</p>
  }
  const max = Math.max(...points.map((p) => p.pricePerSqm))
  const min = Math.min(...points.map((p) => p.pricePerSqm))
  const w = 280
  const h = 72
  const pad = 6
  const coords = points.map((p, i) => {
    const x = pad + (i / (points.length - 1)) * (w - pad * 2)
    const y =
      h - pad - ((p.pricePerSqm - min) / (max - min || 1)) * (h - pad * 2)
    return { x, y, ...p }
  })
  const d = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x},${c.y}`).join(' ')
  const current = coords.find((c) => c.year === year) ?? coords.at(-1)

  return (
    <svg className="price-chart" viewBox={`0 0 ${w} ${h}`} width="100%" height={h}>
      <defs>
        <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`${d} L${coords.at(-1)!.x},${h} L${coords[0].x},${h} Z`}
        fill="url(#priceFill)"
      />
      <path d={d} fill="none" stroke="#00f0ff" strokeWidth="2" />
      {current && (
        <circle cx={current.x} cy={current.y} r="4" fill="#ff2bd6" stroke="#fff" strokeWidth="1" />
      )}
    </svg>
  )
}

function PhaseTrack({ building, year }: { building: Building; year: Year }) {
  const order = ['planned', 'excavation', 'structure', 'finishing', 'handover', 'sold'] as const
  const current = getPhaseAtYear(building, year)
  const currentIdx = current ? order.indexOf(current) : -1

  return (
    <ol className="phase-track">
      {order.map((phase, i) => (
        <li
          key={phase}
          className={`phase-step ${i <= currentIdx ? 'is-done' : ''} ${phase === current ? 'is-current' : ''}`}
        >
          <span className="phase-dot" />
          <span className="phase-name">{PHASE_LABEL[phase]}</span>
        </li>
      ))}
    </ol>
  )
}

export function BuildingPanel({ building, year, onClose }: BuildingPanelProps) {
  return (
    <AnimatePresence>
      {building && (
        <motion.aside
          className="building-panel"
          initial={{ x: 28, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 28, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        >
          <div className="panel-head">
            <div>
              <p className="panel-kicker">OBJECT // {building.id.toUpperCase()}</p>
              <h2>{building.name}</h2>
              <p className="panel-tagline">{building.tagline}</p>
            </div>
            <button type="button" className="icon-close" onClick={onClose} aria-label="Закрыть">
              ×
            </button>
          </div>

          <div className="panel-stats">
            <div>
              <span className="stat-label">Цена {year}</span>
              <strong>
                {(() => {
                  const p = getPriceAtYear(building, year)
                  return p != null ? formatPrice(p) : '—'
                })()}
              </strong>
              {(() => {
                const d = priceDelta(building, year)
                if (d == null) return null
                return (
                  <span className={`delta ${d >= 0 ? 'up' : 'down'}`}>
                    {d >= 0 ? '+' : ''}
                    {d.toFixed(1)}% YoY
                  </span>
                )
              })()}
            </div>
            <div>
              <span className="stat-label">Площадь</span>
              <strong>{building.areaSqm} м²</strong>
            </div>
            <div>
              <span className="stat-label">Этажей</span>
              <strong>{building.floors}</strong>
            </div>
          </div>

          <section className="panel-section">
            <h3>История цен</h3>
            <PriceChart building={building} year={year} />
          </section>

          <section className="panel-section">
            <h3>Фазы стройки</h3>
            <PhaseTrack building={building} year={year} />
          </section>

          <section className="panel-section">
            <h3>Рядом</h3>
            <ul className="amenity-list">
              {building.amenities.map((a) => (
                <li key={a}>{AMENITY_LABEL[a]}</li>
              ))}
            </ul>
          </section>

          <section className="panel-section">
            <h3>Условия покупки</h3>
            <ul className="conditions">
              {building.conditions.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </section>

          <section className="panel-section future">
            <h3>Что дальше</h3>
            <p>{building.futurePlan}</p>
          </section>

          <button type="button" className="cta">
            Забронировать интерес
          </button>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
