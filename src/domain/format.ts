const PRICE = new Intl.NumberFormat('ru-KZ', {
  maximumFractionDigits: 0,
})

export function formatPrice(value: number): string {
  return `${PRICE.format(value)} ₸/м²`
}

/** Compact map-label form: 690 000 -> "690K". Used only on the map surface. */
export function formatPriceCompact(value: number): string {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000
    return `${millions % 1 === 0 ? millions : millions.toFixed(1)}M`
  }
  const thousands = Math.round(value / 1000)
  return `${thousands}K`
}

export function formatTotalPrice(pricePerSqm: number, areaSqm: number): string {
  const total = pricePerSqm * areaSqm
  if (total >= 1_000_000) {
    return `${(total / 1_000_000).toFixed(1)} млн ₸`
  }
  return `${PRICE.format(total)} ₸`
}

export function formatHectares(sqm: number): string {
  const hectares = sqm / 10_000
  if (hectares >= 1) return `≈${hectares.toFixed(1)} га`
  return `≈${Math.round(sqm)} м²`
}

export function formatWalkMinutes(minutes: number): string {
  return `≈${minutes} мин пешком`
}

export function formatDelta(value: number): string {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}% за год`
}

export function formatArea(value: number): string {
  return `${value} м²`
}

export function truncateLabel(text: string, max = 22): string {
  const trimmed = text.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max - 1).trimEnd()}…`
}
