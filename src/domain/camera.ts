export const DISTRICT_CENTER: [number, number] = [71.4255, 51.1282]
export const INITIAL_ZOOM = 14.8
export const INITIAL_PITCH = 30
export const INITIAL_BEARING = -18
export const MIN_ZOOM = 12
export const MAX_ZOOM = 18
export const FLY_ZOOM = 15.9
export const FLY_PITCH = 44

export interface CameraPadding {
  top: number
  bottom: number
  left: number
  right: number
}

export interface PaddingInput {
  viewportWidth: number
  viewportHeight: number
  selected: boolean
  sheetExpanded: boolean
}

export function cameraPadding(input: PaddingInput): CameraPadding {
  const mobile = input.viewportWidth < 720
  const compact = input.viewportHeight < 700
  const top = mobile ? (compact ? 64 : 72) : 84
  const side = mobile ? 10 : 16

  let bottom = mobile ? 156 : 168
  if (input.selected && input.sheetExpanded) {
    bottom = mobile ? Math.round(input.viewportHeight * 0.46) : 188
  } else if (input.selected) {
    bottom = mobile ? 236 : 176
  }

  const right = !mobile && input.selected ? 400 : side
  return { top, bottom, left: side, right }
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function flyDurationMs(): number {
  return prefersReducedMotion() ? 0 : 900
}
