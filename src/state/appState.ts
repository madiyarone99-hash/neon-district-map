import { DEFAULT_FILTERS, toggleFilter, togglePoiFilter } from '../domain/filters'
import { clampYear, nextYear } from '../domain/timeline'
import type {
  FilterState,
  LayerId,
  PoiKind,
  ProjectStatus,
  SheetMode,
  SortKey,
  ViewMode,
  Year,
} from '../domain/types'

export type LoadState = 'idle' | 'loading' | 'ready' | 'error'

export type Selection =
  | { type: 'project'; id: string }
  | { type: 'station'; id: string }
  | { type: 'park'; id: string }
  | null

export interface AppState {
  year: Year
  playing: boolean
  selection: Selection
  sheet: SheetMode
  filters: FilterState
  filterOpen: boolean
  sortKey: SortKey
  statusFilter: ProjectStatus[]
  maxPricePerSqm: number | null
  viewMode: ViewMode
  timelineExpanded: boolean
  load: LoadState
  errorMessage: string | null
}

export type AppAction =
  | { type: 'setYear'; year: number }
  | { type: 'togglePlay' }
  | { type: 'stopPlay' }
  | { type: 'tick' }
  | { type: 'selectProject'; id: string | null }
  | { type: 'selectStation'; id: string | null }
  | { type: 'selectPark'; id: string | null }
  | { type: 'clearSelection' }
  | { type: 'setSheet'; sheet: SheetMode }
  | { type: 'toggleSheet' }
  | { type: 'toggleFilter'; id: LayerId }
  | { type: 'togglePoiFilter'; kind: PoiKind }
  | { type: 'setFilterOpen'; open: boolean }
  | { type: 'setSortKey'; sortKey: SortKey }
  | { type: 'toggleStatusFilter'; status: ProjectStatus }
  | { type: 'setMaxPrice'; value: number | null }
  | { type: 'resetListingFilters' }
  | { type: 'setViewMode'; mode: ViewMode }
  | { type: 'setTimelineExpanded'; expanded: boolean }
  | { type: 'toggleTimelineExpanded' }
  | { type: 'loadStart' }
  | { type: 'loadOk' }
  | { type: 'loadError'; message: string }

export const INITIAL_STATE: AppState = {
  year: 2026,
  playing: false,
  selection: null,
  sheet: 'peek',
  filters: DEFAULT_FILTERS,
  filterOpen: false,
  sortKey: 'recommended',
  statusFilter: [],
  maxPricePerSqm: null,
  viewMode: 'map',
  timelineExpanded: false,
  load: 'idle',
  errorMessage: null,
}

function withSelection(state: AppState, selection: Selection): AppState {
  return { ...state, selection, sheet: 'peek', filterOpen: false }
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'setYear':
      return { ...state, year: clampYear(action.year) }
    case 'togglePlay':
      if (state.playing) return { ...state, playing: false }
      if (nextYear(state.year) == null) return { ...state, playing: false }
      return { ...state, playing: true }
    case 'stopPlay':
      return { ...state, playing: false }
    case 'tick': {
      const upcoming = nextYear(state.year)
      if (upcoming == null) return { ...state, playing: false }
      return { ...state, year: upcoming }
    }
    case 'selectProject':
      return withSelection(state, action.id == null ? null : { type: 'project', id: action.id })
    case 'selectStation':
      return withSelection(state, action.id == null ? null : { type: 'station', id: action.id })
    case 'selectPark':
      return withSelection(state, action.id == null ? null : { type: 'park', id: action.id })
    case 'clearSelection':
      return withSelection(state, null)
    case 'setSheet':
      return { ...state, sheet: action.sheet }
    case 'toggleSheet':
      return { ...state, sheet: state.sheet === 'expanded' ? 'peek' : 'expanded' }
    case 'toggleFilter':
      return { ...state, filters: toggleFilter(state.filters, action.id) }
    case 'togglePoiFilter':
      return { ...state, filters: togglePoiFilter(state.filters, action.kind) }
    case 'setFilterOpen':
      return { ...state, filterOpen: action.open }
    case 'setSortKey':
      return { ...state, sortKey: action.sortKey }
    case 'toggleStatusFilter': {
      const has = state.statusFilter.includes(action.status)
      return {
        ...state,
        statusFilter: has
          ? state.statusFilter.filter((status) => status !== action.status)
          : [...state.statusFilter, action.status],
      }
    }
    case 'setMaxPrice':
      return { ...state, maxPricePerSqm: action.value }
    case 'resetListingFilters':
      return { ...state, statusFilter: [], maxPricePerSqm: null, sortKey: 'recommended' }
    case 'setViewMode':
      return { ...state, viewMode: action.mode }
    case 'setTimelineExpanded':
      return { ...state, timelineExpanded: action.expanded }
    case 'toggleTimelineExpanded':
      return { ...state, timelineExpanded: !state.timelineExpanded }
    case 'loadStart':
      return { ...state, load: 'loading', errorMessage: null }
    case 'loadOk':
      return { ...state, load: 'ready', errorMessage: null }
    case 'loadError':
      return { ...state, load: 'error', errorMessage: action.message }
    default:
      return state
  }
}
