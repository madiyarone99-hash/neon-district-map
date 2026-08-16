import { YEARS, type LrtLineStatus, type LrtStatus, type Phase, type ProjectStatus, type Year } from './types'

export const YEAR_EVENTS: Record<Year, string> = {
  2024: 'Существующая застройка · первые продажи',
  2025: 'Canal Strip выходит на рынок',
  2026: 'LRT Tarlan — активная стройка',
  2027: 'Новые корпуса и благоустройство',
  2028: 'Пик каркаса · North lot в продаже',
  2029: 'Отделка и первые сдачи',
  2030: 'LRT в режиме линии',
  2031: 'Рынок насыщается',
  2032: 'Следующая очередь района',
}

export const LRT_CONSTRUCTION_YEAR = 2026
export const LRT_OPEN_YEAR = 2030

export function isYear(value: number): value is Year {
  return (YEARS as readonly number[]).includes(value)
}

export function clampYear(value: number): Year {
  if (value <= YEARS[0]) return YEARS[0]
  if (value >= YEARS[YEARS.length - 1]) return YEARS[YEARS.length - 1]
  return value as Year
}

export function yearIndex(year: Year): number {
  return YEARS.indexOf(year)
}

export function yearProgress(year: Year): number {
  return yearIndex(year) / (YEARS.length - 1)
}

export function nextYear(year: Year): Year | null {
  const i = yearIndex(year)
  if (i < 0 || i >= YEARS.length - 1) return null
  return YEARS[i + 1]
}

export function lrtStatusAtYear(year: number): LrtStatus {
  if (year < LRT_CONSTRUCTION_YEAR) return 'planned'
  if (year < LRT_OPEN_YEAR) return 'construction'
  return 'open'
}

export function lrtStatusLabel(status: LrtStatus): string {
  if (status === 'planned') return 'Проект'
  if (status === 'construction') return 'Строится'
  return 'Открыта'
}

export const PHASE_LABEL: Record<Phase, string> = {
  planned: 'План',
  excavation: 'Котлован',
  structure: 'Каркас',
  finishing: 'Отделка',
  handover: 'Сдача',
  sold: 'Продано',
}

/** Three states a user actually needs to tell apart on the map. */
export function projectStatusFromPhase(phase: Phase | null): ProjectStatus | null {
  if (phase == null) return null
  if (phase === 'planned') return 'planned'
  if (phase === 'handover' || phase === 'sold') return 'completed'
  return 'construction'
}

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  planned: 'Проект',
  construction: 'Строится',
  completed: 'Построен',
}

/**
 * A line segment tagged `proposed` in OSM (the North LRT extension) is a
 * planning proposal independent of our own construction-year model — it
 * stays a ghost outline no matter what year is selected.
 */
export function lrtSegmentStatus(segment: 'core' | 'proposed', year: number): LrtLineStatus {
  if (segment === 'proposed') return 'proposed'
  return lrtStatusAtYear(year)
}
