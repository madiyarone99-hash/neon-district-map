import { describe, expect, it } from 'vitest'
import { INITIAL_STATE, appReducer } from './appState'

describe('appReducer', () => {
  it('plays forward through years and stops at 2032', () => {
    let state = appReducer(INITIAL_STATE, { type: 'togglePlay' })
    expect(state.playing).toBe(true)
    state = appReducer({ ...state, year: 2031 }, { type: 'tick' })
    expect(state.year).toBe(2032)
    state = appReducer(state, { type: 'tick' })
    expect(state.playing).toBe(false)
    expect(state.year).toBe(2032)
  })

  it('does not start playback on the last year', () => {
    const state = appReducer({ ...INITIAL_STATE, year: 2032 }, { type: 'togglePlay' })
    expect(state.playing).toBe(false)
  })

  it('selects a project, closes filters, and resets the sheet to peek', () => {
    const open = appReducer(INITIAL_STATE, { type: 'setFilterOpen', open: true })
    const expanded = appReducer(open, { type: 'setSheet', sheet: 'expanded' })
    const selected = appReducer(expanded, { type: 'selectProject', id: 'prism' })
    expect(selected.selection).toEqual({ type: 'project', id: 'prism' })
    expect(selected.sheet).toBe('peek')
    expect(selected.filterOpen).toBe(false)
  })

  it('clears selection', () => {
    const selected = appReducer(INITIAL_STATE, { type: 'selectProject', id: 'prism' })
    const cleared = appReducer(selected, { type: 'clearSelection' })
    expect(cleared.selection).toBeNull()
  })

  it('selecting a station replaces a project selection, never both at once', () => {
    const project = appReducer(INITIAL_STATE, { type: 'selectProject', id: 'prism' })
    const station = appReducer(project, { type: 'selectStation', id: 'node/13612447971' })
    expect(station.selection).toEqual({ type: 'station', id: 'node/13612447971' })
  })

  it('selecting a park works the same way', () => {
    const park = appReducer(INITIAL_STATE, { type: 'selectPark', id: 'way/69232075' })
    expect(park.selection).toEqual({ type: 'park', id: 'way/69232075' })
  })

  it('toggles a layer', () => {
    const next = appReducer(INITIAL_STATE, { type: 'toggleFilter', id: 'poi' })
    expect(next.filters.layers.poi).toBe(true)
  })

  it('toggles a POI sub-kind', () => {
    const next = appReducer(INITIAL_STATE, { type: 'togglePoiFilter', kind: 'mall' })
    expect(next.filters.poi.mall).toBe(false)
  })

  it('accumulates status filter chips and can remove them again', () => {
    const withPlanned = appReducer(INITIAL_STATE, {
      type: 'toggleStatusFilter',
      status: 'planned',
    })
    expect(withPlanned.statusFilter).toEqual(['planned'])
    const removed = appReducer(withPlanned, { type: 'toggleStatusFilter', status: 'planned' })
    expect(removed.statusFilter).toEqual([])
  })

  it('resets listing filters and sort together', () => {
    const dirty = appReducer(
      appReducer(INITIAL_STATE, { type: 'setSortKey', sortKey: 'price-asc' }),
      { type: 'setMaxPrice', value: 500000 },
    )
    const clean = appReducer(dirty, { type: 'resetListingFilters' })
    expect(clean.sortKey).toBe('recommended')
    expect(clean.maxPricePerSqm).toBeNull()
    expect(clean.statusFilter).toEqual([])
  })

  it('switches between map and list view', () => {
    const list = appReducer(INITIAL_STATE, { type: 'setViewMode', mode: 'list' })
    expect(list.viewMode).toBe('list')
  })

  it('expands the timeline dock', () => {
    const expanded = appReducer(INITIAL_STATE, { type: 'toggleTimelineExpanded' })
    expect(expanded.timelineExpanded).toBe(true)
  })

  it('records load errors instead of hiding them', () => {
    const failed = appReducer(INITIAL_STATE, {
      type: 'loadError',
      message: 'city.json недоступен',
    })
    expect(failed.load).toBe('error')
    expect(failed.errorMessage).toContain('city.json')
  })
})
