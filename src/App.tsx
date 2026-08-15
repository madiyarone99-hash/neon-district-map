import { useEffect, useState } from 'react'
import { MapView, findBuilding } from './components/MapView'
import { Timeline } from './components/Timeline'
import { BuildingPanel } from './components/BuildingPanel'
import { DISTRICT, YEARS, type Year } from './data/district'
import './App.css'

export default function App() {
  const [year, setYear] = useState<Year>(2026)
  const [selectedId, setSelectedId] = useState<string | null>('b1')
  const [playing, setPlaying] = useState(false)
  const [layers, setLayers] = useState({
    green: true,
    lrt: true,
    mosque: true,
  })

  useEffect(() => {
    if (!playing) return
    const id = window.setInterval(() => {
      setYear((y) => {
        const i = YEARS.indexOf(y)
        if (i >= YEARS.length - 1) {
          setPlaying(false)
          return y
        }
        return YEARS[i + 1]
      })
    }, 1400)
    return () => window.clearInterval(id)
  }, [playing])

  const selected = findBuilding(selectedId) ?? null

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden />
          <div>
            <h1>{DISTRICT.name}</h1>
            <p>{DISTRICT.subtitle}</p>
          </div>
        </div>
        <p className="tagline">{DISTRICT.tagline}</p>
        <div className="layers" role="group" aria-label="Слои карты">
          {(
            [
              ['green', 'Зелень'],
              ['lrt', 'LRT'],
              ['mosque', 'Мечеть'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`layer-btn ${layers[key] ? 'is-on' : ''}`}
              onClick={() => setLayers((s) => ({ ...s, [key]: !s[key] }))}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <main className="stage">
        <MapView
          year={year}
          selectedId={selectedId}
          onSelect={setSelectedId}
          showGreen={layers.green}
          showLrt={layers.lrt}
          showMosque={layers.mosque}
        />
        <BuildingPanel
          building={selected}
          year={year}
          onClose={() => setSelectedId(null)}
        />
      </main>

      <Timeline
        year={year}
        onChange={setYear}
        playing={playing}
        onTogglePlay={() => setPlaying((p) => !p)}
      />

      <footer className="hint">
        Крути год — смотри LRT, парки, фазы и цены. Тапни здание для условий.
      </footer>
    </div>
  )
}
