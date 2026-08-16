import { activeFilterCount } from '../domain/filters'
import { SORT_META } from '../domain/sort'
import type { FilterState, SortKey, ViewMode } from '../domain/types'
import { themeModeLabel, type ThemeMode } from '../state/theme'

interface TopBarProps {
  filters: FilterState
  filterOpen: boolean
  sortKey: SortKey
  viewMode: ViewMode
  themeMode: ThemeMode
  onOpenFilters: () => void
  onSetSortKey: (key: SortKey) => void
  onSetViewMode: (mode: ViewMode) => void
  onCycleTheme: () => void
}

export function TopBar({
  filters,
  filterOpen,
  sortKey,
  viewMode,
  themeMode,
  onOpenFilters,
  onSetSortKey,
  onSetViewMode,
  onCycleTheme,
}: TopBarProps) {
  const count = activeFilterCount(filters)
  const listingFiltersActive = false // populated by parent once price/status filters land in state

  return (
    <header className="top-chrome">
      <div className="top-row">
        <div className="brand-card glass">
          <p className="brand-kicker">NEXUS-7</p>
          <h1>Астана · левый берег</h1>
        </div>
      </div>

      <div className="control-strip glass" role="toolbar" aria-label="Фильтры и вид карты">
        <button
          type="button"
          className={`chip control-strip-main ${filterOpen ? 'is-on' : ''}`}
          aria-expanded={filterOpen}
          aria-controls="filter-sheet"
          onClick={onOpenFilters}
        >
          Фильтры
          <span className="count-badge">{count + (listingFiltersActive ? 1 : 0)}</span>
        </button>

        <span className="sort-wrap">
          <select
            className="chip sort-select"
            value={sortKey}
            aria-label="Сортировка"
            onChange={(event) => onSetSortKey(event.target.value as SortKey)}
          >
          {(Object.keys(SORT_META) as SortKey[]).map((key) => (
            <option key={key} value={key}>
              {SORT_META[key]}
            </option>
          ))}
          </select>
          <svg className="sort-caret" viewBox="0 0 10 6" width="10" height="6" aria-hidden="true" focusable="false">
            <path d="M1 1.5l4 3 4-3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </span>

        <div className="segmented" role="group" aria-label="Карта или список">
          <button
            type="button"
            className={`segment ${viewMode === 'map' ? 'is-on' : ''}`}
            aria-pressed={viewMode === 'map'}
            onClick={() => onSetViewMode('map')}
          >
            Карта
          </button>
          <button
            type="button"
            className={`segment ${viewMode === 'list' ? 'is-on' : ''}`}
            aria-pressed={viewMode === 'list'}
            onClick={() => onSetViewMode('list')}
          >
            Список
          </button>
        </div>

        <button
          type="button"
          className="icon-btn theme-toggle"
          onClick={onCycleTheme}
          aria-label={`Тема: ${themeModeLabel(themeMode)}`}
          title={themeModeLabel(themeMode)}
        >
          {themeMode === 'system' ? 'Auto' : themeMode === 'light' ? 'Свет' : 'Тьма'}
        </button>
      </div>
    </header>
  )
}
