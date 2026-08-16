import { useEffect, useMemo, useReducer, useState } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import { listingDistances } from './domain/distances'
import { LISTINGS, findListing } from './domain/listings'
import { listingVisibleInYear } from './domain/listings'
import { nearestDistance } from './domain/geo'
import {
  buildListingContext,
  filterListingContextsByMaxPrice,
  filterListingContextsByStatus,
  sortListingContexts,
} from './domain/sort'
import type { ProjectStatus } from './domain/types'
import { MapCanvas } from './map/MapCanvas'
import { loadMapData, type MapData } from './map/loadData'
import { INITIAL_STATE, appReducer, type Selection } from './state/appState'
import { useTheme } from './state/useTheme'
import { FilterSheet } from './ui/FilterSheet'
import { ListView } from './ui/ListView'
import { MapControls } from './ui/MapControls'
import { ParkSheet } from './ui/ParkSheet'
import { ProjectSheet } from './ui/ProjectSheet'
import { StationSheet } from './ui/StationSheet'
import { TimelineDock } from './ui/TimelineDock'
import { TopBar } from './ui/TopBar'
import './App.css'

export default function App() {
  const [state, dispatch] = useReducer(appReducer, INITIAL_STATE)
  const [data, setData] = useState<MapData | null>(null)
  const [map, setMap] = useState<MapLibreMap | null>(null)
  const theme = useTheme()

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'loadStart' })
    loadMapData()
      .then((loaded) => {
        if (cancelled) return
        setData(loaded)
        dispatch({ type: 'loadOk' })
      })
      .catch((error: unknown) => {
        if (cancelled) return
        const message = error instanceof Error ? error.message : 'Не удалось загрузить карту'
        dispatch({ type: 'loadError', message })
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!state.playing) return
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timer = window.setInterval(() => dispatch({ type: 'tick' }), reduced ? 350 : 1100)
    return () => window.clearInterval(timer)
  }, [state.playing])

  const selectedProject =
    state.selection?.type === 'project' ? findListing(state.selection.id) : null
  const selectedSale = selectedProject
    ? data?.city.sale.find((item) => item.osmId === selectedProject.osmId)
    : undefined
  const selectedProjectCenter: [number, number] | null = selectedSale
    ? [selectedSale.cx, selectedSale.cy]
    : null

  const distances = useMemo(() => {
    if (!selectedProject || !selectedSale || !data) return []
    return listingDistances([selectedSale.cx, selectedSale.cy], data.amenityPoints)
  }, [selectedProject, selectedSale, data])

  const transitPoints = useMemo(() => {
    if (!data) return [] as Array<{ coordinates: [number, number] }>
    return data.amenityPoints
      .filter((point) => point.kind === 'transit')
      .map((point) => ({ coordinates: point.coordinates }))
  }, [data])
  const parkPoints = useMemo(() => {
    if (!data) return [] as Array<{ coordinates: [number, number] }>
    return data.amenityPoints
      .filter((point) => point.kind === 'park')
      .map((point) => ({ coordinates: point.coordinates }))
  }, [data])

  const listingContexts = useMemo(() => {
    if (!data) return []
    const items = LISTINGS.filter((listing) => listingVisibleInYear(listing, state.year)).map(
      (listing) => {
        const sale = data.city.sale.find((item) => item.osmId === listing.osmId)
        const center: [number, number] | null = sale ? [sale.cx, sale.cy] : null
        return buildListingContext(listing, state.year, {
          lrtMeters: center ? nearestDistance(center, transitPoints) : null,
          parkMeters: center ? nearestDistance(center, parkPoints) : null,
        })
      },
    )
    const statusSet = new Set<ProjectStatus>(state.statusFilter)
    const filteredByStatus = filterListingContextsByStatus(items, statusSet)
    const filtered = filterListingContextsByMaxPrice(filteredByStatus, state.maxPricePerSqm)
    return sortListingContexts(filtered, state.sortKey)
  }, [data, state.year, state.statusFilter, state.maxPricePerSqm, state.sortKey, transitPoints, parkPoints])

  const mapVisible = state.viewMode === 'map'

  return (
    <div
      className={`app ${state.selection ? 'has-selection' : ''} sheet-${state.sheet} view-${state.viewMode}`}
    >
      {mapVisible && (
        <MapCanvas
          city={data?.city ?? null}
          infra={data?.infra ?? null}
          amenities={data?.amenities ?? null}
          year={state.year}
          filters={state.filters}
          selection={state.selection}
          sheetExpanded={state.sheet === 'expanded'}
          theme={theme.resolved}
          onSelectProject={(id) => dispatch({ type: 'selectProject', id })}
          onSelectStation={(id) => dispatch({ type: 'selectStation', id })}
          onSelectPark={(id) => dispatch({ type: 'selectPark', id })}
          onClearSelection={() => dispatch({ type: 'clearSelection' })}
          onReady={setMap}
        />
      )}

      {!mapVisible && (
        <ListView
          items={listingContexts}
          selectedId={state.selection?.type === 'project' ? state.selection.id : null}
          onSelect={(id) => dispatch({ type: 'selectProject', id })}
        />
      )}

      <TopBar
        filters={state.filters}
        filterOpen={state.filterOpen}
        sortKey={state.sortKey}
        viewMode={state.viewMode}
        themeMode={theme.mode}
        onOpenFilters={() => dispatch({ type: 'setFilterOpen', open: !state.filterOpen })}
        onSetSortKey={(sortKey) => dispatch({ type: 'setSortKey', sortKey })}
        onSetViewMode={(mode) => dispatch({ type: 'setViewMode', mode })}
        onCycleTheme={theme.cycle}
      />

      {mapVisible && <MapControls map={map} />}

      <div className="bottom-stack">
        <SelectionSheet
          selection={state.selection}
          state={state}
          data={data}
          distances={distances}
          selectedProjectCenter={selectedProjectCenter}
          onClose={() => dispatch({ type: 'clearSelection' })}
          onToggle={() => dispatch({ type: 'toggleSheet' })}
        />
        <TimelineDock
          year={state.year}
          playing={state.playing}
          expanded={state.timelineExpanded}
          onChange={(year) => dispatch({ type: 'setYear', year })}
          onTogglePlay={() => dispatch({ type: 'togglePlay' })}
          onToggleExpanded={() => dispatch({ type: 'toggleTimelineExpanded' })}
        />
      </div>

      <FilterSheet
        open={state.filterOpen}
        filters={state.filters}
        sortKey={state.sortKey}
        statusFilter={state.statusFilter}
        maxPricePerSqm={state.maxPricePerSqm}
        resultCount={listingContexts.length}
        onToggleLayer={(id) => dispatch({ type: 'toggleFilter', id })}
        onTogglePoi={(kind) => dispatch({ type: 'togglePoiFilter', kind })}
        onSetSortKey={(sortKey) => dispatch({ type: 'setSortKey', sortKey })}
        onToggleStatus={(status) => dispatch({ type: 'toggleStatusFilter', status })}
        onSetMaxPrice={(value) => dispatch({ type: 'setMaxPrice', value })}
        onResetListingFilters={() => dispatch({ type: 'resetListingFilters' })}
        onClose={() => dispatch({ type: 'setFilterOpen', open: false })}
      />

      {state.load === 'loading' && (
        <div className="status-banner glass" role="status">
          Загружаем квартал и OSM…
        </div>
      )}
      {state.load === 'error' && (
        <div className="status-banner glass is-error" role="alert">
          {state.errorMessage}
        </div>
      )}
    </div>
  )
}

interface SelectionSheetProps {
  selection: Selection
  state: { year: (typeof INITIAL_STATE)['year']; sheet: (typeof INITIAL_STATE)['sheet'] }
  data: MapData | null
  distances: ReturnType<typeof listingDistances>
  selectedProjectCenter: [number, number] | null
  onClose: () => void
  onToggle: () => void
}

function SelectionSheet({
  selection,
  state,
  data,
  distances,
  selectedProjectCenter,
  onClose,
  onToggle,
}: SelectionSheetProps) {
  if (!selection) return null
  if (selection.type === 'project') {
    const listing = findListing(selection.id)
    if (!listing) return null
    const sale = data?.city.sale.find((item) => item.osmId === listing.osmId)
    return (
      <ProjectSheet
        listing={listing}
        year={state.year}
        height={sale?.h ?? null}
        source={sale?.src ?? null}
        distances={distances}
        mode={state.sheet}
        onClose={onClose}
        onToggle={onToggle}
      />
    )
  }
  if (selection.type === 'station') {
    return (
      <StationSheet
        stationId={selection.id}
        infra={data?.infra ?? null}
        year={state.year}
        mode={state.sheet}
        selectedProjectCenter={selectedProjectCenter}
        onClose={onClose}
        onToggle={onToggle}
      />
    )
  }
  return (
    <ParkSheet
      parkId={selection.id}
      infra={data?.infra ?? null}
      mode={state.sheet}
      selectedProjectCenter={selectedProjectCenter}
      onClose={onClose}
      onToggle={onToggle}
    />
  )
}
