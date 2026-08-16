import type { Map as MapLibreMap } from 'maplibre-gl'

/**
 * All map iconography lives here as canvas-drawn bitmaps. Colors are read
 * from the live CSS custom properties (tokens.css) so a single icon set
 * automatically matches light/dark theme — no duplicated palette in JS.
 * Glyphs are deliberately simple geometric strokes (SF-Symbols spirit),
 * never a colored dot: shape carries meaning, color is secondary.
 */

export interface PinImage {
  width: number
  height: number
  data: Uint8Array
  pixelRatio: number
}

export interface StretchableImage extends PinImage {
  content: [number, number, number, number]
  stretchX: [number, number][]
  stretchY: [number, number][]
}

const PIXEL_RATIO = 2

function cssVar(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

function createCanvas(width: number, height: number): HTMLCanvasElement | OffscreenCanvas {
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(width, height)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

type Ctx2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D

function badge(
  cssSize: number,
  fill: string,
  glyphColor: string,
  ringColor: string,
  draw: (ctx: Ctx2D, s: number) => void,
): PinImage {
  const size = cssSize * PIXEL_RATIO
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d') as Ctx2D
  const r = size / 2
  ctx.clearRect(0, 0, size, size)

  ctx.beginPath()
  ctx.arc(r, r, r - PIXEL_RATIO, 0, Math.PI * 2)
  ctx.fillStyle = fill
  ctx.fill()
  ctx.lineWidth = PIXEL_RATIO
  ctx.strokeStyle = ringColor
  ctx.stroke()

  ctx.strokeStyle = glyphColor
  ctx.fillStyle = glyphColor
  ctx.lineWidth = PIXEL_RATIO * 1.1
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  draw(ctx, size)

  const image = ctx.getImageData(0, 0, size, size)
  return { width: size, height: size, data: new Uint8Array(image.data), pixelRatio: PIXEL_RATIO }
}

function glyphSchool(ctx: Ctx2D, s: number): void {
  const c = s / 2
  ctx.beginPath()
  ctx.moveTo(c, s * 0.28)
  ctx.lineTo(s * 0.74, s * 0.42)
  ctx.lineTo(c, s * 0.56)
  ctx.lineTo(s * 0.26, s * 0.42)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(s * 0.32, s * 0.47)
  ctx.lineTo(s * 0.32, s * 0.63)
  ctx.lineTo(c, s * 0.71)
  ctx.lineTo(s * 0.68, s * 0.63)
  ctx.lineTo(s * 0.68, s * 0.47)
  ctx.stroke()
}

function glyphKindergarten(ctx: Ctx2D, s: number): void {
  const c = s / 2
  ctx.save()
  ctx.translate(c, c)
  ctx.rotate(-0.12)
  ctx.beginPath()
  ctx.roundRect(-s * 0.22, -s * 0.22, s * 0.24, s * 0.24, s * 0.04)
  ctx.fill()
  ctx.restore()
  ctx.save()
  ctx.translate(c, c)
  ctx.rotate(0.12)
  ctx.beginPath()
  ctx.roundRect(-s * 0.02, -s * 0.02, s * 0.24, s * 0.24, s * 0.04)
  ctx.fill()
  ctx.restore()
}

function glyphMall(ctx: Ctx2D, s: number): void {
  const c = s / 2
  ctx.beginPath()
  ctx.roundRect(s * 0.28, s * 0.38, s * 0.44, s * 0.36, s * 0.04)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(c, s * 0.36, s * 0.11, Math.PI, 0)
  ctx.stroke()
}

function glyphShopping(ctx: Ctx2D, s: number): void {
  ctx.beginPath()
  ctx.moveTo(s * 0.26, s * 0.32)
  ctx.lineTo(s * 0.74, s * 0.32)
  ctx.lineTo(s * 0.66, s * 0.62)
  ctx.lineTo(s * 0.34, s * 0.62)
  ctx.closePath()
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(s * 0.4, s * 0.71, s * 0.035, 0, Math.PI * 2)
  ctx.arc(s * 0.6, s * 0.71, s * 0.035, 0, Math.PI * 2)
  ctx.fill()
}

function glyphTree(ctx: Ctx2D, s: number): void {
  const c = s / 2
  ctx.beginPath()
  ctx.arc(c, s * 0.42, s * 0.2, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(c, s * 0.52)
  ctx.lineTo(c, s * 0.72)
  ctx.stroke()
}

function glyphConstruction(ctx: Ctx2D, s: number): void {
  ctx.beginPath()
  ctx.moveTo(s * 0.28, s * 0.68)
  ctx.lineTo(s * 0.5, s * 0.28)
  ctx.lineTo(s * 0.72, s * 0.68)
  ctx.closePath()
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(s * 0.38, s * 0.52)
  ctx.lineTo(s * 0.62, s * 0.52)
  ctx.stroke()
}

function glyphRail(ctx: Ctx2D, s: number): void {
  ctx.beginPath()
  ctx.roundRect(s * 0.32, s * 0.3, s * 0.36, s * 0.34, s * 0.06)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(s * 0.32, s * 0.44)
  ctx.lineTo(s * 0.68, s * 0.44)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(s * 0.42, s * 0.7, s * 0.03, 0, Math.PI * 2)
  ctx.arc(s * 0.58, s * 0.7, s * 0.03, 0, Math.PI * 2)
  ctx.fill()
}

const GLYPHS = {
  school: glyphSchool,
  kindergarten: glyphKindergarten,
  mall: glyphMall,
  shopping: glyphShopping,
  park: glyphTree,
  construction: glyphConstruction,
} as const

export type PoiGlyph = keyof typeof GLYPHS

const POI_GLYPH_COLOR_VAR: Record<PoiGlyph, string> = {
  school: '--poi-school',
  kindergarten: '--poi-kindergarten',
  mall: '--poi-mall',
  shopping: '--poi-shopping',
  park: '--park-fg',
  construction: '--status-construction',
}

function poiBadge(kind: PoiGlyph): PinImage {
  const fill = cssVar('--elevated-solid', '#23262c')
  const ring = cssVar('--border-strong', 'rgba(255,255,255,0.18)')
  const glyph = cssVar(POI_GLYPH_COLOR_VAR[kind], '#c9ccd1')
  return badge(26, fill, glyph, ring, GLYPHS[kind])
}

function stationBadge(selected: boolean): PinImage {
  const fill = selected
    ? cssVar('--status-selected', '#d8b45a')
    : cssVar('--lrt-station', '#eef2f5')
  const ring = cssVar('--lrt-station-ring', '#6f9ab0')
  const glyphColor = selected
    ? cssVar('--accent-fg', '#1c1508')
    : cssVar('--surface-solid', '#191c20')
  return badge(30, fill, glyphColor, ring, glyphRail)
}

/** A stretchable pill so a MapLibre symbol layer can size the background to fit price text. */
function pricePill(selected: boolean): StretchableImage {
  const w = 20
  const h = 34
  const size = { w: w * PIXEL_RATIO, h: h * PIXEL_RATIO }
  const canvas = createCanvas(size.w, size.h)
  const ctx = canvas.getContext('2d') as Ctx2D
  const radius = (h / 2) * PIXEL_RATIO
  ctx.clearRect(0, 0, size.w, size.h)
  ctx.beginPath()
  ctx.roundRect(PIXEL_RATIO, PIXEL_RATIO, size.w - PIXEL_RATIO * 2, size.h - PIXEL_RATIO * 2, radius - PIXEL_RATIO)
  ctx.fillStyle = selected
    ? cssVar('--status-selected', '#d8b45a')
    : cssVar('--elevated-solid', '#23262c')
  ctx.fill()
  ctx.lineWidth = PIXEL_RATIO
  ctx.strokeStyle = selected
    ? cssVar('--accent-strong', '#e9cd82')
    : cssVar('--border-strong', 'rgba(255,255,255,0.18)')
  ctx.stroke()
  const image = ctx.getImageData(0, 0, size.w, size.h)
  const inset = radius
  return {
    width: size.w,
    height: size.h,
    data: new Uint8Array(image.data),
    pixelRatio: PIXEL_RATIO,
    content: [inset, PIXEL_RATIO * 3, size.w - inset, size.h - PIXEL_RATIO * 3],
    stretchX: [[inset, size.w - inset]],
    stretchY: [],
  }
}

export const POI_PIN_IDS = ['school', 'kindergarten', 'mall', 'shopping', 'park', 'construction'] as const

export function registerPins(map: MapLibreMap): void {
  for (const kind of POI_PIN_IDS) {
    upsertImage(map, `poi-${kind}`, poiBadge(kind))
  }
  upsertImage(map, 'lrt-station', stationBadge(false))
  upsertImage(map, 'lrt-station-selected', stationBadge(true))
  upsertStretchable(map, 'price-pill', pricePill(false))
  upsertStretchable(map, 'price-pill-selected', pricePill(true))
}

function upsertImage(map: MapLibreMap, id: string, image: PinImage): void {
  const spec = { width: image.width, height: image.height, data: image.data }
  if (map.hasImage(id)) map.updateImage(id, spec)
  else map.addImage(id, spec, { pixelRatio: image.pixelRatio })
}

function upsertStretchable(map: MapLibreMap, id: string, image: StretchableImage): void {
  const spec = {
    width: image.width,
    height: image.height,
    data: image.data,
    content: image.content,
    stretchX: image.stretchX,
    stretchY: image.stretchY,
  }
  if (map.hasImage(id)) map.updateImage(id, spec)
  else map.addImage(id, spec, { pixelRatio: image.pixelRatio })
}
