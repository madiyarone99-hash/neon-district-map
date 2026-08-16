import type { Listing, Phase, Year } from './types'
import { PHASES } from './types'

export const LISTINGS: Listing[] = [
  {
    id: 'prism',
    osmId: 486561788,
    name: 'Prism Tower',
    osmName: 'Sheraton Astana',
    tagline: 'Апартаменты в гостиничном кластере на Кабанбай батыра',
    classLabel: 'A',
    areaSqm: 78,
    amenities: ['lrt', 'shopping'],
    conditions: [
      'Первый взнос от 20%',
      'Рассрочка до сдачи без процентов',
      'Вид на деловой центр',
    ],
    appearYear: 2024,
    phaseByYear: {
      2024: 'excavation',
      2025: 'structure',
      2026: 'structure',
      2027: 'finishing',
      2028: 'handover',
      2029: 'sold',
      2030: 'sold',
      2031: 'sold',
      2032: 'sold',
    },
    prices: [
      { year: 2024, pricePerSqm: 480000 },
      { year: 2025, pricePerSqm: 520000 },
      { year: 2026, pricePerSqm: 610000 },
      { year: 2027, pricePerSqm: 690000 },
      { year: 2028, pricePerSqm: 780000 },
      { year: 2029, pricePerSqm: 820000 },
      { year: 2030, pricePerSqm: 860000 },
      { year: 2031, pricePerSqm: 900000 },
      { year: 2032, pricePerSqm: 940000 },
    ],
    futurePlan: 'К 2030 — ритейл-подиум и переход к станции LRT.',
  },
  {
    id: 'mosque-gate',
    osmId: 243067470,
    name: 'Mosque Gate',
    osmName: 'ЖК «Триумфальный»',
    tagline: 'Семейные корпуса у северных парков',
    classLabel: 'B+',
    areaSqm: 96,
    amenities: ['park', 'school', 'shopping'],
    conditions: [
      'Планировки 2–4 комнаты',
      'Закрытый двор',
      'Эскроу через банк второго уровня',
    ],
    appearYear: 2024,
    phaseByYear: {
      2024: 'planned',
      2025: 'excavation',
      2026: 'structure',
      2027: 'finishing',
      2028: 'handover',
      2029: 'handover',
      2030: 'sold',
      2031: 'sold',
      2032: 'sold',
    },
    prices: [
      { year: 2024, pricePerSqm: 390000 },
      { year: 2025, pricePerSqm: 410000 },
      { year: 2026, pricePerSqm: 470000 },
      { year: 2027, pricePerSqm: 540000 },
      { year: 2028, pricePerSqm: 600000 },
      { year: 2029, pricePerSqm: 640000 },
      { year: 2030, pricePerSqm: 680000 },
      { year: 2031, pricePerSqm: 710000 },
      { year: 2032, pricePerSqm: 740000 },
    ],
    futurePlan: 'После 2029 — wellness-этаж и зелёная терраса.',
  },
  {
    id: 'canal',
    osmId: 230412475,
    name: 'Canal Strip',
    osmName: '',
    tagline: 'Ритейл и жильё у южного контура района',
    classLabel: 'B',
    areaSqm: 64,
    amenities: ['shopping', 'park'],
    conditions: [
      'Коммерция на 1 этаже',
      'Аренда до сдачи разрешена',
      'Льгота по налогу на имущество — 2 года',
    ],
    appearYear: 2025,
    phaseByYear: {
      2025: 'planned',
      2026: 'excavation',
      2027: 'structure',
      2028: 'finishing',
      2029: 'handover',
      2030: 'handover',
      2031: 'sold',
      2032: 'sold',
    },
    prices: [
      { year: 2025, pricePerSqm: 350000 },
      { year: 2026, pricePerSqm: 380000 },
      { year: 2027, pricePerSqm: 430000 },
      { year: 2028, pricePerSqm: 510000 },
      { year: 2029, pricePerSqm: 580000 },
      { year: 2030, pricePerSqm: 620000 },
      { year: 2031, pricePerSqm: 660000 },
      { year: 2032, pricePerSqm: 700000 },
    ],
    futurePlan: 'К 2031 — пешеходная торговая улица вдоль корпуса.',
  },
  {
    id: 'lrt-hub',
    osmId: 108096981,
    name: 'LRT Hub',
    osmName: '',
    tagline: 'Жильё у линии Tarlan и станции «Бәйтерек»',
    classLabel: 'A',
    areaSqm: 54,
    amenities: ['lrt', 'school', 'park'],
    conditions: [
      'Пешком до станции LRT',
      'Smart-home в базовой комплектации',
      'Кешбек 3% при покупке до 2027',
    ],
    appearYear: 2026,
    phaseByYear: {
      2026: 'planned',
      2027: 'excavation',
      2028: 'structure',
      2029: 'finishing',
      2030: 'handover',
      2031: 'handover',
      2032: 'sold',
    },
    prices: [
      { year: 2026, pricePerSqm: 520000 },
      { year: 2027, pricePerSqm: 560000 },
      { year: 2028, pricePerSqm: 640000 },
      { year: 2029, pricePerSqm: 720000 },
      { year: 2030, pricePerSqm: 800000 },
      { year: 2031, pricePerSqm: 850000 },
      { year: 2032, pricePerSqm: 910000 },
    ],
    futurePlan: 'После открытия линии — переоценка локации.',
  },
  {
    id: 'emerald',
    osmId: 289011351,
    name: 'Emerald Court',
    osmName: 'ЖК «Изумрудный квартал»',
    tagline: 'Низкая застройка у медиа-кластера',
    classLabel: 'B',
    areaSqm: 118,
    amenities: ['park', 'lrt', 'school'],
    conditions: [
      'Семейные планировки',
      'Двор без машин',
      'Ограничение этажности корпуса',
    ],
    appearYear: 2027,
    phaseByYear: {
      2027: 'planned',
      2028: 'excavation',
      2029: 'structure',
      2030: 'finishing',
      2031: 'handover',
      2032: 'handover',
    },
    prices: [
      { year: 2027, pricePerSqm: 450000 },
      { year: 2028, pricePerSqm: 480000 },
      { year: 2029, pricePerSqm: 540000 },
      { year: 2030, pricePerSqm: 610000 },
      { year: 2031, pricePerSqm: 680000 },
      { year: 2032, pricePerSqm: 720000 },
    ],
    futurePlan: 'К 2032 — расширение двора и велодорожка к парку.',
  },
  {
    id: 'kazmedia',
    osmId: 230361896,
    name: 'Media Residences',
    osmName: 'Қазмедиа орталығы',
    tagline: 'Лоты в здании медиацентра — без выдуманной высотности',
    classLabel: 'B+',
    areaSqm: 88,
    amenities: ['lrt', 'shopping', 'park'],
    conditions: [
      'Предпродажа до 2028',
      'Минимальный лот — 2 комнаты',
      'Охраняемая территория комплекса',
    ],
    appearYear: 2028,
    phaseByYear: {
      2028: 'planned',
      2029: 'excavation',
      2030: 'structure',
      2031: 'structure',
      2032: 'finishing',
    ],
    prices: [
      { year: 2028, pricePerSqm: 700000 },
      { year: 2029, pricePerSqm: 760000 },
      { year: 2030, pricePerSqm: 850000 },
      { year: 2031, pricePerSqm: 940000 },
      { year: 2032, pricePerSqm: 1050000 },
    ],
    futurePlan: '2033–2035: вторая очередь на соседнем участке, если появится в OSM.',
  },
]

export function findListing(id: string | null): Listing | null {
  if (!id) return null
  return LISTINGS.find((item) => item.id === id) ?? null
}

export function findListingByOsmId(osmId: number): Listing | null {
  return LISTINGS.find((item) => item.osmId === osmId) ?? null
}

export function getPriceAtYear(listing: Listing, year: number): number | null {
  const exact = listing.prices.find((point) => point.year === year)
  if (exact) return exact.pricePerSqm
  const past = listing.prices.filter((point) => point.year <= year).at(-1)
  return past?.pricePerSqm ?? null
}

export function getPhaseAtYear(listing: Listing, year: number): Phase | null {
  if (year < listing.appearYear) return null
  return listing.phaseByYear[year as Year] ?? null
}

export function priceDelta(listing: Listing, year: number): number | null {
  const current = getPriceAtYear(listing, year)
  const prev = getPriceAtYear(listing, year - 1)
  if (current == null || prev == null || prev === 0) return null
  return ((current - prev) / prev) * 100
}

export function phaseIndex(phase: Phase | null): number {
  if (!phase) return -1
  return PHASES.indexOf(phase)
}

export function listingVisibleInYear(listing: Listing, year: number): boolean {
  return year >= listing.appearYear
}
