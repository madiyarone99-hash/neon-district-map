import { useMemo } from 'react'
import { LAYER_META, POI_META } from '../domain/filters'
import { PROJECT_STATUS_LABEL } from '../domain/timeline'
import type { FilterState, LayerId, PoiKind, ProjectStatus, SortKey } from '../domain/types'
import { SORT_META } from '../domain/sort'

interface FilterSheetProps {
  open: boolean
  filters: FilterState
  sortKey: SortKey
  statusFilter: ProjectStatus[]
  maxPricePerSqm: number | null
  resultCount: number
  onToggleLayer: (id: LayerId) => void
  onTogglePoi: (kind: PoiKind) => void
  onSetSortKey: (key: SortKey) => void
  onToggleStatus: (status: ProjectStatus) => void
  onSetMaxPrice: (value: number | null) => void
  onResetListingFilters: () => void
  onClose: () => void
}

const STATUS_ORDER: ProjectStatus[] = ['planned', 'construction', 'completed']
const PRICE_MAX = 1_200_000
const PRICE_STEP = 50_000

export function FilterSheet({
  open,
  filters,
  sortKey,
  statusFilter,
  maxPricePerSqm,
  resultCount,
  onToggleLayer,
  onTogglePoi,
  onSetSortKey,
  onToggleStatus,
  onSetMaxPrice,
  onResetListingFilters,
  onClose,
}: FilterSheetProps) {
  const layerIds = useMemo(() => Object.keys(LAYER_META) as LayerId[], [])
  const poiKinds = useMemo(() => Object.keys(POI_META) as PoiKind[], [])
  const sortKeys = useMemo(() => Object.keys(SORT_META) as SortKey[], [])

  if (!open) return null

  const listingFiltersActive = statusFilter.length > 0 || maxPricePerSqm != null

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <section
        id="filter-sheet"
        className="sheet filter-sheet glass"
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sheet-handle" aria-hidden />
        <header className="sheet-head">
          <h2 id="filter-title">Фильтры и сортировка</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Закрыть">
            Закрыть
          </button>
        </header>

        <p className="filter-result" role="status">
          Показать {resultCount} {pluralize(resultCount, 'объект', 'объекта', 'объектов')}
        </p>

        <section className="filter-section">
          <h3>Слои карты</h3>
          <ul className="filter-list">
            {layerIds.map((id) => (
              <li key={id}>
                <button
                  type="button"
                  className={`filter-row-btn ${filters.layers[id] ? 'is-on' : ''}`}
                  aria-pressed={filters.layers[id]}
                  onClick={() => onToggleLayer(id)}
                >
                  <span>
                    <strong>{LAYER_META[id].label}</strong>
                    <em>{LAYER_META[id].hint}</em>
                  </span>
                  <span className="switch" aria-hidden>
                    {filters.layers[id] ? 'Вкл' : 'Выкл'}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        {filters.layers.poi && (
          <section className="filter-section">
            <h3>Инфраструктура рядом</h3>
            <ul className="filter-list">
              {poiKinds.map((kind) => (
                <li key={kind}>
                  <button
                    type="button"
                    className={`filter-row-btn ${filters.poi[kind] ? 'is-on' : ''}`}
                    aria-pressed={filters.poi[kind]}
                    onClick={() => onTogglePoi(kind)}
                  >
                    <span>
                      <strong>{POI_META[kind].label}</strong>
                      <em>{POI_META[kind].hint}</em>
                    </span>
                    <span className="switch" aria-hidden>
                      {filters.poi[kind] ? 'Вкл' : 'Выкл'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="filter-section">
          <h3>Сортировка</h3>
          <select
            className="filter-select"
            value={sortKey}
            aria-label="Сортировка списка объектов"
            onChange={(event) => onSetSortKey(event.target.value as SortKey)}
          >
            {sortKeys.map((key) => (
              <option key={key} value={key}>
                {SORT_META[key]}
              </option>
            ))}
          </select>
        </section>

        <section className="filter-section">
          <h3>Статус строительства</h3>
          <div className="chip-group" role="group" aria-label="Статус строительства">
            {STATUS_ORDER.map((status) => (
              <button
                key={status}
                type="button"
                className={`chip ${statusFilter.includes(status) ? 'is-on' : ''}`}
                aria-pressed={statusFilter.includes(status)}
                onClick={() => onToggleStatus(status)}
              >
                {PROJECT_STATUS_LABEL[status]}
              </button>
            ))}
          </div>
        </section>

        <section className="filter-section">
          <h3>Цена за м²</h3>
          <label className="range-row">
            <span>не дороже {maxPricePerSqm != null ? `${Math.round(maxPricePerSqm / 1000)}K ₸` : '∞'}</span>
            <input
              type="range"
              min={0}
              max={PRICE_MAX}
              step={PRICE_STEP}
              value={maxPricePerSqm ?? PRICE_MAX}
              aria-valuetext={
                maxPricePerSqm != null
                  ? `не дороже ${Math.round(maxPricePerSqm / 1000)}K ₸/м²`
                  : 'без ограничения по цене'
              }
              onChange={(event) => {
                const value = Number(event.target.value)
                onSetMaxPrice(value >= PRICE_MAX ? null : value)
              }}
            />
          </label>
        </section>

        {listingFiltersActive && (
          <button type="button" className="chip reset-btn" onClick={onResetListingFilters}>
            Сбросить
          </button>
        )}

        <div className="legend">
          <p>
            Высота домов берётся из OpenStreetMap. Если в данных только этажность, считаем этаж ×
            3.2 м. Если тега нет — показываем условные 10 м, без выдуманного силуэта.
          </p>
        </div>
      </section>
    </div>
  )
}

function pluralize(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few
  return many
}
