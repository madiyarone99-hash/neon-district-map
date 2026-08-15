import { motion } from 'framer-motion'
import {
  buildings,
  zones,
  type Building,
  type Year,
  getPhaseAtYear,
  getPriceAtYear,
  formatPrice,
  PHASE_LABEL,
} from '../data/district'

const LRT_STATIONS = [
  { x: 120, y: 360 },
  { x: 400, y: 310 },
  { x: 700, y: 350 },
  { x: 900, y: 310 },
]

interface MapViewProps {
  year: Year
  selectedId: string | null
  onSelect: (id: string) => void
  showGreen: boolean
  showLrt: boolean
  showMosque: boolean
}

function phaseClass(phase: string | null): string {
  if (!phase) return 'is-ghost'
  return `is-${phase}`
}

export function MapView({
  year,
  selectedId,
  onSelect,
  showGreen,
  showLrt,
  showMosque,
}: MapViewProps) {
  return (
    <div className="map-shell">
      <div className="map-grid" aria-hidden />
      <svg
        className="map-svg"
        viewBox="0 0 1000 620"
        role="img"
        aria-label={`Карта NEXUS-7, год ${year}`}
      >
        <defs>
          <radialGradient id="glowCyan" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="glowMagenta" cx="70%" cy="30%" r="40%">
            <stop offset="0%" stopColor="#ff2bd6" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#ff2bd6" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="waterGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0a3d55" />
            <stop offset="100%" stopColor="#062433" />
          </linearGradient>
          <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#39ff88" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#0d5c36" stopOpacity="0.35" />
          </linearGradient>
          <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="neonStroke" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="1000" height="620" fill="url(#glowCyan)" />
        <rect width="1000" height="620" fill="url(#glowMagenta)" />

        {/* Streets */}
        <g className="streets" opacity="0.35">
          <path d="M0 200 H1000" stroke="#4a6a7a" strokeWidth="2" />
          <path d="M0 360 H1000" stroke="#4a6a7a" strokeWidth="2" />
          <path d="M200 0 V620" stroke="#4a6a7a" strokeWidth="2" />
          <path d="M520 0 V620" stroke="#4a6a7a" strokeWidth="2" />
          <path d="M780 0 V620" stroke="#4a6a7a" strokeWidth="1.5" />
        </g>

        {zones.map((zone) => {
          if (year < zone.appearYear) return null
          if (zone.type === 'green' && !showGreen) return null
          if (zone.type === 'lrt' && !showLrt) return null
          if (zone.type === 'mosque' && !showMosque) return null

          const path =
            zone.expandYear && year >= zone.expandYear && zone.expandPath
              ? zone.expandPath
              : zone.path

          if (zone.type === 'lrt') {
            const open = year >= 2030
            const underConstruction = year >= 2026 && year < 2030
            return (
              <g key={zone.id} className="zone-lrt">
                <motion.path
                  d={path}
                  fill="none"
                  stroke={open ? '#00f0ff' : underConstruction ? '#ffb020' : '#556'}
                  strokeWidth={open ? 6 : 4}
                  strokeDasharray={open ? '0' : '12 10'}
                  filter="url(#neonStroke)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.8 }}
                />
                {LRT_STATIONS.map((s, i) => (
                  <circle
                    key={i}
                    cx={s.x}
                    cy={s.y}
                    r={open ? 7 : 5}
                    fill={open ? '#00f0ff' : '#ffb020'}
                    opacity={underConstruction || open ? 1 : 0.4}
                  />
                ))}
                <text
                  x="560"
                  y="300"
                  className="zone-label lrt-label"
                  fill="#00f0ff"
                >
                  {open ? 'LRT OPEN' : underConstruction ? 'LRT BUILD' : 'LRT'}
                </text>
              </g>
            )
          }

          if (zone.type === 'water') {
            return (
              <motion.path
                key={zone.id}
                d={path}
                fill="url(#waterGrad)"
                stroke="#1a8ab8"
                strokeWidth="1.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.9 }}
              />
            )
          }

          if (zone.type === 'green') {
            return (
              <motion.path
                key={`${zone.id}-${path}`}
                d={path}
                fill="url(#greenGrad)"
                stroke="#39ff88"
                strokeWidth="1.5"
                filter="url(#softGlow)"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45 }}
                style={{ transformOrigin: 'center' }}
              />
            )
          }

          if (zone.type === 'mosque') {
            return (
              <g key={zone.id}>
                <motion.path
                  d={path}
                  fill="#1a1030"
                  stroke="#ff2bd6"
                  strokeWidth="2"
                  filter="url(#softGlow)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
                <text x="210" y="155" className="zone-label mosque-label" fill="#ff9de8">
                  MEGA MOSQUE
                </text>
              </g>
            )
          }

          return null
        })}

        {buildings.map((b) => {
          const visible = year >= b.appearYear
          const phase = getPhaseAtYear(b, year)
          const price = getPriceAtYear(b, year)
          const selected = selectedId === b.id

          return (
            <g
              key={b.id}
              className={`building ${phaseClass(phase)} ${selected ? 'is-selected' : ''} ${visible ? 'is-visible' : 'is-hidden'}`}
              onClick={() => visible && onSelect(b.id)}
              style={{ cursor: visible ? 'pointer' : 'default' }}
            >
              <motion.path
                d={b.polygon}
                initial={false}
                animate={{
                  opacity: visible ? 1 : 0,
                  scale: visible ? 1 : 0.92,
                }}
                transition={{ duration: 0.35 }}
                style={{ transformOrigin: `${b.label[0]}px ${b.label[1]}px` }}
              />
              {visible && (
                <>
                  <text
                    x={b.label[0]}
                    y={b.label[1] - 6}
                    textAnchor="middle"
                    className="building-name"
                  >
                    {b.name.split(' ')[0]}
                  </text>
                  <text
                    x={b.label[0]}
                    y={b.label[1] + 12}
                    textAnchor="middle"
                    className="building-meta"
                  >
                    {phase ? PHASE_LABEL[phase] : ''}
                    {price != null ? ` · ${formatPrice(price)}` : ''}
                  </text>
                </>
              )}
            </g>
          )
        })}
      </svg>

      <div className="map-scanline" aria-hidden />
    </div>
  )
}

export function findBuilding(id: string | null): Building | undefined {
  return buildings.find((b) => b.id === id)
}
